#!/bin/bash

# Horns & Heritage - Setup Script
# This script helps set up the project for local development and deployment

echo "🚀 Setting up Horns & Heritage..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. For local development: npm run dev"
echo "2. To deploy: npm run deploy"
echo "3. Read DEPLOYMENT_GUIDE.md for more details"
echo ""
