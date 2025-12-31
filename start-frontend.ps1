# Frontend Startup Script for Abroadly
# Run this script to start the React frontend development server

Write-Host "Starting Abroadly Frontend Server..." -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not installed or not in PATH." -ForegroundColor Red
    Write-Host "npm should come with Node.js. Please reinstall Node.js." -ForegroundColor Yellow
    exit 1
}

# Navigate to frontend directory
if (-not (Test-Path abroadly)) {
    Write-Host "Error: 'abroadly' directory not found." -ForegroundColor Red
    Write-Host "Make sure you're running this script from the project root." -ForegroundColor Yellow
    exit 1
}

Set-Location abroadly

# Check if node_modules exists, install if not
if (-not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies." -ForegroundColor Red
        exit 1
    }
}

# Start the development server
Write-Host "Starting frontend server on http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev


