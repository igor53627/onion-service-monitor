#!/bin/bash
# Quick local test script - generates HTML without actually checking .onion sites

echo "🧅 Local Test Mode - Generating Demo Status Page"
echo ""

# Create mock docs directory
mkdir -p docs

# Generate a simple test HTML directly
cat > docs/index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onion Service Monitor - Demo</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0f0f23;
      color: #cccccc;
      padding: 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }

    h1 {
      color: white;
      font-size: 2.5em;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .subtitle {
      color: rgba(255,255,255,0.9);
      font-size: 1.1em;
    }

    .demo-notice {
      background: #ff6b6b;
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
      font-weight: 600;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin: 30px 0;
      flex-wrap: wrap;
    }

    .stat-card {
      background: #1a1a2e;
      padding: 20px 30px;
      border-radius: 8px;
      border: 1px solid #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #667eea;
    }

    .stat-label {
      color: #888;
      font-size: 0.9em;
      margin-top: 5px;
    }

    table {
      width: 100%;
      background: #1a1a2e;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      border-collapse: collapse;
    }

    thead {
      background: #16213e;
    }

    th {
      padding: 15px;
      text-align: left;
      color: #667eea;
      font-weight: 600;
      border-bottom: 2px solid #333;
    }

    td {
      padding: 15px;
      border-bottom: 1px solid #2a2a3e;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tbody tr {
      transition: background 0.2s;
    }

    tbody tr:hover {
      background: #252538;
    }

    a {
      color: #667eea;
      text-decoration: none;
      word-break: break-all;
    }

    a:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 600;
    }

    .status-online {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid #10b981;
    }

    .status-offline {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid #ef4444;
    }

    .status-unknown {
      background: rgba(107, 114, 128, 0.2);
      color: #6b7280;
      border: 1px solid #6b7280;
    }

    .status-error {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
      border: 1px solid #fbbf24;
    }

    footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: #666;
      font-size: 0.9em;
    }

    .last-updated {
      color: #888;
      margin-top: 10px;
    }

    @media (max-width: 768px) {
      table {
        font-size: 0.9em;
      }

      th, td {
        padding: 10px 8px;
      }

      h1 {
        font-size: 1.8em;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🧅 Onion Service Monitor</h1>
      <p class="subtitle">Monitoring Tor Hidden Services via Arti</p>
    </header>

    <div class="demo-notice">
      📋 DEMO MODE - This is a sample output showing how the monitoring page will look
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">3/4</div>
        <div class="stat-label">Services Online</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">75.0%</div>
        <div class="stat-label">Uptime</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Onion Address</th>
          <th>Status</th>
          <th>Response Time</th>
          <th>Last Checked</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>DuckDuckGo</td>
          <td><a href="https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion" target="_blank" rel="noopener noreferrer">https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion</a></td>
          <td><span class="status-badge status-online">✓ online</span></td>
          <td>1234ms</td>
          <td>2025-10-30 16:50:00 UTC</td>
        </tr>
        <tr>
          <td>The Hidden Wiki</td>
          <td><a href="http://zqktlwiuavvvqqt4ybvgvi7tyo4hjl5xgfuvpdf6otjiycgwqbym2qad.onion" target="_blank" rel="noopener noreferrer">http://zqktlwiuavvvqqt4ybvgvi7tyo4hjl5xgfuvpdf6otjiycgwqbym2qad.onion</a></td>
          <td><span class="status-badge status-offline">✗ offline</span></td>
          <td>N/A</td>
          <td>2025-10-30 16:50:00 UTC</td>
        </tr>
        <tr>
          <td>ProtonMail</td>
          <td><a href="https://protonmailrmez3lotccipshtkleegetolb73fuirgj7r4o4vfu7ozyd.onion" target="_blank" rel="noopener noreferrer">https://protonmailrmez3lotccipshtkleegetolb73fuirgj7r4o4vfu7ozyd.onion</a></td>
          <td><span class="status-badge status-online">✓ online</span></td>
          <td>987ms</td>
          <td>2025-10-30 16:50:00 UTC</td>
        </tr>
        <tr>
          <td>BBC News</td>
          <td><a href="https://www.bbcweb3hytmzhn5d532owbu6oqadra5z3ar726vq5kgwwn6aucdccrad.onion" target="_blank" rel="noopener noreferrer">https://www.bbcweb3hytmzhn5d532owbu6oqadra5z3ar726vq5kgwwn6aucdccrad.onion</a></td>
          <td><span class="status-badge status-online">✓ online</span></td>
          <td>2156ms</td>
          <td>2025-10-30 16:50:00 UTC</td>
        </tr>
      </tbody>
    </table>

    <footer>
      <p>Powered by Arti - The Rust Tor Implementation</p>
      <p class="last-updated">Last updated: 2025-10-30 16:50:00 UTC</p>
      <p><a href="https://github.com/yourusername/onion-monitoring" target="_blank">View on GitHub</a></p>
    </footer>
  </div>
</body>
</html>
EOF

echo "✓ Generated docs/index.html"
echo ""
echo "📂 Open the file to see the demo:"
echo "   file://$(pwd)/docs/index.html"
echo ""
echo "Or run: open docs/index.html"
