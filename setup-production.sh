#!/bin/bash

echo "========================================"
echo "Knowledge Workspace - Production Setup"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}[ERROR] .env.local file not found!${NC}"
    echo ""
    echo "Please create .env.local with the following:"
    echo "  MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"
    echo "  JWT_SECRET=<your-secret-key>"
    echo "  OPENAI_API_KEY=sk-your-openai-api-key"
    echo ""
    echo "Copy from .env.local.example and update with your values."
    exit 1
fi

echo "[1/5] Checking environment configuration..."
node -e "require('dotenv').config({path:'.env.local'});const missing=[];['MONGODB_URI','JWT_SECRET','OPENAI_API_KEY'].forEach(v=>{if(!process.env[v]||process.env[v].includes('<')||process.env[v].includes('your-')){missing.push(v)}});if(missing.length>0){console.log('Missing or placeholder values:',missing.join(', '));process.exit(1)}else{console.log('All required variables set')}"
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Environment variables not properly configured${NC}"
    echo "Please update .env.local with real values"
    exit 1
fi

echo ""
echo "[2/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo "[3/5] Checking MongoDB connection..."
node -e "const mongoose=require('mongoose');require('dotenv').config({path:'.env.local'});mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000}).then(()=>{console.log('MongoDB connected successfully');process.exit(0)}).catch(e=>{console.error('MongoDB connection failed:',e.message);process.exit(1)})"
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] MongoDB connection failed${NC}"
    echo ""
    echo "Please check:"
    echo "  1. MongoDB URI is correct in .env.local"
    echo "  2. Username and password are correct"
    echo "  3. IP 196.128.225.174 is whitelisted in MongoDB Atlas"
    echo "  4. Your cluster is running"
    exit 1
fi

echo ""
echo "[4/5] Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Build failed${NC}"
    exit 1
fi

echo ""
echo "[5/5] Running production readiness tests..."
node test-production-ready.js
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${YELLOW}[WARNING] Some tests failed${NC}"
    echo "Review test-production-ready-report.json for details"
fi

echo ""
echo "========================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To start the production server:"
echo "  npm start"
echo ""
