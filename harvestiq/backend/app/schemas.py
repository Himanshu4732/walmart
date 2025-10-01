"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: str = "farmer"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Farm schemas
class FarmBase(BaseModel):
    name: str
    location: str
    crop_type: str
    area: float


class FarmCreate(FarmBase):
    pass


class FarmUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    crop_type: Optional[str] = None
    area: Optional[float] = None


class Farm(FarmBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Prediction schemas
class PredictionBase(BaseModel):
    farm_id: int
    detected_count: int
    predicted_kg: float
    notes: Optional[str] = None


class PredictionCreate(PredictionBase):
    pass


class PredictionUpdate(BaseModel):
    detected_count: Optional[int] = None
    predicted_kg: Optional[float] = None
    notes: Optional[str] = None


class Prediction(PredictionBase):
    id: int
    date: datetime
    image_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Upload response schema
class UploadResponse(BaseModel):
    detected_count: int
    predicted_kg: float
    confidence: float
    boxes: List[dict]
    ripeness_analysis: dict


# Chat schemas
class ChatMessage(BaseModel):
    message: str
    timestamp: datetime
    is_user: bool


class ChatResponse(BaseModel):
    response: str
    timestamp: datetime