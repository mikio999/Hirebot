# 1️⃣ Python 3.11 기반의 공식 이미지 사용
FROM python:3.11-slim

# 2️⃣ 작업 디렉토리 설정
WORKDIR /app

# 3️⃣ 필요한 파일 복사 및 패키지 설치
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 4️⃣ 소스코드 전체 복사 (app.py 및 chatbot 폴더 포함)
COPY . .

# 5️⃣ 환경 변수 설정 (Flask 앱 실행 설정)
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# 6️⃣ 컨테이너가 실행될 때 gunicorn으로 Flask 앱 실행 (Cloud Run에서 동적 포트 설정)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "app:app"]

