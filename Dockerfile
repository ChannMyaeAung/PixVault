#######################################
# Backend Stage (shared for dev/prod)
#######################################
FROM python:3.12-slim AS backend

WORKDIR /app

RUN pip install uv

ENV UV_PROJECT_ENVIRONMENT=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen

COPY backend/ .

CMD ["uv", "run", "uvicorn", "app.app:app", "--host", "0.0.0.0", "--port", "8000"]


#######################################
# Frontend Production Build Stage
#######################################
FROM node:20-slim AS frontend-builder

WORKDIR /app

RUN npm install -g pnpm

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ .

RUN pnpm build


#######################################
# Frontend Production Runtime
#######################################
FROM node:20-slim AS frontend-prod

WORKDIR /app

RUN npm install -g pnpm

ENV NODE_ENV=production

COPY --from=frontend-builder /app ./

EXPOSE 3000

CMD ["pnpm", "start"]
