FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DONTOVERPAY_DATA=/data

WORKDIR /app

COPY requirements.txt .

# pywin32 is Windows-only and cannot be installed in the Linux container.
RUN sed '/^pywin32==/d' requirements.txt > /tmp/requirements-docker.txt \
    && pip install --no-cache-dir -r /tmp/requirements-docker.txt \
    && python -m playwright install --with-deps chromium \
    && mkdir -p /root/.scrapling \
    && touch /root/.scrapling/.installed

COPY app/ ./app/

RUN mkdir -p /data

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/products/', timeout=3).read()" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
