# GitHub Container Registry Package Setup

To complete the Arti package setup on GHCR, manually configure the package description:

## Steps

1. Go to https://github.com/igor53627/onion-service-monitor/pkgs/container/arti

2. Click **"Package settings"** (gear icon on the right)

3. Update the **Description** field to:
   ```
   Pre-built Docker image for Arti (Rust Tor implementation). SOCKS5 proxy on port 9150. 📖 Full docs: https://github.com/igor53627/onion-service-monitor/blob/main/ARTI-README.md
   ```

4. Ensure **Visibility** is set to **Public**

5. (Optional) Under **"Manage Actions access"**, verify that the workflow has write access

## Why Manual Setup?

GitHub's Container Registry API doesn't support updating package descriptions programmatically for organization/user packages. This one-time manual step ensures users see helpful information and documentation links on the package page.

## What Gets Updated Automatically?

The following are handled automatically by the workflow:
- Image tags (`latest`, `1.7.0`, etc.)
- Image labels (OCI metadata)
- Weekly rebuilds with latest Arti version
- Version detection and tagging
