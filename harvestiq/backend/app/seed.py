"""
Seed script for HarvestIQ database.
Creates demo users, farms, and predictions for testing and demonstration.
"""
import os
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal, create_tables
from app.models import User, Farm, Prediction
from app.utils import get_password_hash


def create_demo_users(db: Session):
    """Create demo users."""
    print("Creating demo users...")
    
    # Demo farmer
    farmer = User(
        email="farmer@demo.com",
        hashed_password=get_password_hash("demo123"),
        name="John Farmer",
        phone="+1-555-0101",
        role="farmer"
    )
    db.add(farmer)
    
    # Demo trader
    trader = User(
        email="trader@demo.com",
        hashed_password=get_password_hash("demo123"),
        name="Sarah Trader",
        phone="+1-555-0102",
        role="trader"
    )
    db.add(trader)
    
    db.commit()
    db.refresh(farmer)
    db.refresh(trader)
    
    print(f"✓ Created farmer: {farmer.email} (ID: {farmer.id})")
    print(f"✓ Created trader: {trader.email} (ID: {trader.id})")
    
    return farmer, trader


def create_demo_farms(db: Session, farmer: User):
    """Create demo farms for the farmer."""
    print("Creating demo farms...")
    
    farms_data = [
        {
            "name": "Sunny Acres Tomato Farm",
            "location": "California, USA",
            "crop_type": "tomatoes",
            "area": 12.5,
        },
        {
            "name": "Green Valley Orchard",
            "location": "Washington, USA", 
            "crop_type": "apples",
            "area": 8.3,
        },
        {
            "name": "Berry Fields",
            "location": "Oregon, USA",
            "crop_type": "strawberries",
            "area": 3.7,
        }
    ]
    
    farms = []
    for farm_data in farms_data:
        farm = Farm(
            **farm_data,
            owner_id=farmer.id
        )
        db.add(farm)
        farms.append(farm)
    
    db.commit()
    
    for farm in farms:
        db.refresh(farm)
        print(f"✓ Created farm: {farm.name} ({farm.crop_type}, {farm.area} ha)")
    
    return farms


def create_demo_predictions(db: Session, farms: list[Farm]):
    """Create demo predictions for the farms."""
    print("Creating demo predictions...")
    
    predictions_data = [
        # Tomato farm predictions
        {
            "farm_id": farms[0].id,
            "detected_count": 45,
            "predicted_kg": 38.2,
            "notes": "High density planting showing excellent results",
            "days_ago": 1
        },
        {
            "farm_id": farms[0].id,
            "detected_count": 42,
            "predicted_kg": 35.8,
            "notes": "Slight decrease due to weather conditions",
            "days_ago": 3
        },
        {
            "farm_id": farms[0].id,
            "detected_count": 38,
            "predicted_kg": 32.1,
            "notes": "Early season prediction",
            "days_ago": 7
        },
        
        # Apple orchard predictions
        {
            "farm_id": farms[1].id,
            "detected_count": 156,
            "predicted_kg": 187.2,
            "notes": "Excellent apple development this season",
            "days_ago": 2
        },
        {
            "farm_id": farms[1].id,
            "detected_count": 148,
            "predicted_kg": 177.6,
            "notes": "Good growth despite dry spell",
            "days_ago": 5
        },
        
        # Strawberry field predictions
        {
            "farm_id": farms[2].id,
            "detected_count": 89,
            "predicted_kg": 26.7,
            "notes": "Peak strawberry season approaching",
            "days_ago": 1
        },
        {
            "farm_id": farms[2].id,
            "detected_count": 76,
            "predicted_kg": 22.8,
            "notes": "Steady growth observed",
            "days_ago": 4
        },
        {
            "farm_id": farms[2].id,
            "detected_count": 65,
            "predicted_kg": 19.5,
            "notes": "Early berry development",
            "days_ago": 8
        }
    ]
    
    predictions = []
    for pred_data in predictions_data:
        days_ago = pred_data.pop("days_ago")
        prediction_date = datetime.utcnow() - timedelta(days=days_ago)
        
        prediction = Prediction(
            **pred_data,
            date=prediction_date,
            created_at=prediction_date
        )
        db.add(prediction)
        predictions.append(prediction)
    
    db.commit()
    
    for prediction in predictions:
        db.refresh(prediction)
        farm_name = next(f.name for f in farms if f.id == prediction.farm_id)
        print(f"✓ Created prediction: {farm_name} - {prediction.predicted_kg} kg ({prediction.detected_count} items)")
    
    return predictions


def create_sample_images():
    """Create placeholder sample images."""
    print("Creating sample image placeholders...")
    
    sample_images_dir = "app/static/sample_images"
    os.makedirs(sample_images_dir, exist_ok=True)
    
    # Create placeholder text files for sample images
    # In a real implementation, these would be actual crop images
    sample_files = [
        "tomatoes.jpg",
        "apples.jpg", 
        "strawberries.jpg",
        "oranges.jpg"
    ]
    
    for filename in sample_files:
        filepath = os.path.join(sample_images_dir, filename)
        if not os.path.exists(filepath):
            with open(filepath, 'w') as f:
                f.write(f"# Placeholder for {filename}\n")
                f.write("# In production, this would be an actual crop image\n")
                f.write(f"# Replace with real {filename.split('.')[0]} images for ML training\n")
            print(f"✓ Created placeholder: {filename}")


def seed_database():
    """Main seeding function."""
    print("🌱 Starting HarvestIQ database seeding...")
    print("=" * 50)
    
    # Create tables
    create_tables()
    print("✓ Database tables created/verified")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"⚠️  Database already contains {existing_users} users.")
            response = input("Do you want to continue and add more demo data? (y/N): ")
            if response.lower() != 'y':
                print("Seeding cancelled.")
                return
        
        # Create demo data
        farmer, trader = create_demo_users(db)
        farms = create_demo_farms(db, farmer)
        predictions = create_demo_predictions(db, farms)
        create_sample_images()
        
        print("=" * 50)
        print("🎉 Database seeding completed successfully!")
        print("\nDemo credentials:")
        print("📧 Farmer: farmer@demo.com / demo123")
        print("📧 Trader: trader@demo.com / demo123")
        print(f"\n📊 Created:")
        print(f"   • 2 users")
        print(f"   • {len(farms)} farms")
        print(f"   • {len(predictions)} predictions")
        print(f"   • 4 sample image placeholders")
        
        print("\n🚀 You can now start the application and login with the demo credentials!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()