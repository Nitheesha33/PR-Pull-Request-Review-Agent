@echo off
echo 🚀 Starting PR Review Agent Frontend Development Server
echo ==================================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if .env exists
if not exist ".env" (
    echo ⚙️  Creating environment file...
    copy env.example .env
    echo ✅ Created .env file. Please update VITE_API_URL if needed.
)

echo 🌐 Starting development server...
echo Frontend will be available at: http://localhost:3000
echo Make sure your backend is running at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
