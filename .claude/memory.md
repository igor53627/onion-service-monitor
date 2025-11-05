# Project Memory

## Adding New Onion Services to onions.json

When adding new onion service entries to `onions.json`, follow these guidelines:

### Field Requirements

1. **last_checked field**: Must be `null` (not an empty string `""`) for services that have never been checked
   - ✅ Correct: `"last_checked": null`
   - ❌ Incorrect: `"last_checked": ""`
   - Rationale: The schema expects `string | null` in TypeScript and `Option<DateTime<Utc>>` in Rust, where `null` explicitly indicates "never checked"

2. **status and prev_status fields**: Should be set to `"unknown"` for new services
   - Example: `"status": "unknown"`, `"prev_status": "unknown"`

### Example Entry for New Service

```json
{
  "title": "Service Name",
  "name": "service-name",
  "onion_address": "http://example.onion/",
  "status": "unknown",
  "prev_status": "unknown",
  "last_checked": null
}
```
