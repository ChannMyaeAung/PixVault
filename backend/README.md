FastAPI backend with:

- JWT Authentication (FastAPI Users)
- Async SQLAlchemy
- PostgreSQL
- ImageKit integration
- Dockerized environment

## Endpoints

POST /auth/register  
POST /auth/jwt/login  
POST /auth/jwt/logout
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/request-verify-token
POST /auth/verify

GET /users/me
PATCH /users/me
GET /users/{id}
PATCH /users/{id}
DELETE /users/{id}

GET /feed  
POST /upload  
DELETE /posts/{id}

## Run Locally

uv sync  
uv run uvicorn app.app:app --reload

## Run with Docker

docker compose up --build
