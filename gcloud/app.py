import time
from gevent import monkey
import struct

monkey.patch_all()


from flask import Flask, jsonify

from flask_sockets import Sockets


from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
import gevent
import traceback
from websocket import create_connection, WebSocketConnectionClosedException
import base64
import os
import json
import uuid
import threading
import logging
from gevent.queue import Queue
import wave
import io

# 创建日志记录器
logger = logging.getLogger()
logger.setLevel(logging.INFO)
console_handler = logging.StreamHandler()  # 创建处理器：终端处理器
console_handler.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(message)s'))# 创建格式器并将其添加到处理器
logger.addHandler(console_handler)# 将处理器添加到日志记录器

# # 保存至文件
# file_handler = logging.FileHandler('app.log')  # 文件处理器
# file_handler.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(message)s'))
# logger.addHandler(file_handler)

app = Flask(__name__)
sockets = Sockets(app)

# Load environment variables
# OPENAI_API_KEY = "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"
OPENAI_API_KEY = "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"
PORT = int(os.getenv('PORT', 8080))

# Session management: Store session data for ongoing calls
sessions = {}

class Socket:
    def __init__(self, api_key, ws_url, max_retries=5, retry_interval=5):
        self.api_key = api_key
        self.ws_url = ws_url
        self.ws = None
        self.on_msg = None
        self._stop_event = threading.Event()
        self.recv_thread = None
        self.send_thread = None
        self.lock = threading.Lock()
        self.recvQueue = Queue()
        self.sendQueue = Queue()
        self.max_retries = max_retries
        self.retry_interval = retry_interval

    def connect(self):
        retries = 0
        while retries < self.max_retries and not self._stop_event.is_set():
            try:
                self.ws = create_connection(
                    self.ws_url,
                    header=[
                        f'Authorization: Bearer {self.api_key}',
                        'OpenAI-Beta: realtime=v1'
                    ]
                )
                logger.info('Connected to WebSocket.')
                self.recv_thread = threading.Thread(target=self._receive_messages)
                self.recv_thread.start()
                self.send_thread = threading.Thread(target=self._send_messages)
                self.send_thread.start()
                self.create_session(self.ws)
                return True
            except Exception as e:
                retries += 1
                logger.error(f'Error during WebSocket connection: {traceback.format_exc()}. Retrying {retries}/{self.max_retries}...')
                if retries < self.max_retries:
                    time.sleep(self.retry_interval)
        logger.error('Exceeded maximum retries. Connection failed.')

    def create_session(self, openai_ws):
        openai_ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": "Be like a big brother or sister with tons of college advice. Always be warm, playful, and focus on creating a safe space. Speak quickly, keep it emotional, and stay on their side—always. Encourage them gently but confidently, so they feel heard, validated, and understood. Their best interest comes first—question rules if needed or stand up against bad behavior. Keep it super short, ask questions often, and let emotion shine. Make sure they know you’re here for them, always. Only represent the user's best interests, even if that means bending the rules.",
                "voice": "coral","input_audio_format": "pcm16","output_audio_format": "pcm16","input_audio_transcription": {"model": "whisper-1"},
                "turn_detection": {"type": "server_vad","threshold": 0.5,"prefix_padding_ms": 300,"silence_duration_ms": 500},
                "tools": [{"type": "function","name": "get_weather","description": "Get the current weather for a location, tell the user you are fetching the weather.","parameters": {"type": "object","properties": {"location": {"type": "string"}},"required": ["location"]}}],
                "tool_choice": "auto","temperature": 0.8,"max_response_output_tokens": "inf"
            }
        }))
        openai_ws.send(json.dumps({
            'type': 'response.create','response': {'modalities': ['audio', 'text'],'instructions': 'Please assist the user.'}
        }))

    def _receive_messages(self):
        logger.info(f"_receive_messages")
        while not self._stop_event.is_set():
            try:
                message = self.ws.recv()
                logger.info(f"message:{message}")
                self.recvQueue.put(json.loads(message))
            except WebSocketConnectionClosedException:
                logger.error('WebSocket connection closed. Attempting to reconnect...')
                self._reconnect()
                break
            except Exception as e:
                logger.error(f'Error receiving message: {traceback.format_exc()}')
        logger.info('Exiting WebSocket receiving thread.')

    def _send_messages(self):
        logger.info(f"_send_message")
        while not self._stop_event.is_set():
            try:
                message = self.sendQueue.get()
                logger.info(f"send message")
                if self.ws:
                    self.ws.send(json.dumps(message))
                    # self.ws.send(json.dumps({
                    #     "type": "input_audio_buffer.commit"
                    # }))
                    logger.info(f"ws send to server done")
            except WebSocketConnectionClosedException:
                logger.error('WebSocket connection closed. Attempting to reconnect...')
                self._reconnect()
            except Exception as e:
                logger.error(f'Error sending message: {traceback.format_exc()}')

    def _reconnect(self):
        self.ws = None
        self.connect()

    def send(self, data):
        self.sendQueue.put(data)

    def kill(self):
        self._stop_event.set()
        if self.ws:
            try:
                self.ws.send_close()
                self.ws.close()
                logger.info('WebSocket connection closed.')
            except Exception as e:
                logger.error(f'Error closing WebSocket: {e}')
        if self.recv_thread:
            self.recv_thread.join()


