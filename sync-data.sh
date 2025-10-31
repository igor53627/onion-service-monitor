#!/bin/bash
# Sync monitoring data to frontend

set -e

echo "Syncing onions.json to frontend data..."
cp onions.json frontend/data/services.json
echo "Sync complete!"
