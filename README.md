# Onion Service Monitor

A fully automated monitoring system for Tor hidden services (.onion addresses) with a modern React frontend, powered by Arti (Rust Tor implementation), Docker Compose, and GitHub Actions.

🌐 **Live Site:** https://igor53627.github.io/onion-service-monitor/

## Architecture

```
┌─────────────────────┐
│  GitHub Actions     │
│  (Daily Schedule)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────────┐
│  Arti Container     │◄────│ Monitor Container│
│  (SOCKS5 Proxy)     │     │ (Rust App)       │
│  Port: 9150         │     └─────────┬────────┘
└─────────────────────┘               │
           │                          │
           │                          ▼
           │                  ┌───────────────┐
           └─────────────────►│ .onion Sites  │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ onions.json   │
                              │ (Data Update) │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ React Build   │
                              │ (Vite + TS)   │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │  GitHub Pages │
                              │ (Static Site) │
                              └───────────────┘
```

## Features

### Backend
- **Arti Integration**: Uses Arti, the modern Rust implementation of Tor
- **Pre-built Arti Image**: Published to GitHub Container Registry (`ghcr.io/igor53627/arti`)
- **Docker Compose**: Complete containerized setup for easy deployment
- **Automated Monitoring**: Runs daily via GitHub Actions (configurable schedule)
- **GitHub Pages**: Automatically builds and deploys frontend
- **History Tracking**: Tracks status changes (status → prev_status) in JSON

### Frontend
- **Modern React UI**: Built with React 18 + TypeScript + Vite
- **Chakra UI**: Beautiful, accessible components with Tor-inspired theme
- **Dark/Light Mode**: Seamless theme switching with user preference
- **Search & Filter**: Fast client-side search and status filtering
- **Responsive Design**: Mobile-first, works on all devices
- **One-Click Copy**: Easy .onion address copying to clipboard
- **Real-time Status**: Visual status indicators (online, offline, error codes)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- GitHub account (for Actions and Pages)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/igor53627/onion-monitoring.git
cd onion-monitoring
```

2. Install frontend dependencies:
```bash
npm install
```

3. Run the monitoring (updates `onions.json`):
```bash
docker compose up --build
```

4. Sync data to frontend and start dev server:
```bash
./sync-data.sh
npm run dev
```

5. Open your browser to `http://localhost:5173/`

### GitHub Actions Setup

1. **Enable GitHub Actions**:
   - Go to your repository settings
   - Navigate to Actions → General
   - Enable "Read and write permissions" for workflows

2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: GitHub Actions
   - Save

3. **First Run**:
   - Go to Actions tab
   - Select "Deploy to GitHub Pages" workflow
   - Click "Run workflow" to trigger manually
   - Wait for completion (~5-10 minutes)

4. **View Your Status Page**:
   - Visit: `https://yourusername.github.io/onion-monitoring/`
   - Or your custom domain if configured

## Configuration

### Adding/Removing Sites

Edit `onions.json`:

```json
[
  {
    "title": "DuckDuckGo",
    "name": "duckduckgo",
    "onion_address": "https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion",
    "status": "unknown",
    "prev_status": "unknown",
    "last_checked": null,
    "category": "Search Engine",
    "description": "Privacy-focused search engine",
    "official_website": "https://duckduckgo.com",
    "github": "https://github.com/duckduckgo",
    "tags": ["Search", "Privacy"]
  }
]
```

### Changing Schedule

Edit `.github/workflows/deploy.yml`:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
    # Examples:
    # - cron: '0 */6 * * *'  # Every 6 hours
    # - cron: '0 */1 * * *'  # Every hour
  push:
    branches:
      - main
  workflow_dispatch:
```

### Arti Configuration

Edit `arti-config.toml` to customize Arti settings:

```toml
[proxy]
socks_listen = ["0.0.0.0:9150"]

[storage]
cache_dir = "/app/data/cache"
state_dir = "/app/data/state"

[logging]
console = "info"  # Options: trace, debug, info, warn, error
```

## JSON Schema

The `onions.json` file uses this schema:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `title` | string | Display name for the service | ✓ |
| `name` | string | Unique identifier (slug) | ✓ |
| `onion_address` | string | Full .onion URL (http:// or https://) | ✓ |
| `status` | string | Current status: `online`, `offline`, `error-XXX`, `unknown` | ✓ |
| `prev_status` | string | Previous status (for change detection) | ✓ |
| `last_checked` | string/null | ISO 8601 timestamp of last check | ✓ |
| `category` | string | Service category (e.g., "RPC Provider") | Optional |
| `description` | string | Brief description of the service | Optional |
| `official_website` | string | Clearnet website URL | Optional |
| `github` | string | GitHub repository URL | Optional |
| `tags` | string[] | Array of tags for filtering/search | Optional |

## Status Codes

- **online**: HTTP 2xx response received
- **offline**: Connection failed or timeout
- **error-XXX**: HTTP error code (e.g., error-404, error-500)
- **unknown**: Not yet checked

## Development

### Project Structure

```
onion-monitoring/
├── frontend/                # React frontend
│   ├── components/          # UI components
│   │   ├── Header.tsx
│   │   ├── FilterBar.tsx
│   │   └── ServiceCard.tsx
│   ├── data/
│   │   └── services.json    # Synced from onions.json
│   ├── theme/
│   │   └── index.ts         # Chakra UI theme
│   ├── types.ts             # TypeScript types
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── src/
│   └── main.rs              # Rust monitoring application
├── .github/
│   └── workflows/
│       └── deploy.yml       # Build & deploy workflow
├── public/
│   └── favicon.svg          # Site icon
├── onions.json              # Site configuration & status
├── package.json             # Node dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── Cargo.toml               # Rust dependencies
├── Dockerfile               # Monitor app container
├── docker-compose.yml       # Multi-container setup
├── arti-config.toml         # Arti Tor configuration
├── sync-data.sh             # Sync script for data
└── README.md
```

### Frontend Development

Run the frontend without monitoring:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development

Build and run monitoring locally:

```bash
# Build the Rust app
cargo build --release

