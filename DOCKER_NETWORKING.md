# Docker Networking Guide for MERN Application

## Overview

This document explains how Docker networking works in our MERN (MongoDB, Express, React, Node.js) application setup and provides all the commands used.

## Architecture

```
Host Machine (localhost)
│
├── Docker Network: todo-net (bridge)
│   ├── mongodb container (internal only)
│   └── backend container (exposed on port 5000)
│
└── frontend container (exposed on port 5173)
```

## Docker Network Concepts

### 1. Bridge Networks
- Default network type for containers
- Containers can communicate using container names as hostnames
- Provides network isolation from host and other networks

### 2. Port Mapping
- Maps container ports to host ports: `-p host_port:container_port`
- Allows external access to containerized services

### 3. Container-to-Container Communication
- Containers on same network can communicate using container names
- Internal DNS resolution: `mongodb:27017`, `backend:5000`

## Setup Commands

### 1. Create Docker Network
```bash
docker network create todo-net
```
**Purpose:** Creates an isolated bridge network for our containers to communicate

### 2. Start MongoDB Container
```bash
docker run -d \
  --name mongodb \
  --network todo-net \
  mongo:7.0
```
**Details:**
- `--name mongodb`: Container name (becomes hostname in network)
- `--network todo-net`: Joins the custom network
- No port mapping: Only accessible within Docker network
- MongoDB runs on default port 27017 internally

### 3. Build Backend Image
```bash
cd server
docker build -t mern-backend .
```
**Purpose:** Creates backend image from Dockerfile

### 4. Run Backend Container
```bash
docker run -d \
  --name backend \
  --network todo-net \
  -p 5000:5000 \
  -e MONGO_URI=mongodb://mongodb:27017/todoapp \
  -e PORT=5000 \
  mern-backend
```
**Details:**
- `-p 5000:5000`: Maps host port 5000 to container port 5000
- `MONGO_URI=mongodb://mongodb:27017/todoapp`: Uses container name as hostname
- Backend can reach MongoDB using hostname `mongodb`

### 5. Build Frontend Image
```bash
cd client
docker build \
  --build-arg "VITE_API_URL=http://localhost:5000/api" \
  -t mern-frontend .
```
**Details:**
- `--build-arg`: Passes API URL at build time
- Uses `localhost:5000` because browser runs on host, not in container
- Vite embeds this URL into the built JavaScript bundle

### 6. Run Frontend Container
```bash
docker run -d \
  --name frontend \
  -p 5173:5173 \
  mern-frontend
```
**Details:**
- `-p 5173:5173`: Exposes frontend to host browser
- No network specified: Uses default bridge network
- Frontend doesn't need internal container communication

## Network Communication Flow

### 1. Browser → Frontend Container
```
Browser (localhost:5173) → Docker Host (port 5173) → Frontend Container
```

### 2. Frontend → Backend (from Browser)
```
Browser JavaScript → localhost:5000/api → Docker Host (port 5000) → Backend Container
```

### 3. Backend → MongoDB (Internal Network)
```
Backend Container → todo-net → mongodb:27017 → MongoDB Container
```

## Key Networking Principles

### 1. Container Name Resolution
- Containers on same network can use container names as hostnames
- Example: Backend connects to `mongodb://mongodb:27017`

### 2. Host vs Container Networking
- **Host perspective:** Containers accessible via `localhost:mapped_port`
- **Container perspective:** Other containers accessible via `container_name:port`

### 3. Build-time vs Runtime Configuration
- **Frontend:** API URL set at build time (`--build-arg VITE_API_URL`)
- **Backend:** MongoDB URI set at runtime (`-e MONGO_URI`)

## Verification Commands

### Check Network
```bash
docker network ls
docker network inspect todo-net
```

### Check Container Status
```bash
docker ps
docker logs backend
docker logs frontend
```

### Test Connectivity
```bash
# Test backend API from host
curl http://localhost:5000/api/tasks

# Test from inside backend container
docker exec -it backend sh -c "curl http://mongodb:27017"

# Test from inside frontend container
docker exec -it frontend sh -c "curl http://localhost:5000/api/tasks"
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if containers are running: `docker ps`
   - Verify port mappings
   - Check container logs: `docker logs <container_name>`

2. **Network Resolution Failed**
   - Ensure containers are on same network: `docker network inspect todo-net`
   - Verify container names are correct

3. **API URL Issues**
   - Frontend: Check build-arg was set correctly
   - Backend: Verify environment variables: `docker exec backend env`

### Debug Network Connectivity
```bash
# Check which containers are on the network
docker network inspect todo-net

# Test DNS resolution from container
docker exec -it backend nslookup mongodb

# Check if ports are accessible
docker exec -it backend nc -zv mongodb 27017
```

## Why This Architecture Works

1. **Isolation:** Each service runs in its own container with defined interfaces
2. **Scalability:** Containers can be scaled independently
3. **Development:** Local development mirrors production networking
4. **Security:** Database not exposed to host, only accessible via backend
5. **Portability:** Same networking works across different environments

## Alternative Approaches

### Using Host Network
```bash
docker run --network host backend
```
**Pros:** Simplified networking, container uses host's network stack
**Cons:** Less isolation, potential port conflicts

### Using Docker Compose (Not Used Here)
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    networks: [todo-net]
  backend:
    build: ./server
    networks: [todo-net]
    ports: ["5000:5000"]
networks:
  todo-net:
```
**Note:** We used individual `docker run` commands as requested, but Docker Compose provides declarative networking.