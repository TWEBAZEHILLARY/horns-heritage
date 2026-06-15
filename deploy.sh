#!/bin/bash

# Horns & Heritage Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Horns & Heritage to Cloudflare..."

# Load configuration
CONFIG=$(cat _deploy.json)
API_TOKEN=$(echo $CONFIG | jq -r '.cloudflare.apiToken')
DOMAIN=$(echo $CONFIG | jq -r '.cloudflare.domain')
ACCOUNT_NAME=$(echo $CONFIG | jq -r '.cloudflare.accountName')

if [ -z "$API_TOKEN" ]; then
  echo "❌ Error: Cloudflare API token not found in _deploy.json"
  exit 1
fi

echo "📦 Building assets..."

# Create a temporary directory for assets
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Copy HTML files
cp index.html "$TEMP_DIR/"
if [ -f "Sales Dashboard.html" ]; then
  cp "Sales Dashboard.html" "$TEMP_DIR/"
fi

# Copy CSS files
if [ -d "_ds" ]; then
  cp -r _ds "$TEMP_DIR/" 2>/dev/null || true
fi

# Copy any other asset directories
for dir in assets images fonts; do
  if [ -d "$dir" ]; then
    cp -r "$dir" "$TEMP_DIR/" 2>/dev/null || true
  fi
done

echo "📤 Uploading to Cloudflare Workers..."

# Note: Actual upload requires wrangler CLI
# For now, show what would be deployed

echo "✅ Deployment Configuration Ready"
echo "   Domain: $DOMAIN"
echo "   Main Site: index.html → hornsandheritage.com"
echo "   Dashboard: Sales Dashboard.html → dashboard.hornsandheritage.com"
echo ""
echo "📋 To deploy, you need to:"
echo "   1. Install wrangler: npm install -g wrangler"
echo "   2. Run: wrangler publish --env production"
echo ""
echo "🔑 Your Cloudflare API Token: $API_TOKEN"
