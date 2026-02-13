# Live Clipboard

Real-time clipboard sharing across devices. Create a room, share the code, and instantly sync text between connected users.

## Tech Stack

**Backend**: .NET 10, ASP.NET Core, SignalR, Entity Framework Core, SQLite
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui

## Features

- **Real-time sync** via SignalR WebSockets with auto-reconnect
- **Room-based sharing** with 5-character codes (e.g. `AB1XY`)
- **AES encryption** at rest — content is encrypted before storing in the database
- **Clipboard history** — full history loads when joining a room
- **Room expiry** — rooms auto-expire after 7 days
- **Dark mode** support

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)

### Backend

```bash
cd backend
dotnet ef database update
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Configuration

### Backend (`appsettings.Development.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=clipboard.db;Cache=Shared"
  },
  "Encryption": {
    "Key": "<base64-encoded-aes-key>"
  },
  "HashSalt": {
    "Value": "<random-salt>"
  }
}
```

### Frontend (`.env`)

```
VITE_SIGNALR_URL=http://localhost:5134/clipboardhub
```

In production, omit this variable — the frontend defaults to `/clipboardhub` (relative path through the reverse proxy).

## Production Deployment

### Build

```bash
cd frontend && npm run build
cd backend && dotnet publish -c Release -o ../publish
```

### Production config (`appsettings.Production.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=/path/to/data/clipboard.db;Cache=Shared"
  },
  "Encryption": {
    "Key": "<base64-encoded-aes-key>"
  },
  "HashSalt": {
    "Value": "<random-salt>"
  },
  "Cors": {
    "AllowedOrigins": ["https://yourdomain.com"]
  }
}
```

### Run

```bash
ASPNETCORE_ENVIRONMENT=Production ASPNETCORE_URLS=http://localhost:5000 dotnet publish/backend.dll
```

### Nginx (reverse proxy)

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /clipboardhub {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Architecture

```
Browser ──WebSocket──→ Nginx ──proxy──→ .NET Backend (SignalR)
                         │                      │
                    static files            SQLite DB
                   (frontend/dist)     (AES encrypted content)
```

1. User creates or joins a room with a 5-character code
2. SignalR establishes a WebSocket connection
3. Sent content is AES-encrypted and stored in SQLite
4. All room members receive the content in real-time via SignalR groups
