"""
Prediction management API endpoints.
"""
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..models import User, Farm, Prediction
from ..schemas import (
    Prediction as PredictionSchema, 
    PredictionCreate, 
    PredictionUpdate,
    UploadResponse,
    ChatResponse
)
from .auth import get_current_user
from ..utils import mock_ai_prediction, mock_chat_response

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("/", response_model=PredictionSchema)
def create_prediction(prediction: PredictionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new prediction."""
    # Verify farm ownership
    farm = db.query(Farm).filter(Farm.id == prediction.farm_id, Farm.owner_id == current_user.id).first()
    if farm is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    db_prediction = Prediction(**prediction.dict())
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction


@router.get("/", response_model=List[PredictionSchema])
def read_predictions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all predictions for current user's farms."""
    predictions = (
        db.query(Prediction)
        .join(Farm)
        .filter(Farm.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return predictions


@router.get("/farm/{farm_id}", response_model=List[PredictionSchema])
def read_farm_predictions(farm_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get predictions for a specific farm."""
    # Verify farm ownership
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.owner_id == current_user.id).first()
    if farm is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    predictions = (
        db.query(Prediction)
        .filter(Prediction.farm_id == farm_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return predictions


@router.get("/{prediction_id}", response_model=PredictionSchema)
def read_prediction(prediction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get prediction by ID."""
    prediction = (
        db.query(Prediction)
        .join(Farm)
        .filter(Prediction.id == prediction_id, Farm.owner_id == current_user.id)
        .first()
    )
    if prediction is None:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction


@router.put("/{prediction_id}", response_model=PredictionSchema)
def update_prediction(prediction_id: int, prediction_update: PredictionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update prediction."""
    prediction = (
        db.query(Prediction)
        .join(Farm)
        .filter(Prediction.id == prediction_id, Farm.owner_id == current_user.id)
        .first()
    )
    if prediction is None:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Update fields
    for field, value in prediction_update.dict(exclude_unset=True).items():
        setattr(prediction, field, value)
    
    db.commit()
    db.refresh(prediction)
    return prediction


@router.delete("/{prediction_id}")
def delete_prediction(prediction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete prediction."""
    prediction = (
        db.query(Prediction)
        .join(Farm)
        .filter(Prediction.id == prediction_id, Farm.owner_id == current_user.id)
        .first()
    )
    if prediction is None:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Delete associated image file if exists
    if prediction.image_path and os.path.exists(prediction.image_path):
        os.remove(prediction.image_path)
    
    db.delete(prediction)
    db.commit()
    return {"message": "Prediction deleted successfully"}


@router.post("/upload-stub", response_model=UploadResponse)
async def upload_image_stub(
    farm_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload image and get mock AI prediction.
    This is a stub endpoint that returns deterministic mock results.
    Replace with actual ML inference in production.
    """
    # Verify farm ownership
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.owner_id == current_user.id).first()
    if farm is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save uploaded file
    upload_dir = "backend/app/static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, f"{current_user.id}_{farm_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get mock AI prediction
    prediction_result = mock_ai_prediction(file_path)
    
    # Create prediction record
    db_prediction = Prediction(
        farm_id=farm_id,
        detected_count=prediction_result["detected_count"],
        predicted_kg=prediction_result["predicted_kg"],
        notes=f"Auto-generated from image upload: {file.filename}",
        image_path=file_path
    )
    db.add(db_prediction)
    db.commit()
    
    return UploadResponse(**prediction_result)


@router.post("/chat", response_model=ChatResponse)
def chat_stub(message: str, current_user: User = Depends(get_current_user)):
    """
    Mock chat endpoint for AI assistant.
    Replace with actual LLM integration in production.
    """
    from datetime import datetime
    
    response = mock_chat_response(message)
    
    return ChatResponse(
        response=response,
        timestamp=datetime.utcnow()
    )