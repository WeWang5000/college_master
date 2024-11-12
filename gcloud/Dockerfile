# 使用官方 Python 运行环境
FROM python:3.12-slim

# 设置工作目录
WORKDIR /app

# 复制当前目录内容到容器中
COPY app.py /app
COPY requirements.txt /app

# 安装所需依赖项
RUN pip3 install -r /app/requirements.txt

# 暴露端口 8080
EXPOSE 8080

# 启动服务
CMD ["python3", "/app/app.py"]
