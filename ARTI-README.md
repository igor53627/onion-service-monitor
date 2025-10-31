# Arti Docker Image

Pre-built Docker image for [Arti](https://gitlab.torproject.org/tpo/core/arti), the modern Rust implementation of Tor.

## Quick Start

```bash
# Pull the latest image
docker pull ghcr.io/igor53627/arti:latest

# Run Arti SOCKS5 proxy
docker run -p 9150:9150 ghcr.io/igor53627/arti:latest

# Test the connection
curl --socks5 localhost:9150 https://check.torproject.org/api/ip
```

## Available Tags

- `latest` - Latest Arti release (currently **1.7.0**)
- `1.7.0` - Specific Arti version

New versions are automatically built weekly and tagged with their version numbers.

## Usage

### Standalone Proxy

Run Arti as a SOCKS5 proxy on port 9150:

```bash
docker run -d \
  --name arti-proxy \
  -p 9150:9150 \
  ghcr.io/igor53627/arti:latest
```

### With Docker Compose

```yaml
services:
  arti:
    image: ghcr.io/igor53627/arti:latest
    container_name: arti-proxy
    ports:
      - "9150:9150"
    volumes:
      - arti-data:/app/data
    restart: unless-stopped

volumes:
  arti-data:
```

### Custom Configuration

Mount your own `arti-config.toml`:

```bash
docker run -d \
  --name arti-proxy \
  -p 9150:9150 \
  -v $(pwd)/arti-config.toml:/app/arti-config.toml:ro \
  ghcr.io/igor53627/arti:latest
```

Example `arti-config.toml`:

```toml
[proxy]
socks_listen = ["0.0.0.0:9150"]

[storage]
cache_dir = "/app/data/cache"
state_dir = "/app/data/state"

[logging]
console = "info"
```

## Image Details

- **Base Image**: `debian:bookworm-slim`
- **Arti Installation**: Built from source using latest stable Rust
- **User**: Runs as non-root user `arti` (UID/GID auto-assigned)
- **Exposed Port**: `9150` (SOCKS5 proxy)
- **Data Directories**:
  - `/app/data/cache` - Tor consensus and certificate cache
  - `/app/data/state` - Persistent state data

## Environment Variables

The image uses Arti's default configuration. Customize behavior by:
- Mounting a custom `arti-config.toml` to `/app/arti-config.toml`
- Setting environment variables (see [Arti docs](https://tpo.pages.torproject.net/core/arti/))

## Health Check

The image includes a built-in health check that verifies the SOCKS5 port is accessible:

```bash
# Check if Arti is healthy
docker inspect --format='{{.State.Health.Status}}' arti-proxy
```

## Using with Applications

### cURL

```bash
curl --socks5 localhost:9150 https://example.onion
```

### Python (requests-socks)

```python
import requests

proxies = {
    'http': 'socks5://localhost:9150',
    'https': 'socks5://localhost:9150'
}

response = requests.get('https://example.onion', proxies=proxies)
```

### Node.js (socks-proxy-agent)

```javascript
const { SocksProxyAgent } = require('socks-proxy-agent');

const agent = new SocksProxyAgent('socks5://localhost:9150');
fetch('https://example.onion', { agent });
```

## Security Considerations

- **Non-root**: Runs as unprivileged user `arti`
- **Read-only config**: Configuration file is owned by `arti` user
- **Minimal base**: Uses Debian slim image with only required dependencies
- **No exposed secrets**: No embedded credentials or keys

## Performance

- **Multi-stage build**: Optimized for small final image size
- **Rust optimizations**: Built with `--locked` for reproducible builds
- **Layer caching**: GitHub Actions cache significantly speeds up builds

## Troubleshooting

### Connection Refused

Ensure the container is running and healthy:
```bash
docker logs arti-proxy
docker inspect --format='{{.State.Health.Status}}' arti-proxy
```

### Slow First Connection

Arti needs to download the Tor consensus on first run. This can take 30-60 seconds. Check logs:
```bash
docker logs -f arti-proxy
```

### Permission Errors

If mounting volumes, ensure the `arti` user can write to them:
```bash
docker run -v arti-data:/app/data ghcr.io/igor53627/arti:latest
```

## Building from Source

This image is automatically built from the [onion-service-monitor](https://github.com/igor53627/onion-service-monitor) repository:

```bash
git clone https://github.com/igor53627/onion-service-monitor.git
cd onion-service-monitor
docker build -f Dockerfile.arti -t arti:local .
```

## Resources

- **Arti Project**: https://gitlab.torproject.org/tpo/core/arti
- **Arti Documentation**: https://tpo.pages.torproject.net/core/arti/
- **Tor Project**: https://www.torproject.org/
- **Source Repository**: https://github.com/igor53627/onion-service-monitor

## License

This Docker image bundles Arti, which is dual-licensed under:
- **MIT License**
- **Apache License 2.0**

The Dockerfile and build scripts are also dual-licensed under the same terms.

## Contributing

Issues and pull requests welcome at:
https://github.com/igor53627/onion-service-monitor

## Author

**Igor Barinov**

Built with the [onion-service-monitor](https://github.com/igor53627/onion-service-monitor) project.
