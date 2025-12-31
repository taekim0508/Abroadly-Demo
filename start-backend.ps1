# Backend Startup Script for Abroadly
# Run this script to start the FastAPI backend server

Write-Host "Starting Abroadly Backend Server..." -ForegroundColor Green

# Check if uv is installed
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "Error: 'uv' is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Install uv by running:" -ForegroundColor Yellow
    Write-Host "powershell -ExecutionPolicy ByPass -c `"irm https://astral.sh/uv/install.ps1 | iex`"" -ForegroundColor Yellow
    exit 1
}

# Check if virtual environment exists, create if not
if (-not (Test-Path .venv)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    uv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Sync dependencies
Write-Host "Syncing dependencies..." -ForegroundColor Yellow
uv sync

# Start the server
Write-Host "Starting backend server on http://localhost:8000" -ForegroundColor Green
Write-Host "API docs available at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

uv run uvicorn app.main:app --reload --port 8000


