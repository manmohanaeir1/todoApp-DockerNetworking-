# Docker Compose Guide for MERN Application

## Overview

Docker Compose is a tool for defining and running multi-container Docker applications. It uses a YAML file to configure application services and creates/manages all services with a single command.

## Why Use Docker Compose?

### Problems with Individual Docker Commands
```bash
# Manual approach requires multiple commands:
docker network create todo-net
docker run -d --name mongodb --network todo-net mongo:7.0
docker run -d --name backend --network todo-net -p 5000:5000 -e MONGO_URI=mongodb://mongodb:27017/todoapp mern-backend
docker run -d --name frontend -p 5173:5173 mern-frontend
```

### Benefits of Docker Compose
1. **Single Configuration File**: All services defined in `docker-compose.yml`
2. **One Command**: Start entire application with `docker-compose up`
3. **Service Discovery**: Automatic networking between containers
4. **Dependency Management**: Control startup order with `depends_on`
5. **Environment Management**: Centralized environment variables
6. **Development Workflow**: Easy to recreate, share, and scale

## Our docker-compose.yml Breakdown

```yaml
# Three services: MongoDB, backend API, and frontend
services:
  mongodb:
    image: mongo:7.0
    container_name: mongodb
    restart: always

  backend:
    build: ./server
    container_name: backend
    restart: always
    environment:
      - MONGO_URI=mongodb://mongodb:27017/todoapp
      - PORT=5000
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./client
      args:
        VITE_API_URL: http://localhost:5000/api
    container_name: frontend
    restart: always
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

### Service Definitions Explained

#### 1. MongoDB Service
```yaml
mongodb:
  image: mongo:7.0              # Use official MongoDB image
  container_name: mongodb       # Fixed container name for networking
  restart: always              # Auto-restart if container stops
```
**Purpose**: Database service, only accessible within Docker network

#### 2. Backend Service
```yaml
backend:
  build: ./server              # Build from local Dockerfile
  container_name: backend      # Fixed name for service discovery
  restart: always
  environment:                 # Runtime environment variables
    - MONGO_URI=mongodb://mongodb:27017/todoapp  # Uses service name as hostname
    - PORT=5000
  ports:
    - "5000:5000"              # Expose API to host
  depends_on:
    - mongodb                  # Wait for MongoDB before starting
```
**Purpose**: API server that connects to MongoDB and serves REST endpoints

#### 3. Frontend Service
```yaml
frontend:
  build:
    context: ./client          # Build context directory
    args:
      VITE_API_URL: http://localhost:5000/api  # Build-time argument
  container_name: frontend
  restart: always
  ports:
    - "5173:5173"             # Expose web app to host
  depends_on:
    - backend                 # Wait for backend before starting
```
**Purpose**: React application that calls backend API

## Docker Compose Commands

### Essential Commands

#### Start Services
```bash
# Start all services in background
docker-compose up -d

# Start with build (rebuild images if needed)
docker-compose up -d --build

# Start in foreground (see logs)
docker-compose up
```

#### Stop Services
```bash
# Stop all services
docker-compose stop

# Stop and remove containers, networks
docker-compose down

# Stop, remove, and delete volumes (data loss!)
docker-compose down -v
```

#### View Services
```bash
# Show running services
docker-compose ps

# Show all services (including stopped)
docker-compose ps -a
```

#### Logs and Debugging
```bash
# View logs from all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Show last 50 lines
docker-compose logs --tail=50
```

#### Individual Service Management
```bash
# Restart specific service
docker-compose restart backend

# Stop specific service
docker-compose stop frontend

# Start specific service
docker-compose start mongodb

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

#### Scaling (if needed)
```bash
# Run multiple instances of a service
docker-compose up -d --scale backend=3
```

### Advanced Commands

#### Execute Commands in Running Containers
```bash
# Open shell in backend container
docker-compose exec backend sh

# Run command in backend container
docker-compose exec backend npm ls

# Check MongoDB from backend container
docker-compose exec backend curl mongodb:27017
```

#### Development Workflow
```bash
# Rebuild and restart after code changes
docker-compose down && docker-compose up -d --build

# View real-time logs during development
docker-compose logs -f backend frontend
```

## Networking in Docker Compose

### Automatic Network Creation
- Docker Compose automatically creates a network named `{project}_default`
- All services can communicate using service names as hostnames
- No need to manually create networks

### Service Discovery
```yaml
# Backend can connect to MongoDB using service name
environment:
  - MONGO_URI=mongodb://mongodb:27017/todoapp
#                     ↑
#              Service name becomes hostname
```

