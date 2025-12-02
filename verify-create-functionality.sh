#!/bin/bash

echo "========================================"
echo "  Testing Create Note and Document"
echo "========================================"
echo ""

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js found!"
echo ""

echo "Running test script..."
echo ""
node test-create-note-document.js

echo ""
echo "========================================"
echo "  Test Complete"
echo "========================================"
