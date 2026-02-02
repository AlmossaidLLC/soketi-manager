<div align="center">

# 🚀 Soketi App Manager

![Logo](./public/logo.svg)

**A complete Docker solution with Soketi WebSocket server and App Manager running in a single container**

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)
[![Soketi](https://img.shields.io/badge/Soketi-1.4.16-6366f1?style=flat-square)](https://soketi.app/)
[![GHCR](https://img.shields.io/badge/GHCR-ghcr.io/almossaidllc/soketi--manager-blue?style=flat-square&logo=github)](https://github.com/orgs/AlmossaidLLC/packages/container/package/soketi-manager)

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API](#-api-endpoints) • [Development](#-development)

</div>

---

## 📖 About

**Soketi App Manager** is an open-source solution that combines the power of [Soketi](https://soketi.app/) WebSocket server with a modern, web-based application management interface. Everything runs seamlessly in a single Docker container, making deployment and management incredibly simple.

Perfect for developers who need:
- Real-time WebSocket capabilities via Soketi
- Visual app management without touching configuration files
- A testing playground for WebSocket connections
- Production-ready deployment in minutes

## ✨ Features

- 🐳 **Single Docker Image** - Both Soketi and App Manager in one container
- 🚀 **Web-based App Management** - Create, edit, and delete Soketi apps via intuitive web UI
- 🧪 **Interactive Playground** - Test your apps with real-time send/receive functionality
- 🔄 **Process Management** - App Manager can restart Soketi directly (not via Docker)
- 🎨 **Modern UI** - Beautiful dark theme with Tailwind CSS (shadcn/ui style)
- 📊 **Real-time Dashboard** - Monitor and manage all your WebSocket apps from one place
- 🔒 **Production Ready** - Health checks, auto-restart, and proper process management
- ⚡ **Zero Configuration** - Get started with a single `docker-compose up` command

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- (Optional) Node.js 18+ for local development

### Installation

#### Option 1: Using Pre-built Image from GitHub Container Registry (Recommended)

**✨ Zero Configuration Setup** - Just two commands! The config file is automatically created.

```bash
# Step 1: Pull the image
docker pull ghcr.io/almossaidllc/soketi-manager:latest

# Step 2: Run the container (that's it - no volume mount needed!)
docker run -d \
  --name soketi-app-manager \
  -p 3000:3000 \
  -p 6001:6001 \
  ghcr.io/almossaidllc/soketi-manager:latest
```

**That's it!** The `soketi.json` config file is automatically created inside the container on first run. No manual configuration needed!

**Alternative: Using docker-compose** (if you prefer):
```bash
docker-compose -f docker-compose.ghcr.yml up -d
```

**Optional: Persist config across container restarts**

If you want your config to persist when you remove/recreate the container, use a volume:

```bash
# Using a named volume (recommended - Docker manages it)
docker run -d \
  --name soketi-app-manager \
  -p 3000:3000 \
  -p 6001:6001 \
  -v soketi-config:/app/config:rw \
  -e SOKETI_CONFIG_FILE=/app/config/soketi.json \
  ghcr.io/almossaidllc/soketi-manager:latest

# Or mount a local file (if you want to edit it directly)
docker run -d \
  --name soketi-app-manager \
  -p 3000:3000 \
  -p 6001:6001 \
  -v $(pwd)/soketi.json:/app/config/soketi.json:rw \
  -e SOKETI_CONFIG_FILE=/app/config/soketi.json \
  ghcr.io/almossaidllc/soketi-manager:latest
```

**Note**: If you mount a local file that doesn't exist, the container will automatically create it with default values on first run!

#### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/soketi-app-manager.git
cd soketi-app-manager

# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f
```

That's it! Your Soketi App Manager is now running.

### Docker Image

The Docker image is automatically built and pushed to GitHub Container Registry on every push to `main`:

- **Image**: `ghcr.io/almossaidllc/soketi-manager:latest`
- **Registry**: [GitHub Container Registry](https://github.com/orgs/AlmossaidLLC/packages/container/package/soketi-manager)
- **Tags**: `latest` (main branch), `main-<sha>` (specific commits)

### Access Services

Once started, access the following services:

| Service | URL | Description |
|---------|-----|-------------|
| **App Manager Dashboard** | http://localhost:3000 | Web UI for managing apps |
| **Playground** | http://localhost:3000/playground.html | Test WebSocket connections |
| **Soketi WebSocket** | ws://localhost:6001 | WebSocket endpoint |
| **Soketi HTTP API** | http://localhost:6001 | HTTP API endpoint |

### Stop Services

```bash
docker-compose down
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Single Docker Container           │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │ App Manager  │  │   Soketi    │ │
│  │  (Port 3000) │  │ (Port 6001) │ │
│  │              │  │             │ │
│  │ - Web UI     │  │ - WebSocket │ │
│  │ - REST API   │  │ - HTTP API  │ │
│  └──────┬───────┘  └──────┬──────┘ │
│         │                  │         │
│         └────────┬─────────┘         │
│                  │                   │
│            soketi.json                │
│         (Shared Config)               │
└─────────────────────────────────────┘
```

### How It Works

1. **Single Container**: Both services run as processes in the same container, managed by `start-services.js`
2. **Process Management**: The App Manager can restart Soketi by killing and respawning the process directly
3. **Shared Configuration**: Both services read/write to the same `soketi.json` file
4. **Direct Communication**: No network overhead between services - they share the same filesystem

## 📡 API Endpoints

The App Manager provides a RESTful API for managing Soketi apps:

### Apps Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/apps` | List all apps |
| `GET` | `/api/apps/:id` | Get specific app details |
| `POST` | `/api/apps` | Create a new app |
| `PUT` | `/api/apps/:id` | Update an existing app |
| `DELETE` | `/api/apps/:id` | Delete an app |

### Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/send-event` | Send a test event to a channel |
| `POST` | `/api/restart` | Restart the Soketi process |

### Example: Create an App

```bash
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-app",
    "key": "app-key",
    "secret": "app-secret"
  }'
```

## 💻 Development

### Local Development (without Docker)

For development purposes, you can run the services locally:

```bash
# Install dependencies
npm install

# Install Soketi globally
npm install -g @soketi/soketi

# Start Soketi manually (in one terminal)
soketi start --config soketi.json

# Start App Manager (in another terminal)
npm run manager
```

The App Manager will be available at http://localhost:3000

### Project Structure

```
soketi-app-manager/
├── src/
│   ├── config/          # Configuration files
│   ├── routes/          # API route handlers
│   ├── services/        # Service integrations
│   ├── index.js         # Entry point
│   └── server.js        # Express server setup
├── public/
│   ├── index.html       # Dashboard UI
│   └── playground.html  # WebSocket playground
├── docker-compose.yml      # Docker Compose configuration (builds locally)
├── docker-compose.ghcr.yml # Docker Compose using GHCR image
├── Dockerfile              # Container definition
├── start-services.js       # Process manager
└── soketi.json             # Soketi configuration
```

## 🚢 Production Deployment

The single container approach is perfect for production environments. Use the pre-built image from GitHub Container Registry:

```bash
# Using docker-compose (recommended)
docker-compose -f docker-compose.ghcr.yml up -d

# Or using Docker directly
docker run -d \
  --name soketi-app-manager \
  --restart unless-stopped \
  -p 3000:3000 \
  -p 6001:6001 \
  -v /path/to/soketi.json:/app/config/soketi.json:rw \
  -e SOKETI_CONFIG_FILE=/app/config/soketi.json \
  ghcr.io/almossaidllc/soketi-manager:latest
```

### Production Features

- ✅ **Auto-restart**: Services automatically restart if they crash
- ✅ **Health Checks**: Built-in health monitoring
- ✅ **Process Management**: Proper signal handling and graceful shutdowns
- ✅ **Volume Persistence**: Configuration persists across container restarts

### Environment Variables

You can customize the deployment using environment variables:

```yaml
environment:
  - NODE_ENV=production
  - SOKETI_APP_MANAGER_DRIVER=array
  - SOKETI_CONFIG_FILE=/app/config/soketi.json
```

### Docker Compose Override

For production, you might want to add:

- Resource limits
- Logging configuration
- Network configuration
- Volume backups

## 🔄 CI/CD

This project includes GitHub Actions workflow that automatically builds and pushes Docker images to GitHub Container Registry:

- **Trigger**: Automatically runs on every push to `main` branch
- **Workflow**: `.github/workflows/docker-publish.yml`
- **Image Tags**: 
  - `latest` - Latest build from main branch
  - `main-<sha>` - Specific commit SHA tags
- **Registry**: `ghcr.io/almossaidllc/soketi-manager`

The workflow uses GitHub's built-in `GITHUB_TOKEN` for authentication, so no additional secrets are required.

## 📝 Configuration

Apps are managed via `soketi.json`. The web UI automatically updates this file and restarts the Soketi process directly (not the Docker container).

The configuration file is mounted as a volume, so your apps persist across container restarts:

```yaml
volumes:
  - ./soketi.json:/app/config/soketi.json:rw
```

## 🔧 Troubleshooting

### Error: "EISDIR: illegal operation on a directory, read" when loading apps

**Problem**: The App Manager shows "Error loading apps: EISDIR: illegal operation on a directory, read".

**Solution**: This occurs when a named volume was mounted at a file path (e.g. `soketi-config:/app/soketi.json`). Docker named volumes are always directories, so the path became a directory instead of a file. We now mount to `/app/config` and use `/app/config/soketi.json` for the config file.

**Fix**: 
1. Remove the old volume: `docker volume rm soketi-config` (if it exists)
2. Recreate the container with the updated compose/run command

### Error: "not a directory" or "mount failed" when running Docker

**Problem**: You're getting an error like:
```
error mounting "/path/to/soketi.json" to rootfs at "/app/config/soketi.json": 
not a directory: Are you trying to mount a directory onto a file (or vice-versa)?
```

**Solution**: This error occurs when:
1. **The path exists as a directory instead of a file** (most common issue!)
2. You're trying to mount a directory to a file path

**Fix**: 
- **Simplest solution**: Don't mount a volume at all! The container auto-initializes the config:
  ```bash
  docker run -d \
    --name soketi-app-manager \
    -p 3000:3000 \
    -p 6001:6001 \
    ghcr.io/almossaidllc/soketi-manager:latest
  ```

- **If you need persistence**: Use a named volume (recommended):
  ```bash
  docker run -d \
    --name soketi-app-manager \
    -p 3000:3000 \
    -p 6001:6001 \
    -v soketi-config:/app/config:rw \
    -e SOKETI_CONFIG_FILE=/app/config/soketi.json \
    ghcr.io/almossaidllc/soketi-manager:latest
  ```

- **If mounting a local file**: Remove the directory first if it exists:
  ```bash
  # Remove directory if it exists
  rm -rf ./soketi.json
  
  # Run container (file will be auto-created if it doesn't exist)
  docker run -d \
    --name soketi-app-manager \
    -p 3000:3000 \
    -p 6001:6001 \
    -v $(pwd)/soketi.json:/app/config/soketi.json:rw \
    -e SOKETI_CONFIG_FILE=/app/config/soketi.json \
    ghcr.io/almossaidllc/soketi-manager:latest
  ```

### Container exits immediately

**Problem**: Container starts but exits right away.

**Solution**: Check the logs:
```bash
docker logs soketi-app-manager
```

Common causes:
- Port conflicts (3000 or 6001 already in use)
- Configuration file errors
- Missing dependencies

### Can't access the web UI

**Problem**: http://localhost:3000 doesn't load.

**Solution**:
1. Check if the container is running: `docker ps`
2. Check port mapping: `docker port soketi-app-manager`
3. Check firewall settings
4. Try accessing via container IP: `docker inspect soketi-app-manager | grep IPAddress`

### Apps not persisting after container restart

**Problem**: Apps created via the web UI disappear after restarting the container.

**Solution**: Ensure you're mounting the config directory or file as a volume:
```bash
# Named volume (recommended)
-v soketi-config:/app/config:rw -e SOKETI_CONFIG_FILE=/app/config/soketi.json

# Or local file
-v $(pwd)/soketi.json:/app/config/soketi.json:rw -e SOKETI_CONFIG_FILE=/app/config/soketi.json
```

Without this volume mount, changes are lost when the container stops.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure Docker builds successfully

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Soketi](https://soketi.app/) - The amazing WebSocket server this project is built on
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📚 Additional Resources

- [Soketi Documentation](https://docs.soketi.app/)
- [WebSocket API Documentation](https://docs.soketi.app/api/overview)
- [Docker Documentation](https://docs.docker.com/)

## ⚠️ Notes

- Soketi runs as a child process, not a separate container
- App Manager can restart Soketi by killing and respawning the process
- Both services share the same filesystem and can access `soketi.json`
- Process PIDs are stored in `.soketi.pid` for restart functionality

---

<div align="center">

Made with ❤️ by [Abdelilah EZZOUINI](https://github.com/AbdelilahEzzouini)
</div>
