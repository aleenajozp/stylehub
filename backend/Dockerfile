FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . /app/

# Ensure entrypoint is executable and permissions work with OpenShift arbitrary UID (group 0)
RUN chmod +x /app/entrypoint.sh && \
    chgrp -R 0 /app && \
    chmod -R g=u /app

EXPOSE 8000

USER 1001

ENTRYPOINT ["/app/entrypoint.sh"]