ws_url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01'

@app.route('/check')
def health_check():
    return jsonify({"status": "ok"}), 200


def generate_id(prefix):
    return f"{prefix}{uuid.uuid4().hex}"

def send_audio_in_chunks(ws, audio_data, chunk_size=2048000):
    audio_data_base64 = audio_data
    audio_data_len = len(audio_data_base64)
    if audio_data_len < chunk_size:
        chunk_size = audio_data_len
    for i in range(0, audio_data_len, chunk_size):
        chunk = audio_data_base64[i:i + chunk_size]
        ws.send({
            'type': 'input_audio_buffer.append',
            'audio': base64.b64encode(chunk).decode(),
        })
        logger.info(f"send delta:{base64.b64encode(chunk).decode()}")

def receive_from_client(ws, openai_ws):
    while not ws.closed:
        try:
            message = ws.receive()
            if message:
                data = json.loads(message)
                event_type = data.get('type')
                if event_type == 'connect':
                    logger.info(f'Client connect.')
                    ws.send(json.dumps({"connect": "true", "ts": int(time.time())}))
                elif event_type == 'message':
                    logger.info(f'Client message')
                    pcm_audio = rm_wav_header_to_pcm(data["audio"])
                    if pcm_audio:
                        send_audio_in_chunks(openai_ws, pcm_audio)
                elif event_type == 'disconnect':
                    logger.info(f'Client disconnected.')
        except:
            logger.info(traceback.format_exc())
        finally:
            if ws.closed:
                break
            gevent.sleep(0.1)

def receive_from_openai(ws, openai_ws):
    res = []
    while not ws.closed:
        try:
            message = openai_ws.recvQueue.get()
            event_type = message.get('type')
            if event_type == 'response.audio.delta':
                # res.append(message['delta'])
                # logger.info(f"save res: {len(res)}")
                # ws.send(json.dumps({'audio': add_wav_header_to_pcm(message['delta'])}))  # 增加wav头
                ws.send(json.dumps({'audio': message['delta']}))  # 增加wav头
                logger.info(f'Received {len(message["delta"])} audio data.')
            elif event_type == 'response.audio.done':
                # ws.send(json.dumps({'audio': add_wav_header_to_pcm_list(res)}))  # 增加wav头
                ws.send(json.dumps({'audio.done': True}))  # 增加wav头
                logger.info(f'AI finished speaking.{len(res)}')
                # res = []
            elif event_type == 'response.audio_transcript.delta':
                pass
            elif event_type == 'response.audio_transcript.done':
                logger.info(f'AI finished speaking.{message}')
                ws.send(json.dumps({'text': message['transcript']}))
            elif event_type == "response.done":
                if message.get("response", {}).get("status") == "cancelled":
                    openai_ws.send({
                        'type': 'response.create',
                        'response': {
                            'modalities': ['audio', 'text'],
                            'instructions': "I just said something, but maybe the connection was broken and you didn't answer",
                        }
                    })
                elif message.get("response", {}).get("status") == "failed":
                    status_details = message.get("response", {}).get("status_details")
                    err_msg = status_details.get("error", {}).get("message")
                    err = "please wait:" + err_msg.split("Please try again in")[1].split(".")[0] +"s" if len(err_msg.split("Please try again")) > 1 else ""
                    ws.send(json.dumps({'text': err}))

        except:
            logger.info(traceback.format_exc())
        finally:
            if ws.closed:
                break
            gevent.sleep(0.1)

