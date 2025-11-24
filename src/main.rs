use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::fs;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct OnionSite {
    title: String,
    name: String,
    onion_address: String,
    status: String,
    prev_status: String,
    last_checked: Option<DateTime<Utc>>,
}

// Structures for parsing GitHub repository data
#[derive(Debug, Deserialize)]
struct GitHubProject {
    #[serde(default)]
    name: String,
    #[serde(default)]
    onion: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GitHubFile {
    name: String,
    #[serde(rename = "type")]
    file_type: String,
    download_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CheckResult {
    site: OnionSite,
    response_time_ms: Option<u64>,
}

async fn check_onion_site_curl(site: &OnionSite, proxy_host: &str, proxy_port: u16) -> CheckResult {
    println!("Checking: {} ({})", site.title, site.onion_address);

    let start = std::time::Instant::now();

    // Use curl with SOCKS5h to properly resolve .onion addresses through the proxy
    let output = tokio::process::Command::new("curl")
        .arg("--socks5-hostname")
        .arg(format!("{}:{}", proxy_host, proxy_port))
        .arg(&site.onion_address)
        .arg("--max-time")
        .arg("60")
        .arg("--write-out")
        .arg("%{http_code}")
        .arg("--silent")
        .arg("--output")
        .arg("/dev/null")
        .arg("--insecure") // Accept self-signed certs for .onion sites
        .output()
        .await;

    let response_time = start.elapsed().as_millis() as u64;

    let mut updated_site = site.clone();
    updated_site.prev_status = site.status.clone();
    updated_site.last_checked = Some(Utc::now());

    match output {
        Ok(result) => {
            if result.status.success() {
                let status_code = String::from_utf8_lossy(&result.stdout);
                let code: u16 = status_code.trim().parse().unwrap_or(0);

                // Treat 2xx, 3xx, and 4xx (client errors like 405) as "online" - service responded
                if code >= 200 && code < 500 {
                    updated_site.status = "online".to_string();
                    println!("  ✓ {} - Online HTTP {} ({}ms)", site.title, code, response_time);
                } else if code >= 500 {
                    // 5xx server errors
                    updated_site.status = format!("error-{}", code);
                    println!("  ⚠ {} - Server Error HTTP {} ({}ms)", site.title, code, response_time);
                } else {
                    updated_site.status = "offline".to_string();
                    println!("  ✗ {} - Connection failed ({}ms)", site.title, response_time);
                }
                CheckResult {
                    site: updated_site,
                    response_time_ms: Some(response_time),
                }
            } else {
                updated_site.status = "offline".to_string();
                println!("  ✗ {} - Offline (curl error)", site.title);
                CheckResult {
                    site: updated_site,
                    response_time_ms: None,
                }
            }
        }
        Err(e) => {
            updated_site.status = "offline".to_string();
            println!("  ✗ {} - Failed to execute curl: {}", site.title, e);
            CheckResult {
                site: updated_site,
                response_time_ms: None,
            }
        }
    }
}

async fn fetch_onion_addresses_from_github() -> Result<Vec<OnionSite>> {
    println!("🔄 Fetching latest onion addresses from GitHub...");

    let client = Client::builder()
        .timeout(Duration::from_secs(30))
        .user_agent("onion-monitoring-tool")
        .build()?;

    // First, get the list of all files in the directory
    let api_url = "https://api.github.com/repos/igor53627/tor-ethereum-ecosystem/contents/src/data";
    println!("  Fetching directory listing from GitHub API...");

    // Build request with optional GitHub token for authentication (avoids rate limiting)
    let mut request = client.get(api_url);
    if let Ok(token) = env::var("GITHUB_TOKEN") {
        println!("  Using GitHub token for authentication");
        request = request.header("Authorization", format!("Bearer {}", token));
    }

    let files_response = request.send().await
        .context("Failed to fetch directory listing")?;

    let github_files: Vec<GitHubFile> = files_response.json().await
        .context("Failed to parse directory listing")?;

    // Filter for .json files
    let json_files: Vec<GitHubFile> = github_files.into_iter()
        .filter(|f| f.file_type == "file" && f.name.ends_with(".json"))
        .collect();

    println!("  Found {} JSON files in directory", json_files.len());

    let mut sites = Vec::new();

    // Fetch each JSON file
    for file in json_files {
        if let Some(download_url) = file.download_url {
            println!("  Fetching {}...", file.name);

            // Build request with optional GitHub token
            let mut file_request = client.get(&download_url);
            if let Ok(token) = env::var("GITHUB_TOKEN") {
                file_request = file_request.header("Authorization", format!("Bearer {}", token));
            }

            match file_request.send().await {
                Ok(response) => {
                    if let Ok(text) = response.text().await {
                        if let Ok(projects) = serde_json::from_str::<Vec<GitHubProject>>(&text) {
                            for project in projects {
                                if let Some(onion) = project.onion {
                                    // Skip WIP/placeholder entries
                                    if onion == ".onion" || onion.is_empty() {
                                        continue;
                                    }

                                    // Normalize onion address - use HTTP by default as many .onion sites don't support HTTPS
                                    let onion_address = if onion.starts_with("http://") || onion.starts_with("https://") {
                                        onion
                                    } else {
                                        format!("http://{}", onion)
                                    };

                                    // Create kebab-case name from title
                                    let name = project.name
                                        .to_lowercase()
                                        .replace(' ', "-")
                                        .replace('_', "-");

                                    sites.push(OnionSite {
                                        title: project.name.clone(),
                                        name,
                                        onion_address,
                                        status: "unknown".to_string(),
                                        prev_status: "unknown".to_string(),
                                        last_checked: None,
                                    });
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    println!("  ⚠ Warning: Failed to fetch {}: {}", file.name, e);
                }
            }
        }
    }

    println!("  ✓ Found {} onion addresses from GitHub", sites.len());
    Ok(sites)
}

fn merge_onion_sites(github_sites: Vec<OnionSite>, existing_sites: Vec<OnionSite>) -> Vec<OnionSite> {
    let mut site_map: HashMap<String, OnionSite> = HashMap::new();

    // First, add all existing sites (preserving their status and history)
    for site in existing_sites {
        site_map.insert(site.name.clone(), site);
    }

    // Then add/update with GitHub sites
    for github_site in github_sites {
        site_map.entry(github_site.name.clone())
            .or_insert(github_site);
    }

    // Convert back to Vec and sort by title
    let mut merged: Vec<OnionSite> = site_map.into_values().collect();
    merged.sort_by(|a, b| a.title.cmp(&b.title));

    merged
}

fn generate_html(results: &[CheckResult]) -> String {
    let mut cards = String::new();

    for result in results {
        let site = &result.site;
        let status_class = match site.status.as_str() {
            "online" => "status-online",
            "offline" => "status-offline",
            "unknown" => "status-unknown",
            _ => "status-error",
        };

        let status_text = match site.status.as_str() {
            "online" => "Online",
            "offline" => "Offline",
            "unknown" => "Unknown",
            _ => "Error",
        };

        let response_time = result.response_time_ms
            .map(|ms| format!("{}ms", ms))
            .unwrap_or_else(|| "N/A".to_string());

        let last_checked = site.last_checked
            .map(|dt| dt.format("%b %d, %Y %H:%M UTC").to_string())
            .unwrap_or_else(|| "Never".to_string());

        cards.push_str(&format!(
            r##"        <div class="card">
          <div class="card-content">
            <div class="card-header">
              <h3 class="card-title">{}</h3>
              <span class="status-badge {}">{}</span>
            </div>
            <div class="onion-url-box">
              <div class="onion-url-content">
                <div class="onion-url-left">
                  <svg class="onion-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#7d33b8"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="white" stroke-width="3" opacity="0.8"/>
                    <circle cx="50" cy="50" r="25" fill="none" stroke="white" stroke-width="3" opacity="0.6"/>
                    <circle cx="50" cy="50" r="15" fill="none" stroke="white" stroke-width="3" opacity="0.4"/>
                    <circle cx="50" cy="50" r="6" fill="white"/>
                  </svg>
                  <span class="onion-label">.onion</span>
                </div>
              </div>
              <div class="onion-url">{}</div>
            </div>
            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-label">Response:</span>
                <span class="meta-value">{}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Checked:</span>
                <span class="meta-value">{}</span>
              </div>
            </div>
          </div>
        </div>
"##,
            site.title,
            status_class,
            status_text,
            site.onion_address,
            response_time,
            last_checked
        ));
    }

    let now = Utc::now().format("%b %d, %Y %H:%M UTC");

    format!(
        r##"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onion Service Monitor</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%237d33b8'/%3E%3Ccircle cx='50' cy='50' r='35' fill='none' stroke='white' stroke-width='3' opacity='0.8'/%3E%3Ccircle cx='50' cy='50' r='25' fill='none' stroke='white' stroke-width='3' opacity='0.6'/%3E%3Ccircle cx='50' cy='50' r='15' fill='none' stroke='white' stroke-width='3' opacity='0.4'/%3E%3Ccircle cx='50' cy='50' r='6' fill='white'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }}

    :root {{
      /* Tor Purple Palette */
      --tor-purple-50: #f5e9ff;
      --tor-purple-100: #ddc2f4;
      --tor-purple-200: #c59be8;
      --tor-purple-300: #ad73dd;
      --tor-purple-400: #964cd1;
      --tor-purple-500: #7d33b8;
      --tor-purple-600: #61278f;
      --tor-purple-700: #461b67;
      --tor-purple-800: #2b1040;
      --tor-purple-900: #13051b;

      /* Onion Warm Tones */
      --onion-500: #e6882d;
      --onion-600: #b46a22;

      /* Light Mode Colors */
      --bg-body: #F7FAFC;
      --bg-card: #FFFFFF;
      --text-primary: #212335;
      --text-secondary: #718096;
      --border-color: #E2E8F0;

      /* Status Colors */
      --success: #48BB78;
      --error: #F56565;
      --warning: #ED8936;
      --info: #4299E1;

      /* Badge Colors */
      --badge-wip-bg: rgba(255, 111, 97, 0.15);
      --badge-wip-color: #D45A4E;
      --badge-socks5-bg: rgba(15, 76, 129, 0.15);
      --badge-socks5-color: #0F4C81;
      --badge-onion-bg: rgba(102, 103, 171, 0.15);
      --badge-onion-color: #5355A0;
    }}

    html {{
      height: 100%;
    }}

    body {{
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg-body);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
    }}

    .page-wrapper {{
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
    }}

    .content-wrapper {{
      flex: 1;
    }}

    header {{
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 16px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-card);
      box-sizing: border-box;
    }}

    @media (min-width: 768px) {{
      header {{
        padding: 24px 32px;
      }}
    }}

    @media (min-width: 1024px) {{
      header {{
        padding: 24px 48px;
      }}
    }}

    .container {{
      max-width: 100%;
      margin: 0 auto;
      padding: 0 16px 48px 16px;
    }}

    @media (min-width: 768px) {{
      .container {{
        padding: 0 32px 48px 32px;
      }}
    }}

    @media (min-width: 1024px) {{
      .container {{
        padding: 0 48px 48px 48px;
      }}
    }}

    .header-content {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}

    .tor-logo {{
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }}

    .header-text {{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }}

    h1 {{
      font-family: 'Inter', sans-serif;
      color: var(--text-primary);
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }}

    .subtitle {{
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 400;
    }}

    .section-header {{
      margin-bottom: 32px;
      margin-top: 48px;
    }}

    .section-title {{
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }}

    .cards-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }}

    .card {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      transition: all 0.3s;
      overflow: hidden;
    }}

    .card:hover {{
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }}

    .card-content {{
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }}

    .card-header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }}

