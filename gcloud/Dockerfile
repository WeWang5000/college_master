# 使用官方 Python 运行环境
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 复制当前目录内容到容器中
COPY gcloud /app

# 安装所需依赖项
RUN pip install flask flask_socketio

# 暴露端口 80
EXPOSE 80

# 启动服务
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80"]