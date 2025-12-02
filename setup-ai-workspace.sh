#!/bin/bash
# AI-Powered Knowledge Workspace - Setup Script for Linux/Mac
# This script helps you set up the AI-powered workspace

echo "================================================================"
echo "   AI-POWERED KNOWLEDGE WORKSPACE - SETUP WIZARD"
echo "================================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js is installed"
node --version
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not installed!"
    exit 1
fi

echo "[OK] npm is installed"
npm --version
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "[INFO] Creating .env.local from example..."
    cp .env.local.example .env.local
    echo "[OK] .env.local created"
    echo ""
    echo "[IMPORTANT] Please add your OpenAI API key to .env.local"
    echo "Get your key from: https://platform.openai.com/api-keys"
    echo ""
    echo "Open .env.local and add:"
    echo "OPENAI_API_KEY=sk-your-key-here"
    echo ""
    read -p "Press Enter to continue..."
else
    echo "[OK] .env.local already exists"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "[INFO] Installing dependencies..."
    echo "This may take a few minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies"
        exit 1
    fi
    echo "[OK] Dependencies installed"
    echo ""
else
    echo "[OK] Dependencies already installed"
    echo ""
fi

echo "================================================================"
echo "   SETUP COMPLETE!"
echo "================================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Add your OpenAI API key to .env.local"
echo "   OPENAI_API_KEY=sk-your-key-here"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Run tests to verify everything works:"
echo "   node test-ai-system.js"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Documentation:"
echo "- QUICK_START_AI.md - Get started in 5 minutes"
echo "- AI_IMPLEMENTATION_COMPLETE.md - Full setup guide"
echo "- TRANSFORMATION_COMPLETE_REPORT.md - Detailed report"
echo ""
echo "================================================================"
echo ""