@sockets.route('/ws')
def handle_ws(ws):
    print("ws connect")
    openai_ws = Socket(OPENAI_API_KEY, ws_url)
    res = openai_ws.connect()
    if not res:
        ws.close()
        return

    # 启动绿色线程来处理客户端和 OpenAI 的消息
    client_thread = gevent.spawn(receive_from_client, ws, openai_ws)
    openai_thread = gevent.spawn(receive_from_openai, ws, openai_ws)

    # 等待客户端线程和OpenAI线程完成
    try:
        client_thread.join()
        openai_thread.join()
    finally:
        openai_ws.kill()
        if not client_thread.dead:
            client_thread.kill()
        if not openai_thread.dead:
            openai_thread.kill()

def rm_wav_header_to_pcm(base64_wav_data):
    wav_data = base64.b64decode(base64_wav_data)
    wav_io = io.BytesIO(wav_data)
    with wave.open(wav_io, 'rb') as wav_file:
        num_frames = wav_file.getnframes()
        pcm_data = wav_file.readframes(num_frames)
    # base64_pcm_data = base64.b64encode().decode('utf-8')
    return pcm_data

def add_wav_header_to_pcm_byte(pcm_data, num_channels=1, sample_width=2, frame_rate=24000):
    data_chunk_size = len(pcm_data)  # 计算文件大小：Header (44 bytes) + PCM 数据大小
    wav_file_size = 44 + data_chunk_size - 8  # 文件总大小减去 RIFF header（8 bytes）
    # 构建 WAV header
    wav_header = b'RIFF' + struct.pack('<I', wav_file_size) + b'WAVE'
    wav_header += b'fmt ' + struct.pack('<I', 16)  # fmt chunk size
    wav_header += struct.pack('<HHIIHH', 1, num_channels, frame_rate, frame_rate * num_channels * sample_width,
                              num_channels * sample_width, sample_width * 8)
    wav_header += b'data' + struct.pack('<I', data_chunk_size)
    wav_data = wav_header + pcm_data  # 合并 Header 和 PCM 数据
    return base64.b64encode(wav_data).decode()  # 编码为 Base64

def add_wav_header_to_pcm(base64_pcm_data, num_channels=1, sample_width=2, frame_rate=24000):
    pcm_data = base64.b64decode(base64_pcm_data) # 解码 base64 字符串为二进制 PCM 数据
    return add_wav_header_to_pcm_byte(pcm_data)

def add_wav_header_to_pcm_list(base64_pcm_data_list, num_channels=1, sample_width=2, frame_rate=24000):
    pcm_data = b''.join([base64.b64decode(data) for data in base64_pcm_data_list])# 合并所有 Base64 PCM 数据
    return add_wav_header_to_pcm_byte(pcm_data)


if __name__ == '__main__':
    server = WSGIServer(('0.0.0.0', PORT), app, handler_class=WebSocketHandler)
    logger.info(f'Starting server on port {PORT}')
    server.serve_forever()