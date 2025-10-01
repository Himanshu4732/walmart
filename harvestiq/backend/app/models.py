"""
Database models for HarvestIQ application.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class User(Base):
    """User model for authentication and profile management."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, nullable=False, default="farmer")  # farmer, trader, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farms = relationship("Farm", back_populates="owner")


class Farm(Base):
    """Farm model for managing agricultural properties."""
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    crop_type = Column(String, nullable=False)
    area = Column(Float, nullable=False)  # in hectares
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="farms")
    predictions = relationship("Prediction", back_populates="farm")


class Prediction(Base):
    """Prediction model for storing yield predictions and analysis results."""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    detected_count = Column(Integer, nullable=False)  # number of detected items
    predicted_kg = Column(Float, nullable=False)  # predicted yield in kg
    notes = Column(Text, nullable=True)
    image_path = Column(String, nullable=True)  # path to uploaded image
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farm = relationship("Farm", back_populates="predictions")