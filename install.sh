#!/bin/bash

echo "🚀 Initializing SpillSense-Ai Full-Stack Environment..."

# 1. Setup Backend
echo "------------------------------------------------"
echo "📦 Setting up Python Backend Environment..."
cd backend || exit

# Create a virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "Created new virtual environment in backend/.venv"
fi

# Activate and install exact requirements
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
cd ..

# 2. Setup Frontend
echo "------------------------------------------------"
echo "📦 Setting up Next.js Frontend Environment..."
cd frontend || exit

# npm ci is strictly better than npm install for teams. 
# It forcefully reads package-lock.json for exact, reproducible versions.
npm ci 
cd ..

echo "------------------------------------------------"
echo "✅ All backend and frontend dependencies installed successfully!"
echo ""
echo "To start the servers:"
echo "Backend: cd backend && source .venv/bin/activate && uvicorn app:app --reload"
echo "Frontend: cd frontend && npm run dev"
