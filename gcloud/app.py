import json
import queue

import time
import traceback
from flask import Flask, request, jsonify
import logging
import websocket
from collections import OrderedDict
import threading
from urllib.parse import urlparse, parse_qs

openaiApiKey = 'Bearer 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'
openaiRealtimeUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"

# Initialize logging
logger = logging.getLogger('cloudfunctions.googleapis.com%2Fcloud-functions')
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

app = Flask(__name__)

# 存储用户的 WebSocket 连接
connections = OrderedDict()
MAX_CONNECTIONS = 1  # 最大连接数

class UserConn:
    websocket: websocket.WebSocket
    recvQueue: queue.Queue
    headers = {"Authorization": openaiApiKey, "OpenAI-Beta": "realtime=v1", }
    session = ""

    def __init__(self, uid):
        self.websocket = websocket.WebSocketApp(url=openaiRealtimeUrl, on_open=self.on_open, on_message=self.on_message, on_close=self.on_close, on_error=self.on_error, header=self.headers)
        self.uid = uid
        self.recvQueue = queue.Queue(100)
        self.thread = None
        self.start()
        while not self.websocket.sock or not self.websocket.sock.connected:
            time.sleep(1)
    def on_open(self, ws):
        data = {"type": "response.create", "response": {"modalities": ["text"], "instructions": "Please assist the user.", }}
        ws.send(json.dumps(data))
    def on_error(self,ws):
        logger.info(f"error connection: {self.uid}")
    def on_close(self,ws):
        logger.info(f"close connection: {self.uid}")
    def send_message(self, message_type, message_content):
        try:
            logger.info(f"send message:{message_content}, {message_type}")
            # 向 OpenAI WebSocket 发送请求 根据消息类型处理内容
            if message_type == "audio":  # 构建并发送音频消息 Base64 编码的音频
                data = {"type": "conversation.item.create", "item": {"type": "message", "role": "user", "content": [
                    {"type": "input_audio", "audio": message_content}]}}
                self.websocket.send(json.dumps(data))
                print(111,message_type, data)
            elif message_type == "text":  # 构建并发送文本消息
                data = {"type": "conversation.item.create", "item": {"type": "message", "role": "user", "content": [
                    {"type": "input_text", "text": message_content}]}}
                self.websocket.send(json.dumps(data))
                print(222,message_type,data)
        except:
            logger.error(f"send messag err:{traceback.format_exc()}")
            del connections[self.uid]
            self.websocket.close()
    def on_message(self, ws, data):
        logger.info(f"1123receive data: {data}")
        data = json.loads(data)
        if data["type"] == "response.done":
            self.recvQueue.put(data)
    def run(self):
        print(111)
        self.websocket.run_forever(ping_interval=30, ping_timeout=3)
        print(1112)

    def start(self):
        if not self.thread:
            self.thread = threading.Thread(target=self.run, args=())
            self.thread.start()
    def close(self):
        self.websocket.close()


def connect_to_openai(uid, message_type, message_content):
    try:
        # 检查是否已有连接且状态为开放
        user_conn = connections.get(uid)
        if not user_conn or not user_conn.websocket.sock.connected:
            # 如果连接数超过限制，则关闭最早的连接
            if len(connections) >= MAX_CONNECTIONS:
                oldest_uid, oldest_user_connet = connections.popitem(last=False)
                oldest_user_connet.recvQueue.task_done()
                logger.info(f"Closing oldest connection for uid: {oldest_uid}")
                oldest_user_connet.close()
            logger.info(f"Creating new connection for uid: {uid}")
            # 创建新的 WebSocket 连接
            user_conn = UserConn(uid)
            connections[uid] = user_conn
        user_conn.send_message(message_type, message_content)
        # 等待并返回消息响应
        logger.info(f"waiting response for uid: {uid}")
        response_data = []
        while not response_data:
            if user_conn.recvQueue.empty():
                logger.info(f"response message: {uid} not received")
                time.sleep(1)
                continue
            message = user_conn.recvQueue.get()
            if not message:
                print(f"Connection for uid {uid} has been disconnected.")
                break
            else:
                print(f"Received message for uid {uid}: {message}")
                response_data.append(message)
        return response_data
    except:
        logger.error(f"connect_to_openai err:{traceback.format_exc()}")
        raise Exception("connect_to_openai err")

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"])
)
def create_chat_connection(req: https_fn.Request) -> https_fn.Response:
    if req.method == "GET":
        data = GetParams(req.url)
    else:
        data = json.loads(req.data)
    if not data:
        return https_fn.Response("""{"error": "Invalid request data"}""",400, content_type="application/json")
    uid = data.get("uid")
    if type(uid) == list:
        uid = uid[0]
    message_type = data.get("message_type", "text")  # 新增消息类型
    content = data.get("content")  # 文本或音频内容

    if not uid or not content:
        return https_fn.Response("""{"error": "Invalid request data"}""",400, content_type="application/json")
    try:
        # 使用 asyncio.run 运行 WebSocket 连接
        results = connect_to_openai(uid, message_type, content)
        print(f"123123result: {results}")
        return https_fn.Response(json.dumps({"results": results}), 200, content_type="application/json")
    except:
        logger.info(f"Error connecting to OpenAI WebSocket: {traceback.format_exc()}")
        return https_fn.Response(json.dumps({"error": "Failed to create chat connection"}), 500, content_type="application/json")


