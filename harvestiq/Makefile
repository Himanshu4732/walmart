# HarvestIQ Makefile
# Provides convenient commands for development and deployment

.PHONY: help build up down logs seed test clean install dev

# Default target
help:
	@echo "HarvestIQ Development Commands"
	@echo "=============================="
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install     Install all dependencies"
	@echo "  make seed        Seed database with demo data"
	@echo ""
	@echo "Development:"
	@echo "  make dev         Start development servers (without Docker)"
	@echo "  make build       Build Docker images"
	@echo "  make up          Start all services with Docker"
	@echo "  make down        Stop all services"
	@echo "  make logs        Show service logs"
	@echo ""
	@echo "Testing:"
	@echo "  make test        Run all tests"
	@echo "  make test-be     Run backend tests only"
	@echo "  make test-fe     Run frontend tests only"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       Clean up containers and volumes"
	@echo "  make reset       Reset database and reseed"

# Installation
install:
	@echo "📦 Installing dependencies..."
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed!"

# Database seeding
seed:
	@echo "🌱 Seeding database..."
	./scripts/seed.sh

# Development (without Docker)
dev:
	@echo "🚀 Starting development servers..."
	@echo "Starting backend on http://localhost:8000..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
	@echo "Starting frontend on http://localhost:5173..."
	cd frontend && npm run dev &
	@echo "✅ Development servers started!"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "API Docs: http://localhost:8000/docs"

# Docker commands
build:
	@echo "🔨 Building Docker images..."
	docker-compose build

up:
	@echo "🚀 Starting HarvestIQ with Docker..."
	docker-compose up -d
	@echo "✅ HarvestIQ is running!"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

down:
	@echo "🛑 Stopping HarvestIQ..."
	docker-compose down

logs:
	@echo "📋 Showing service logs..."
	docker-compose logs -f

# Testing
test: test-be test-fe

test-be:
	@echo "🧪 Running backend tests..."
	cd backend && python -m pytest test_main.py -v

test-fe:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test

# Maintenance
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup completed!"

reset:
	@echo "🔄 Resetting database..."
	rm -f backend/harvestiq.db backend/test.db
	make seed
	@echo "✅ Database reset completed!"

# Quick start (build, seed, and run)
start: build seed up
	@echo "🎉 HarvestIQ is ready!"
	@echo "Visit http://localhost:5173 to get started"
	@echo "Login with: farmer@demo.com / demo123"