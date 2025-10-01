"""
Test suite for HarvestIQ backend API.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db import get_db, Base
from app.utils import get_password_hash

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_database():
    """Create test database tables."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user_data():
    """Test user data."""
    return {
        "email": "test@example.com",
        "password": "testpass123",
        "name": "Test User",
        "role": "farmer"
    }


@pytest.fixture
def authenticated_headers(test_user_data, setup_database):
    """Get authentication headers for test user."""
    # Register user
    client.post("/auth/register", json=test_user_data)
    
    # Login
    response = client.post("/auth/token", data={
        "username": test_user_data["email"],
        "password": test_user_data["password"]
    })
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}


class TestAuth:
    """Test authentication endpoints."""
    
    def test_register_user(self, setup_database, test_user_data):
        """Test user registration."""
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["name"] == test_user_data["name"]
        assert "id" in data
    
    def test_register_duplicate_email(self, setup_database, test_user_data):
        """Test registration with duplicate email."""
        # Register first user
        client.post("/auth/register", json=test_user_data)
        
        # Try to register again with same email
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_login_valid_credentials(self, setup_database, test_user_data):
        """Test login with valid credentials."""
        # Register user first
        client.post("/auth/register", json=test_user_data)
        
        # Login
        response = client.post("/auth/token", data={
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, setup_database, test_user_data):
        """Test login with invalid credentials."""
        response = client.post("/auth/token", data={
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_get_current_user(self, authenticated_headers, test_user_data):
        """Test getting current user profile."""
        response = client.get("/auth/me", headers=authenticated_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["name"] == test_user_data["name"]


class TestFarms:
    """Test farm management endpoints."""
    
    def test_create_farm(self, authenticated_headers):
        """Test creating a new farm."""
        farm_data = {
            "name": "Test Farm",
            "location": "Test Location",
            "crop_type": "tomatoes",
            "area": 5.5
        }
        
        response = client.post("/farms/", json=farm_data, headers=authenticated_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == farm_data["name"]
        assert data["location"] == farm_data["location"]
        assert data["crop_type"] == farm_data["crop_type"]
        assert data["area"] == farm_data["area"]
        assert "id" in data
    
    def test_get_farms(self, authenticated_headers):
        """Test getting user's farms."""
        # Create a farm first
        farm_data = {
            "name": "Test Farm 2",
            "location": "Test Location 2",
            "crop_type": "apples",
            "area": 3.2
        }
        client.post("/farms/", json=farm_data, headers=authenticated_headers)
        
        # Get farms
        response = client.get("/farms/", headers=authenticated_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_farm_by_id(self, authenticated_headers):
        """Test getting a specific farm by ID."""
        # Create a farm first
        farm_data = {
            "name": "Test Farm 3",
            "location": "Test Location 3",
            "crop_type": "oranges",
            "area": 2.1
        }
        create_response = client.post("/farms/", json=farm_data, headers=authenticated_headers)
        farm_id = create_response.json()["id"]
        
        # Get the farm
        response = client.get(f"/farms/{farm_id}", headers=authenticated_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == farm_id
        assert data["name"] == farm_data["name"]


class TestPredictions:
    """Test prediction management endpoints."""
    
    @pytest.fixture
    def test_farm_id(self, authenticated_headers):
        """Create a test farm and return its ID."""
        farm_data = {
            "name": "Prediction Test Farm",
            "location": "Test Location",
            "crop_type": "strawberries",
            "area": 1.5
        }
        response = client.post("/farms/", json=farm_data, headers=authenticated_headers)
        return response.json()["id"]
    
    def test_create_prediction(self, authenticated_headers, test_farm_id):
        """Test creating a new prediction."""
        prediction_data = {
            "farm_id": test_farm_id,
            "detected_count": 25,
            "predicted_kg": 12.5,
            "notes": "Test prediction"
        }
        
        response = client.post("/predictions/", json=prediction_data, headers=authenticated_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["farm_id"] == prediction_data["farm_id"]
        assert data["detected_count"] == prediction_data["detected_count"]
        assert data["predicted_kg"] == prediction_data["predicted_kg"]
        assert data["notes"] == prediction_data["notes"]
        assert "id" in data
    
    def test_get_predictions(self, authenticated_headers, test_farm_id):
        """Test getting user's predictions."""
        # Create a prediction first
        prediction_data = {
            "farm_id": test_farm_id,
            "detected_count": 30,
            "predicted_kg": 15.0,
            "notes": "Another test prediction"
        }
        client.post("/predictions/", json=prediction_data, headers=authenticated_headers)
        
        # Get predictions
        response = client.get("/predictions/", headers=authenticated_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_chat_endpoint(self, authenticated_headers):
        """Test the chat stub endpoint."""
        response = client.post("/predictions/chat?message=Hello", headers=authenticated_headers)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "timestamp" in data
        assert isinstance(data["response"], str)


class TestHealthCheck:
    """Test health check and root endpoints."""
    
    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


if __name__ == "__main__":
    pytest.main([__file__])