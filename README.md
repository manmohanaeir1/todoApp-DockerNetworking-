# Task Manager (MERN) — README

Short description
- **Project:** Simple Task Manager built with MongoDB, Express, React, and Node (MERN).
- **Purpose:** Demo app for learning Docker networking and deployment of a MERN stack.

Quick links
- **Docker Networking guide:** `DOCKER_NETWORKING.md` — explains container networking, bridge networks, and commands.
- **Docker Compose guide:** `DOCKER_COMPOSE_GUIDE.md` — explains the Compose file, commands and troubleshooting.

Helpful links (relative)
- Docker networking doc: ./DOCKER_NETWORKING.md
- Docker Compose doc: ./DOCKER_COMPOSE_GUIDE.md

Quick start (using Docker Compose)
1. Build and start all services (MongoDB, backend, frontend):
```bash
cd /path/to/project
docker-compose up -d --build
```
2. Check logs if needed:
```bash
docker-compose logs -f
```
3. Stop and remove services:
```bash
docker-compose down
```

Quick start (without Compose — individual containers)
1. Create network (optional):
```bash
docker network create todo-net
```
2. Start/database and backend (example):
```bash
docker run -d --name mongodb --network todo-net mongo:7.0
docker build -t mern-backend ./server
docker run -d --name backend --network todo-net -p 5000:5000 -e MONGO_URI=mongodb://mongodb:27017/todoapp mern-backend
```
3. Build and run frontend (ensure frontend was built with correct API URL):
```bash
docker build --build-arg "VITE_API_URL=http://localhost:5000/api" -t mern-frontend ./client
docker run -d --name frontend -p 5173:5173 mern-frontend
```

Where to read more
- Read the Docker networking details: `DOCKER_NETWORKING.md`
- Read the Compose guide: `DOCKER_COMPOSE_GUIDE.md`

If you want, I can also:
- Add these quick-start commands into `package.json` scripts, or
- Create a short `Makefile` to run the common commands.

---
Generated on: 2025-12-02