# Run Arti separately (terminal 1)
cargo install arti
arti proxy -c arti-config.toml

# Run monitor (terminal 2)
SOCKS_PROXY=socks5://127.0.0.1:9150 cargo run

# Sync data to frontend
./sync-data.sh
```

### Using Pre-built Arti Image

The Arti Docker image is pre-built and published to GitHub Container Registry, making it easy to use in your own projects:

```bash
# Pull the latest Arti image
docker pull ghcr.io/igor53627/arti:latest

# Or pull a specific version
docker pull ghcr.io/igor53627/arti:1.7.0

# Run Arti proxy standalone
docker run -p 9150:9150 ghcr.io/igor53627/arti:latest

# Use in your own docker-compose.yml
services:
  arti:
    image: ghcr.io/igor53627/arti:latest
    ports:
      - "9150:9150"
```

**Available tags:**
- `latest` - Latest Arti release (currently 1.7.0)
- `1.7.0` - Specific Arti version

The image is automatically rebuilt weekly to include the latest Arti version.

### Docker Builds

Build individual containers:

```bash
# Build monitor
docker build -t onion-monitor .

# Run with existing Arti
docker run -e SOCKS_PROXY=socks5://host.docker.internal:9150 \
  -v $(pwd)/onions.json:/app/onions.json \
  -v $(pwd)/docs:/app/docs \
  onion-monitor
```

## Troubleshooting

### GitHub Actions Fails

1. **Check Docker logs**:
   - View the Actions run logs
   - Look for container errors in "Run monitoring" step

2. **Test locally first**:
   ```bash
   docker compose up --build
   ```

3. **Common issues**:
   - Timeout: Increase timeout in workflow (default: 30 min)
   - Permissions: Enable "Read and write permissions" in repo settings
   - Pages not deploying: Check Pages settings, ensure gh-pages branch exists

### Sites Always Offline

1. **Verify .onion addresses**: Some addresses may have changed or gone offline
2. **Check Arti logs**:
   ```bash
   docker compose logs arti
   ```
3. **Test with Tor Browser**: Verify sites work in Tor Browser first
4. **Increase timeout**: Edit timeout in `src/main.rs` if sites are slow

### Frontend Not Building

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Check Node version** (requires Node 18+):
   ```bash
   node --version
   ```

3. **Clear cache and rebuild**:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

## Security Considerations

- **No Authentication**: Status page is public on GitHub Pages
- **Rate Limiting**: Built-in 2-second delay between checks
- **Self-Signed Certs**: App accepts invalid HTTPS certificates (common for .onion sites)
- **No Data Collection**: Only checks accessibility, doesn't store content

## Technology Stack

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Chakra UI**: Component library with theming
- **React Icons**: Icon library

### Backend
- **Rust**: Systems programming language
- **Arti**: Modern Tor implementation
- **Tokio**: Async runtime
- **Reqwest**: HTTP client with SOCKS5 support

### Infrastructure
- **Docker**: Containerization
- **GitHub Actions**: CI/CD pipeline
- **GitHub Pages**: Static site hosting

## Resources

- [Arti Documentation](https://tpo.pages.torproject.net/core/arti/)
- [Tor Project](https://www.torproject.org/)
- [React Documentation](https://react.dev/)
- [Chakra UI](https://chakra-ui.com/)
- [Vite](https://vitejs.dev/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

## License

This project is dual-licensed under:

- **MIT License** ([LICENSE-MIT](LICENSE-MIT))
- **Apache License 2.0** ([LICENSE-APACHE](LICENSE-APACHE))

You may choose either license for your use.

Copyright (c) 2024 Igor Barinov

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `docker compose up`
5. Submit a pull request

## Author

**Igor Barinov**

## Acknowledgments

- **Arti Team**: For building a modern Rust Tor implementation
- **Tor Project**: For enabling online privacy and freedom
- **GitHub**: For free Actions minutes and Pages hosting

---

**Note**: This tool is for monitoring legitimate services you own or have permission to monitor. Respect privacy and terms of service.
