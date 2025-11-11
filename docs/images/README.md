# Onion-Location Screenshots

Store reference screenshots in this directory to illustrate the Onion-Location feature.

## Recommended Screenshots

### 1. `onion-location-indicator.png`
Screenshot showing the purple onion icon in Tor Browser's address bar when visiting a clearnet site with Onion-Location header.

**How to capture:**
1. Open Tor Browser
2. Navigate to https://eth.blockscout.com (or your configured site)
3. Wait for page to load completely
4. Capture screenshot of browser window showing the purple onion icon (right side of address bar)

### 2. `onion-location-prompt.png`
Screenshot showing the prompt that appears when clicking the onion icon.

**How to capture:**
1. Continue from previous screenshot
2. Click on the purple onion icon
3. Capture the dropdown/prompt that appears
4. Should show option to "Switch to .onion site" or similar text

### 3. `onion-location-active.png`
Screenshot showing the successfully loaded .onion site.

**How to capture:**
1. Click "Switch" or equivalent button from the prompt
2. Wait for .onion site to load
3. Capture screenshot showing:
   - .onion address in the address bar
   - Successfully loaded page content
   - Tor circuit indicator (onion icon on left)

### 4. `blockscout-onion-location-example.png` ✅
Reference screenshot from https://eth.blockscout.com showing a real-world implementation.

**Status:** Available in this directory

**What it shows:**
- Purple onion icon in Tor Browser address bar
- Real-world implementation from Blockscout
- Serves as a reference example for proper implementation

## File Naming Convention

Use descriptive, lowercase names with hyphens:
- `feature-name-description.png`
- `onion-location-indicator.png`
- `tor-browser-address-bar.png`

## Image Specifications

- **Format:** PNG (preferred) or JPEG
- **Resolution:** High-DPI/Retina friendly (2x scale recommended)
- **Size:** Optimize for web (use tools like ImageOptim or TinyPNG)
- **Annotations:** Use arrows or highlights to point out key features
- **Privacy:** Ensure no personal information is visible in screenshots

## Usage in Documentation

Reference images in markdown like this:

```markdown
![Onion Location Indicator](./images/onion-location-indicator.png)
*The purple onion icon appears in Tor Browser when a site has an Onion-Location header*
```

## Updating Screenshots

When Tor Browser UI changes or feature behavior is updated:
1. Capture new screenshots following the same naming convention
2. Add version suffix if keeping old ones: `feature-v2.png`
3. Update references in documentation files

## Contributing

If you capture useful screenshots for this feature:
1. Ensure images follow the specifications above
2. Place them in this directory
3. Update this README if adding new categories
4. Submit a pull request with the images

---

## Current Screenshots

- ✅ `blockscout-onion-location-example.png` - Blockscout reference implementation (1.4MB)

**Additional contributions welcome!** If you have screenshots showing other aspects of the Onion-Location feature (prompts, active .onion sites, etc.), please follow the guidelines above and contribute them.
