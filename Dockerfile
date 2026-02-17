# Backend stage
FROM python:3.12-slim as backend

WORKDIR /app

# Install uv
RUN pip install uv

# Install dependencies outside the bind mount
ENV UV_PROJECT_ENVIRONMENT=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy dependency files first (better layer caching)
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy rest of project
COPY backend/ .

CMD ["uv", "run", "uvicorn", "app.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Frontend stage
FROM node:20-alpine as frontend

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY frontend/ .

# Expose port
EXPOSE 3000

# Start in dev mode for hot reload
CMD ["pnpm", "dev"]