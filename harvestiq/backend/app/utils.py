"""
Utility functions for authentication and other common operations.
"""
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from .schemas import TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, credentials_exception) -> TokenData:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    return token_data


def mock_ai_prediction(image_path: Optional[str] = None) -> dict:
    """
    Mock AI prediction function that returns deterministic results.
    In production, this would be replaced with actual ML inference.
    """
    import random
    import hashlib
    
    # Use image path or current time to generate deterministic results
    seed_str = image_path or str(datetime.now().hour)
    seed = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
    random.seed(seed)
    
    detected_count = random.randint(15, 45)
    predicted_kg = round(detected_count * random.uniform(0.8, 1.2), 2)
    confidence = round(random.uniform(0.75, 0.95), 2)
    
    # Mock bounding boxes
    boxes = []
    for i in range(detected_count):
        boxes.append({
            "x": random.randint(10, 400),
            "y": random.randint(10, 300),
            "width": random.randint(20, 60),
            "height": random.randint(20, 60),
            "confidence": round(random.uniform(0.6, 0.9), 2)
        })
    
    # Mock ripeness analysis
    ripeness_analysis = {
        "ripe": random.randint(5, 15),
        "nearly_ripe": random.randint(5, 15),
        "unripe": random.randint(5, 15),
        "average_ripeness": round(random.uniform(0.6, 0.8), 2)
    }
    
    return {
        "detected_count": detected_count,
        "predicted_kg": predicted_kg,
        "confidence": confidence,
        "boxes": boxes,
        "ripeness_analysis": ripeness_analysis
    }


def mock_chat_response(message: str) -> str:
    """
    Mock chat response function.
    In production, this would be replaced with actual LLM integration.
    """
    responses = [
        "Based on your farm data, I recommend checking soil moisture levels.",
        "The weather forecast shows optimal conditions for harvesting next week.",
        "Your yield predictions look promising! Consider planning for storage capacity.",
        "I notice your crop density is higher than average. This could increase yield by 15%.",
        "Would you like me to analyze the latest satellite imagery of your farm?",
        "The market prices for your crop type are trending upward this season."
    ]
    
    # Simple keyword-based responses
    message_lower = message.lower()
    if "weather" in message_lower:
        return "The weather forecast shows sunny conditions with moderate rainfall expected. Perfect for crop growth!"
    elif "yield" in message_lower or "harvest" in message_lower:
        return "Based on your recent predictions, you're on track for a 20% increase in yield compared to last season."
    elif "price" in message_lower or "market" in message_lower:
        return "Current market prices are favorable. I recommend harvesting within the next 2 weeks for optimal returns."
    else:
        import random
        return random.choice(responses)