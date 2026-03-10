#######################################
# Backend Stage (shared for dev/prod)
#######################################
FROM python:3.12-slim AS backend

WORKDIR /app

RUN pip install uv

ENV UV_PROJECT_ENVIRONMENT=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen

COPY backend/ .

EXPOSE 8000

CMD ["sh", "-c", "uv run uvicorn app.app:app --host 0.0.0.0 --port ${PORT:-8000}"]
