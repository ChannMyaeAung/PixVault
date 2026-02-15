# PixVault

A full-stack media sharing application built with:

- FastAPI (Backend)
- PostgreSQL
- Next.js (App Router)
- Docker & Docker Compose
- JWT Authentication
- ImageKit Cloud Storage

## Features

- JWT Authentication (Login/Register)
- Protected Routes
- Media Upload (Image/Video)
- User-owned posts
- Delete own posts
- Dockerized full-stack environment

## Architecture

Frontend (Next.js)
→ API Proxy (Route Handlers)
→ FastAPI Backend
→ PostgreSQL
→ ImageKit Cloud Storage

## Run with Docker

```bash
docker compose up --build
