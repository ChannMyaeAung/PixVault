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

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PixVault.git
   cd PixVault
   ```

2. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` and add your ImageKit API keys (sign up at [ImageKit](https://imagekit.io/)) and any custom DB credentials if needed.

3. Run the application:
   ```bash
   docker compose up --build
   ```

4. Access:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8001/docs
   - Database: localhost:5433 (user: postgres, password: as in .env)
