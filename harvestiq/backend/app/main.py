"""
HarvestIQ FastAPI application main entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .db import create_tables
from .api import auth, users, farms, predictions

# Create FastAPI app
app = FastAPI(
    title="HarvestIQ API",
    description="AI-driven yield insights platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
os.makedirs("backend/app/static", exist_ok=True)
app.mount("/static", StaticFiles(directory="backend/app/static"), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(farms.router)
app.include_router(predictions.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    create_tables()


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Welcome to HarvestIQ API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)