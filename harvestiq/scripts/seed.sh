#!/bin/bash

# HarvestIQ Database Seeding Script
# This script seeds the database with demo data

set -e

echo "🌱 HarvestIQ Database Seeding"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    exit 1
fi

# Method 1: Seed via Docker (if containers are running)
if docker-compose ps | grep -q "harvestiq-backend.*Up"; then
    echo "🐳 Using Docker container to seed database..."
    docker-compose exec backend python app/seed.py
    exit 0
fi

# Method 2: Seed locally (if running without Docker)
echo "💻 Seeding database locally..."

# Check if virtual environment exists
if [ -d "backend/venv" ]; then
    echo "📦 Activating virtual environment..."
    source backend/venv/bin/activate
fi

# Install dependencies if needed
if [ -f "backend/requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    cd backend
    pip install -r requirements.txt
    cd ..
fi

# Run the seed script
echo "🌱 Running seed script..."
cd backend
python app/seed.py
cd ..

echo "✅ Seeding completed!"
echo ""
echo "🚀 Next steps:"
echo "   1. Start the application: docker-compose up --build"
echo "   2. Open http://localhost:5173 in your browser"
echo "   3. Login with demo credentials:"
echo "      • Farmer: farmer@demo.com / demo123"
echo "      • Trader: trader@demo.com / demo123"