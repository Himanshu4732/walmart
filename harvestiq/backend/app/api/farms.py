"""
Farm management API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..models import User, Farm
from ..schemas import Farm as FarmSchema, FarmCreate, FarmUpdate
from .auth import get_current_user

router = APIRouter(prefix="/farms", tags=["farms"])


@router.post("/", response_model=FarmSchema)
def create_farm(farm: FarmCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new farm."""
    db_farm = Farm(**farm.dict(), owner_id=current_user.id)
    db.add(db_farm)
    db.commit()
    db.refresh(db_farm)
    return db_farm


@router.get("/", response_model=List[FarmSchema])
def read_farms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all farms for current user."""
    farms = db.query(Farm).filter(Farm.owner_id == current_user.id).offset(skip).limit(limit).all()
    return farms


@router.get("/{farm_id}", response_model=FarmSchema)
def read_farm(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get farm by ID."""
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.owner_id == current_user.id).first()
    if farm is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm


@router.put("/{farm_id}", response_model=FarmSchema)
def update_farm(farm_id: int, farm_update: FarmUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update farm."""
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.owner_id == current_user.id).first()
    if farm is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    # Update fields
    for field, value in farm_update.dict(exclude_unset=True).items():
        setattr(farm, field, value)
    
    db.commit()
    db.refresh(farm)
    return farm


@router.delete("/{farm_id}")
def delete_farm(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete farm."""
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.owner_id == current_user.id).first()
    if farm is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    db.delete(farm)
    db.commit()
    return {"message": "Farm deleted successfully"}