    .card-title {{
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      flex: 1;
    }}

    .onion-url-box {{
      background: var(--tor-purple-800);
      border: 1px solid var(--tor-purple-600);
      border-radius: 6px;
      padding: 12px;
    }}

    .onion-url-content {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }}

    .onion-url-left {{
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .onion-icon {{
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }}

    .onion-label {{
      font-size: 0.75rem;
      color: var(--tor-purple-200);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      flex-shrink: 0;
    }}

    .onion-url {{
      font-family: 'Space Mono', monospace;
      font-size: 0.75rem;
      color: var(--tor-purple-200);
      word-break: break-all;
      line-height: 1.4;
      margin-top: 8px;
    }}

    .card-meta {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--text-secondary);
      gap: 8px;
    }}

    .meta-item {{
      display: flex;
      align-items: center;
      gap: 4px;
    }}

    .meta-label {{
      color: var(--text-secondary);
    }}

    .meta-value {{
      color: var(--text-primary);
      font-weight: 500;
    }}

    .status-badge {{
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      flex-shrink: 0;
    }}

    .status-online {{
      background: rgba(72, 187, 120, 0.2);
      color: #48BB78;
    }}

    .status-offline {{
      background: rgba(245, 101, 101, 0.2);
      color: #F56565;
    }}

    .status-unknown {{
      background: rgba(160, 174, 192, 0.2);
      color: #A0AEC0;
    }}

    .status-error {{
      background: rgba(237, 137, 54, 0.2);
      color: #ED8936;
    }}

    footer {{
      width: 100%;
      background: var(--bg-card);
      border-top: 1px solid var(--border-color);
      margin-top: auto;
    }}

    .footer-container {{
      max-width: 100%;
      margin: 0 auto;
      padding: 32px 16px;
    }}

    @media (min-width: 768px) {{
      .footer-container {{
        padding: 32px 32px;
      }}
    }}

    @media (min-width: 1024px) {{
      .footer-container {{
        padding: 32px 48px;
      }}
    }}

    .footer-content {{
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }}

    .footer-content a {{
      color: var(--text-secondary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: color 0.2s;
    }}

    .footer-content a:hover {{
      color: var(--tor-purple-500);
      text-decoration: underline;
    }}

    .footer-divider {{
      color: var(--text-secondary);
      opacity: 0.4;
    }}

    @media (max-width: 768px) {{
      .cards-grid {{
        grid-template-columns: 1fr;
        gap: 16px;
      }}

      header {{
        padding: 16px;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }}

      .header-content {{
        gap: 12px;
      }}

      .card-content {{
        padding: 12px;
      }}
    }}
  </style>
</head>
<body>
  <div class="page-wrapper">
    <header>
      <div class="header-content">
        <svg class="tor-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="#7d33b8"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="white" stroke-width="3" opacity="0.8"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="white" stroke-width="3" opacity="0.6"/>
          <circle cx="50" cy="50" r="15" fill="none" stroke="white" stroke-width="3" opacity="0.4"/>
          <circle cx="50" cy="50" r="6" fill="white"/>
        </svg>
        <div class="header-text">
          <h1>Onion Service Monitor</h1>
          <p class="subtitle">Monitoring Tor Hidden Services via Arti</p>
        </div>
      </div>
    </header>

    <div class="content-wrapper">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Monitored Services</h2>
        </div>

        <div class="cards-grid">
{}
        </div>
      </div>
    </div>

    <footer>
      <div class="footer-container">
        <div class="footer-content">
          <span>Powered by Arti - The Rust Tor Implementation</span>
          <span class="footer-divider">•</span>
          <span>Last updated: {}</span>
          <span class="footer-divider">•</span>
          <a href="https://github.com/igor53627/tor-ethereum-ecosystem" target="_blank">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Tor in Ethereum Ecosystem
          </a>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>"##,
        cards,
        now
    )
}

