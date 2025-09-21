#!/bin/bash

# PR Review Agent Frontend Development Script

echo "🚀 Starting PR Review Agent Frontend Development Server"
echo "=================================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating environment file..."
    cp env.example .env
    echo "✅ Created .env file. Please update VITE_API_URL if needed."
fi

echo "🌐 Starting development server..."
echo "Frontend will be available at: http://localhost:3000"
echo "Make sure your backend is running at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
