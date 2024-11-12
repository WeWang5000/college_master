

```shell
# 项目启动
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# 设置 Google Cloud 项目 ID
gcloud auth login
gcloud config set project iwikapp
gcloud services enable artifactregistry.googleapis.com
gcloud auth configure-docker us-central1-docker.pkg.dev
gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://us-central1-docker.pkg.dev

# 构建 Docker 镜像
docker buildx build --platform linux/amd64 -t us-central1-docker.pkg.dev/iwikapp/realtime-service/realtime-service --push .
```