### Port Mapping vs Internal Communication
```yaml
ports:
  - "5000:5000"  # Host:Container - Exposes to outside world

# Internal communication doesn't need port mapping
# Services communicate directly: http://backend:5000
```

## Environment Variables

### Build-time vs Runtime

#### Build-time (Frontend)
```yaml
build:
  args:
    VITE_API_URL: http://localhost:5000/api  # Embedded in built code
```

#### Runtime (Backend)
```yaml
environment:
  - MONGO_URI=mongodb://mongodb:27017/todoapp  # Available when container runs
```

### Alternative Environment File
```yaml
# Instead of inline environment:
env_file:
  - ./server/.env  # Load from file
```

## Startup Order and Dependencies

### depends_on Behavior
```yaml
backend:
  depends_on:
    - mongodb    # Wait for mongodb container to start
```

**Important**: `depends_on` only waits for container start, not service readiness.

### Service Readiness
For production, use health checks:
```yaml
mongodb:
  image: mongo:7.0
  healthcheck:
    test: ["CMD", "mongo", "--eval", "db.adminCommand('ismaster')"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

## Volumes and Data Persistence

### Current Setup (No Persistence)
- MongoDB data is lost when container is removed
- Good for development, not production

### Add Persistence
```yaml
mongodb:
  image: mongo:7.0
  volumes:
    - mongodb_data:/data/db  # Named volume for data persistence

volumes:
  mongodb_data:  # Define named volume
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Port Already in Use
```
Error: bind: address already in use
```
**Solution**: Change host port or stop conflicting service
```yaml
ports:
  - "5001:5000"  # Use different host port
```

#### 2. Build Failures
```
ERROR: Service 'backend' failed to build
```
**Solution**: Check Dockerfile and build context
```bash
# Build individually to see detailed errors
docker-compose build backend
```

#### 3. Service Can't Connect
```
Connection refused: mongodb:27017
```
**Solutions**:
- Check service names match in configuration
- Verify services are on same network
- Check service startup order

#### 4. Environment Variables Not Working
**Frontend**: Build args must be set at build time
**Backend**: Environment variables available at runtime

### Debugging Commands
```bash
# Check service status
docker-compose ps

# Inspect networks
docker network ls
docker network inspect $(docker-compose ps -q | head -1 | xargs docker inspect -f '{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}')

# View service configuration
docker-compose config

# Check port mappings
docker-compose port backend 5000
```

## Production Considerations

### Security
```yaml
# Don't expose MongoDB port in production
mongodb:
  # Remove ports mapping for security
  # ports:
  #   - "27017:27017"
```

### Resource Limits
```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 512M
        cpus: '0.5'
```

### Health Checks
```yaml
backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Multi-Stage Builds
For smaller production images, use multi-stage Dockerfiles:
```dockerfile
# Frontend Dockerfile with multi-stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Comparison: Individual Commands vs Docker Compose

### Individual Docker Commands (Manual)
```bash
# Network setup
docker network create todo-net

# Start services
docker run -d --name mongodb --network todo-net mongo:7.0
docker run -d --name backend --network todo-net -p 5000:5000 \
  -e MONGO_URI=mongodb://mongodb:27017/todoapp mern-backend
docker run -d --name frontend -p 5173:5173 mern-frontend

# Management
docker logs backend
docker stop backend frontend mongodb
docker rm backend frontend mongodb
docker network rm todo-net
```

### Docker Compose (Declarative)
```bash
# Start everything
docker-compose up -d

# Management
docker-compose logs
docker-compose stop
docker-compose down
```

## Best Practices

### 1. Project Structure
```
project/
├── docker-compose.yml
├── server/
│   └── Dockerfile
├── client/
│   └── Dockerfile
└── README.md
```

### 2. Environment Files
```yaml
# Use environment files for different stages
env_file:
  - .env.development  # or .env.production
```

### 3. Override Files
Create `docker-compose.override.yml` for local development:
```yaml
# docker-compose.override.yml
services:
  backend:
    volumes:
      - ./server:/app  # Live code reloading
    environment:
      - NODE_ENV=development
```

### 4. Version Pinning
```yaml
version: '3.8'  # Specify version for consistency

services:
  mongodb:
    image: mongo:7.0.4  # Pin specific version, not just 7.0
```

## Summary

Docker Compose transforms complex multi-container applications into simple, declarative configuration. For our MERN stack:

- **Single Command**: `docker-compose up -d` starts MongoDB, backend, and frontend
- **Service Discovery**: Containers find each other by service names
- **Dependency Management**: Services start in correct order
- **Environment Consistency**: Same setup across development, testing, and production
- **Team Collaboration**: Shared configuration file ensures everyone has identical environment

This approach eliminates the "works on my machine" problem and streamlines the development workflow.