#[tokio::main]
async fn main() -> Result<()> {
    println!("🧅 Onion Service Monitor - Starting...\n");

    // Get proxy URL from environment
    let proxy_url = env::var("SOCKS_PROXY")
        .unwrap_or_else(|_| "socks5://127.0.0.1:9150".to_string());

    println!("Using SOCKS proxy: {}", proxy_url);

    // Update onion addresses from GitHub
    let json_path = "/app/onions.json";
    let github_sites = fetch_onion_addresses_from_github().await?;

    // Read existing sites (if file exists)
    let existing_sites: Vec<OnionSite> = if let Ok(json_content) = fs::read_to_string(json_path) {
        serde_json::from_str(&json_content).unwrap_or_default()
    } else {
        Vec::new()
    };

    // Merge GitHub sites with existing sites
    let sites = merge_onion_sites(github_sites, existing_sites);

    // Save merged sites
    let merged_json = serde_json::to_string_pretty(&sites)?;
    fs::write(json_path, merged_json)
        .context("Failed to write merged onions.json")?;

    println!("✓ Updated onions.json with {} sites\n", sites.len());

    // Parse proxy URL to extract host and port
    let proxy_parts: Vec<&str> = proxy_url.trim_start_matches("socks5://").split(':').collect();
    let proxy_host = proxy_parts.get(0).unwrap_or(&"arti");
    let proxy_port: u16 = proxy_parts.get(1).and_then(|p| p.parse().ok()).unwrap_or(9150);

    println!("Using SOCKS5h proxy: {}:{}\n", proxy_host, proxy_port);

    // Check all sites using curl with SOCKS5h
    let mut results = Vec::new();
    for site in sites {
        let result = check_onion_site_curl(&site, proxy_host, proxy_port).await;
        results.push(result);

        // Small delay between checks to be nice
        tokio::time::sleep(Duration::from_secs(2)).await;
    }

    println!("\n📊 Check complete!");

    // Save updated JSON
    let updated_sites: Vec<OnionSite> = results.iter()
        .map(|r| r.site.clone())
        .collect();

    let updated_json = serde_json::to_string_pretty(&updated_sites)
        .context("Failed to serialize results")?;

    fs::write(json_path, updated_json)
        .context("Failed to write updated onions.json")?;

    println!("✓ Updated onions.json");

    // Generate HTML
    let html = generate_html(&results);

    fs::create_dir_all("/app/docs")
        .context("Failed to create docs directory")?;

    fs::write("/app/docs/index.html", html)
        .context("Failed to write index.html")?;

    println!("✓ Generated docs/index.html");

    // Print summary
    let online_count = results.iter().filter(|r| r.site.status == "online").count();
    let offline_count = results.iter().filter(|r| r.site.status == "offline").count();

    println!("\n📈 Summary:");
    println!("   Online:  {}", online_count);
    println!("   Offline: {}", offline_count);
    println!("   Total:   {}", results.len());

    Ok(())
}
