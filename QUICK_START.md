# Quick Start Guide - Running Abroadly Locally

## Prerequisites

You need to install the following tools first:

### 1. Install Node.js (for the frontend)
- Download from: https://nodejs.org/ (Install the LTS version)
- After installation, restart your terminal/PowerShell
- Verify installation: `node --version` and `npm --version`

### 2. Install Python 3.11+ (for the backend)
- Download from: https://www.python.org/downloads/
- **Important**: Check "Add Python to PATH" during installation
- Verify installation: `python --version`

### 3. Install uv (Python package manager)
- Open PowerShell and run:
  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
- Or visit: https://github.com/astral-sh/uv
- Verify installation: `uv --version`
- Restart your terminal after installation

## Running the Application

### Step 1: Start the Backend Server

Open a terminal/PowerShell in the project root directory and run:

```powershell
# Create virtual environment (first time only)
uv venv

# Activate virtual environment
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Windows CMD:
# .venv\Scripts\activate.bat

# Install dependencies (first time only)
uv sync

# Start the backend server
uv run uvicorn app.main:app --reload --port 8000
```

The backend will run at: **http://localhost:8000**
- API docs: http://localhost:8000/docs

### Step 2: Start the Frontend Server

Open a **NEW** terminal/PowerShell window in the project root and run:

```powershell
# Navigate to frontend directory
cd abroadly

# Install dependencies (first time only)
npm install

# Start the frontend server
npm run dev
```

The frontend will run at: **http://localhost:5173**

### Step 3: Visit the Website

Open your web browser and go to:
**http://localhost:5173**

## Optional: Seed Sample Data

To populate the database with sample programs, places, and reviews:

```powershell
# In the project root directory (with backend virtual environment activated)
uv run python seed_data.py
```

## Troubleshooting

### "node is not recognized"
- Node.js is not installed or not in your PATH
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "python is not recognized"
- Python is not installed or not in your PATH
- Install Python from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### "uv is not recognized"
- Install uv using the command above
- Restart your terminal after installation

### Port 8000 or 5173 already in use
- Stop any processes using those ports
- Or change the port in the commands above

### CORS errors in browser
- Make sure the backend is running on port 8000
- Make sure the frontend is running on port 5173
- Check that both servers started successfully

## What You Should See

1. **Backend running**: Terminal shows "Uvicorn running on http://127.0.0.1:8000"
2. **Frontend running**: Terminal shows "Local: http://localhost:5173"
3. **Website**: Browser opens to the Abroadly homepage

## Need Help?

- Check the main [README.md](README.md) for more details
- API documentation: http://localhost:8000/docs (when backend is running)
- Frontend README: [abroadly/README.md](abroadly/README.md)


