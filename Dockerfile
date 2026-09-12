# Backend NEXA: motorul C++ de căutare + API-ul FastAPI, într-o singură imagine.
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends g++ make && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) motorul C++ (cei trei algoritmi)
COPY engine/ engine/
RUN cd engine && make CXX=g++

# 2) serverul Python
COPY server/requirements.txt server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt
COPY server/ server/

WORKDIR /app/server
ENV ENGINE_PATH=/app/engine/build/search_engine \
    DATABASE_URL=sqlite:////app/server/data/nexa.db \
    PORT=8000
RUN mkdir -p /app/server/data

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
