# HarvestIQ ML Integration Guide 🤖

This guide explains how to replace the mock AI components in HarvestIQ with real machine learning models for crop detection, yield prediction, and AI chat assistance.

## 🎯 Overview

HarvestIQ currently includes stub implementations for:
1. **Image Analysis**: Mock crop detection and yield prediction
2. **Chat Assistant**: Mock agricultural advice responses

This guide provides step-by-step instructions to integrate real ML models.

## 🔍 Computer Vision Integration

### Option 1: YOLOv8 Integration (Recommended)

YOLOv8 is excellent for real-time crop detection and counting.

#### 1. Install Dependencies

```bash
cd backend
pip install ultralytics torch torchvision opencv-python pillow
```

#### 2. Prepare Your Model

```python
# ml/train_yolo.py
from ultralytics import YOLO

# Start with a pre-trained model
model = YOLO('yolov8n.pt')  # nano model for speed

# Train on your crop dataset
results = model.train(
    data='path/to/your/crop_dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16
)

# Save the trained model
model.save('models/crop_detector.pt')
```

#### 3. Dataset Format

Create a dataset in YOLO format:

```yaml
# crop_dataset.yaml
path: /path/to/dataset
train: images/train
val: images/val

# Classes
nc: 4  # number of classes
names: ['tomato', 'apple', 'strawberry', 'orange']
```

Directory structure:
```
dataset/
├── images/
│   ├── train/
│   │   ├── img1.jpg
│   │   └── img2.jpg
│   └── val/
│       ├── img3.jpg
│       └── img4.jpg
└── labels/
    ├── train/
    │   ├── img1.txt
    │   └── img2.txt
    └── val/
        ├── img3.txt
        └── img4.txt
```

#### 4. Replace Mock Function

Update `backend/app/utils.py`:

```python
import torch
from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path

# Load model once at startup
MODEL_PATH = "ml/models/crop_detector.pt"
model = None

def load_yolo_model():
    global model
    if model is None:
        if Path(MODEL_PATH).exists():
            model = YOLO(MODEL_PATH)
        else:
            # Fallback to pre-trained model
            model = YOLO('yolov8n.pt')
    return model

def real_ai_prediction(image_path: str) -> dict:
    """
    Real AI prediction using YOLOv8 model.
    """
    try:
        model = load_yolo_model()
        
        # Run inference
        results = model(image_path, conf=0.5)
        
        # Process results
        boxes = []
        total_confidence = 0
        
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                
                boxes.append({
                    "x": int(x1),
                    "y": int(y1),
                    "width": int(x2 - x1),
                    "height": int(y2 - y1),
                    "confidence": conf,
                    "class": model.names[cls]
                })
                total_confidence += conf
        
        detected_count = len(boxes)
        avg_confidence = total_confidence / detected_count if detected_count > 0 else 0
        
        # Calculate yield based on crop type and size
        predicted_kg = calculate_yield_from_detections(boxes, image_path)
        
        # Analyze ripeness (if you have a ripeness model)
        ripeness_analysis = analyze_ripeness(image_path, boxes)
        
        return {
            "detected_count": detected_count,
            "predicted_kg": predicted_kg,
            "confidence": avg_confidence,
            "boxes": boxes,
            "ripeness_analysis": ripeness_analysis
        }
        
    except Exception as e:
        print(f"Error in AI prediction: {e}")
        # Fallback to mock prediction
        return mock_ai_prediction(image_path)

def calculate_yield_from_detections(boxes: list, image_path: str) -> float:
    """
    Calculate yield based on detected objects and crop type.
    """
    # Load image to get dimensions
    image = cv2.imread(image_path)
    height, width = image.shape[:2]
    
    total_yield = 0
    
    for box in boxes:
        # Calculate object size relative to image
        object_area = (box["width"] * box["height"]) / (width * height)
        
        # Yield per object based on crop type and size
        if box["class"] == "tomato":
            yield_per_item = 0.15 + (object_area * 0.5)  # 150g base + size factor
        elif box["class"] == "apple":
            yield_per_item = 0.18 + (object_area * 0.6)  # 180g base + size factor
        elif box["class"] == "strawberry":
            yield_per_item = 0.02 + (object_area * 0.1)  # 20g base + size factor
        else:
            yield_per_item = 0.1  # Default
        
        total_yield += yield_per_item * box["confidence"]
    
    return round(total_yield, 2)

def analyze_ripeness(image_path: str, boxes: list) -> dict:
    """
    Analyze ripeness of detected crops.
    This is a simplified example - you'd want a dedicated ripeness model.
    """
    image = cv2.imread(image_path)
    
    ripe_count = 0
    nearly_ripe_count = 0
    unripe_count = 0
    
    for box in boxes:
        # Extract crop region
        x, y, w, h = box["x"], box["y"], box["width"], box["height"]
        crop_region = image[y:y+h, x:x+w]
        
        # Simple color-based ripeness analysis
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(crop_region, cv2.COLOR_BGR2HSV)
        
        # Define color ranges for ripeness (example for tomatoes)
        red_lower = np.array([0, 50, 50])
        red_upper = np.array([10, 255, 255])
        red_mask = cv2.inRange(hsv, red_lower, red_upper)
        
        green_lower = np.array([40, 50, 50])
        green_upper = np.array([80, 255, 255])
        green_mask = cv2.inRange(hsv, green_lower, green_upper)
        
        red_pixels = cv2.countNonZero(red_mask)
        green_pixels = cv2.countNonZero(green_mask)
        total_pixels = crop_region.shape[0] * crop_region.shape[1]
        
        red_ratio = red_pixels / total_pixels
        green_ratio = green_pixels / total_pixels
        
        if red_ratio > 0.3:
            ripe_count += 1
        elif red_ratio > 0.1 or green_ratio > 0.2:
            nearly_ripe_count += 1
        else:
            unripe_count += 1
    
    total_items = len(boxes)
    avg_ripeness = (ripe_count + 0.5 * nearly_ripe_count) / total_items if total_items > 0 else 0
    
    return {
        "ripe": ripe_count,
        "nearly_ripe": nearly_ripe_count,
        "unripe": unripe_count,
        "average_ripeness": round(avg_ripeness, 2)
    }
```

#### 5. Update API Endpoint

Modify `backend/app/api/predictions.py`:

```python
# Replace the mock call with real prediction
from ..utils import real_ai_prediction

@router.post("/upload-stub", response_model=UploadResponse)
async def upload_image_analysis(  # Rename from upload_image_stub
    farm_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload image and get AI-powered crop analysis.
    """
    # ... existing validation code ...
    
    # Get real AI prediction instead of mock
    prediction_result = real_ai_prediction(file_path)
    
    # ... rest of the function ...
```

### Option 2: ONNX Model Integration

For production deployment with optimized models:

#### 1. Install ONNX Runtime

```bash
pip install onnxruntime opencv-python numpy
```

#### 2. Convert Your Model to ONNX

```python
# ml/convert_to_onnx.py
import torch
from ultralytics import YOLO

# Load your trained model
model = YOLO('models/crop_detector.pt')

# Export to ONNX
model.export(format='onnx', imgsz=640)
```

#### 3. ONNX Inference Function

```python
import onnxruntime as ort
import cv2
import numpy as np

class ONNXCropDetector:
    def __init__(self, model_path: str):
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        self.output_names = [output.name for output in self.session.get_outputs()]
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for ONNX model."""
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (640, 640))
        
        # Normalize
        image = image.astype(np.float32) / 255.0
        
        # Transpose to CHW format
        image = np.transpose(image, (2, 0, 1))
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        return image
    
    def postprocess_outputs(self, outputs: list) -> list:
        """Process ONNX model outputs."""
        # This depends on your specific model architecture
        # Example for YOLOv8 ONNX output
        predictions = outputs[0]  # Shape: [1, 84, 8400]
        
        boxes = []
        for i in range(predictions.shape[2]):
            # Extract box coordinates and confidence
            x, y, w, h = predictions[0, :4, i]
            confidence = predictions[0, 4, i]
            class_scores = predictions[0, 5:, i]
            
            if confidence > 0.5:
                class_id = np.argmax(class_scores)
                boxes.append({
                    "x": int(x - w/2),
                    "y": int(y - h/2),
                    "width": int(w),
                    "height": int(h),
                    "confidence": float(confidence),
                    "class_id": int(class_id)
                })
        
        return boxes
    
    def predict(self, image_path: str) -> dict:
        """Run inference on image."""
        # Preprocess
        input_tensor = self.preprocess_image(image_path)
        
        # Run inference
        outputs = self.session.run(self.output_names, {self.input_name: input_tensor})
        
        # Postprocess
        boxes = self.postprocess_outputs(outputs)
        
        return {
            "detected_count": len(boxes),
            "predicted_kg": self.calculate_yield(boxes),
            "confidence": np.mean([box["confidence"] for box in boxes]) if boxes else 0,
            "boxes": boxes,
            "ripeness_analysis": self.analyze_ripeness(image_path, boxes)
        }

# Usage
detector = ONNXCropDetector('models/crop_detector.onnx')

def onnx_ai_prediction(image_path: str) -> dict:
    return detector.predict(image_path)
```

## 💬 Chat Assistant Integration

### Option 1: OpenAI GPT Integration

#### 1. Install OpenAI SDK

```bash
pip install openai
```

#### 2. Update Chat Function

```python
# backend/app/utils.py
import openai
import os
from sqlalchemy.orm import Session

openai.api_key = os.getenv("OPENAI_API_KEY")

def real_chat_response(message: str, user_id: int, db: Session) -> str:
    """
    Real chat response using OpenAI GPT.
    """
    try:
        # Get user context
        user_context = get_user_context(user_id, db)
        
        # Build system prompt with user's farm data
        system_prompt = f"""
        You are an expert agricultural AI assistant helping farmers optimize their crop yields.
        
        User Context:
        - Farms: {', '.join([f"{f['name']} ({f['crop_type']}, {f['area']} ha)" for f in user_context['farms']])}
        - Recent average yield: {user_context['avg_yield']} kg
        - Total predictions: {user_context['prediction_count']}
        - Primary crops: {', '.join(user_context['crop_types'])}
        
        Provide helpful, specific advice about farming, weather, market conditions, and crop management.
        Keep responses concise but informative. Use farming terminology appropriately.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Fallback to mock response
        return mock_chat_response(message)

def get_user_context(user_id: int, db: Session) -> dict:
    """Get user's farm and prediction context for AI chat."""
    from .models import User, Farm, Prediction
    
    user = db.query(User).filter(User.id == user_id).first()
    farms = db.query(Farm).filter(Farm.owner_id == user_id).all()
    predictions = db.query(Prediction).join(Farm).filter(Farm.owner_id == user_id).all()
    
    farm_data = [
        {
            "name": farm.name,
            "crop_type": farm.crop_type,
            "area": farm.area,
            "location": farm.location
        }
        for farm in farms
    ]
    
    avg_yield = sum(p.predicted_kg for p in predictions) / len(predictions) if predictions else 0
    crop_types = list(set(farm.crop_type for farm in farms))
    
    return {
        "farms": farm_data,
        "avg_yield": round(avg_yield, 1),
        "prediction_count": len(predictions),
        "crop_types": crop_types
    }
```

#### 3. Update API Endpoint

```python
# backend/app/api/predictions.py
from ..utils import real_chat_response

@router.post("/chat", response_model=ChatResponse)
def chat_assistant(
    message: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Chat with AI agricultural assistant.
    """
    from datetime import datetime
    
    response = real_chat_response(message, current_user.id, db)
    
    return ChatResponse(
        response=response,
        timestamp=datetime.utcnow()
    )
```

### Option 2: HuggingFace Transformers

For self-hosted models:

#### 1. Install Transformers

```bash
pip install transformers torch
```

#### 2. Load Agricultural Model

```python
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

class AgriculturalChatbot:
    def __init__(self):
        # Use a general conversational model or fine-tune on agricultural data
        self.tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
        self.model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
        self.chat_history = []
    
    def generate_response(self, message: str, context: dict) -> str:
        # Add agricultural context to the message
        contextual_message = f"""
        Farm Context: {context.get('farms', 'No farms')}
        Recent Yield: {context.get('avg_yield', 0)} kg
        
        Farmer Question: {message}
        
        Agricultural Assistant:"""
        
        # Encode and generate
        inputs = self.tokenizer.encode(contextual_message, return_tensors='pt')
        
        with torch.no_grad():
            outputs = self.model.generate(
                inputs,
                max_length=inputs.shape[1] + 100,
                num_return_sequences=1,
                temperature=0.7,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract just the assistant's response
        assistant_response = response.split("Agricultural Assistant:")[-1].strip()
        
        return assistant_response

# Initialize once
chatbot = AgriculturalChatbot()

def huggingface_chat_response(message: str, user_context: dict) -> str:
    return chatbot.generate_response(message, user_context)
```

## 🚀 Deployment Considerations

### Model Storage

#### Option 1: Local Storage
```python
# Store models in the container
COPY models/ /app/models/
```

#### Option 2: Cloud Storage
```python
import boto3
from pathlib import Path

def download_model_from_s3():
    s3 = boto3.client('s3')
    model_path = 'models/crop_detector.pt'
    
    if not Path(model_path).exists():
        s3.download_file('your-bucket', 'models/crop_detector.pt', model_path)
    
    return model_path
```

### GPU Support

Update `docker-compose.yml` for GPU inference:

```yaml
services:
  backend:
    build: ./backend
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

### Model Optimization

#### 1. TensorRT Optimization (NVIDIA GPUs)
```python
# Convert ONNX to TensorRT
import tensorrt as trt

def build_tensorrt_engine(onnx_path: str, engine_path: str):
    logger = trt.Logger(trt.Logger.WARNING)
    builder = trt.Builder(logger)
    network = builder.create_network()
    parser = trt.OnnxParser(network, logger)
    
    with open(onnx_path, 'rb') as model:
        parser.parse(model.read())
    
    config = builder.create_builder_config()
    config.max_workspace_size = 1 << 30  # 1GB
    
    engine = builder.build_engine(network, config)
    
    with open(engine_path, 'wb') as f:
        f.write(engine.serialize())
```

#### 2. Quantization
```python
# Quantize model for faster inference
from ultralytics import YOLO

model = YOLO('models/crop_detector.pt')
model.export(format='onnx', int8=True)  # INT8 quantization
```

## 📊 Monitoring & Analytics

### Model Performance Tracking

```python
# backend/app/models.py
class PredictionMetrics(Base):
    __tablename__ = "prediction_metrics"
    
    id = Column(Integer, primary_key=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"))
    model_version = Column(String)
    inference_time = Column(Float)  # seconds
    confidence_score = Column(Float)
    accuracy_feedback = Column(Float)  # user feedback
    created_at = Column(DateTime, default=datetime.utcnow)

# Track metrics
def track_prediction_metrics(prediction_id: int, inference_time: float, confidence: float):
    metrics = PredictionMetrics(
        prediction_id=prediction_id,
        model_version="yolov8_v1.0",
        inference_time=inference_time,
        confidence_score=confidence
    )
    db.add(metrics)
    db.commit()
```

### A/B Testing

```python
import random

def get_model_version(user_id: int) -> str:
    """A/B test different model versions."""
    if user_id % 10 < 5:  # 50% split
        return "yolov8_v1.0"
    else:
        return "yolov8_v2.0"

def ai_prediction_with_ab_test(image_path: str, user_id: int) -> dict:
    model_version = get_model_version(user_id)
    
    if model_version == "yolov8_v1.0":
        return yolov8_v1_prediction(image_path)
    else:
        return yolov8_v2_prediction(image_path)
```

## 🔧 Configuration

### Environment Variables

Add to `.env`:

```bash
# ML Configuration
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Model paths
YOLO_MODEL_PATH=models/crop_detector.pt
ONNX_MODEL_PATH=models/crop_detector.onnx
TENSORRT_ENGINE_PATH=models/crop_detector.engine

# Inference settings
MAX_INFERENCE_TIME=30  # seconds
CONFIDENCE_THRESHOLD=0.5
GPU_ENABLED=true

# Model storage
MODEL_STORAGE_TYPE=local  # local, s3, gcs
S3_BUCKET=your-model-bucket
S3_REGION=us-west-2
```

### Model Configuration

```python
# ml/config.py
import os
from pathlib import Path

class MLConfig:
    # Model paths
    YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "models/crop_detector.pt")
    ONNX_MODEL_PATH = os.getenv("ONNX_MODEL_PATH", "models/crop_detector.onnx")
    
    # Inference settings
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))
    MAX_INFERENCE_TIME = int(os.getenv("MAX_INFERENCE_TIME", "30"))
    GPU_ENABLED = os.getenv("GPU_ENABLED", "false").lower() == "true"
    
    # OpenAI settings
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    @classmethod
    def validate(cls):
        """Validate configuration."""
        if cls.OPENAI_API_KEY and not Path(cls.YOLO_MODEL_PATH).exists():
            print("Warning: YOLO model not found, using mock predictions")
        
        if not cls.OPENAI_API_KEY:
            print("Warning: OpenAI API key not set, using mock chat responses")
```

## 🧪 Testing ML Components

### Unit Tests for ML Functions

```python
# backend/test_ml.py
import pytest
from app.utils import real_ai_prediction, real_chat_response
from unittest.mock import patch, MagicMock

class TestMLIntegration:
    
    @patch('app.utils.YOLO')
    def test_yolo_prediction(self, mock_yolo):
        """Test YOLOv8 prediction function."""
        # Mock YOLO results
        mock_result = MagicMock()
        mock_result.boxes = [MagicMock()]
        mock_result.boxes[0].xyxy = [[10, 10, 50, 50]]
        mock_result.boxes[0].conf = [0.85]
        mock_result.boxes[0].cls = [0]
        
        mock_yolo.return_value.return_value = [mock_result]
        mock_yolo.return_value.names = {0: "tomato"}
        
        result = real_ai_prediction("test_image.jpg")
        
        assert result["detected_count"] == 1
        assert result["confidence"] > 0
        assert len(result["boxes"]) == 1
    
    @patch('app.utils.openai.ChatCompletion.create')
    def test_openai_chat(self, mock_openai):
        """Test OpenAI chat integration."""
        mock_openai.return_value.choices = [
            MagicMock(message=MagicMock(content="Great question about farming!"))
        ]
        
        response = real_chat_response("How are my crops?", 1, MagicMock())
        
        assert "farming" in response.lower()
        mock_openai.assert_called_once()
```

### Performance Tests

```python
import time
import pytest

def test_inference_performance():
    """Test that inference completes within acceptable time."""
    start_time = time.time()
    
    result = real_ai_prediction("test_image.jpg")
    
    inference_time = time.time() - start_time
    assert inference_time < 5.0  # Should complete in under 5 seconds
    assert result["detected_count"] >= 0
```

## 📈 Next Steps

1. **Collect Training Data**: Gather crop images with annotations
2. **Train Custom Models**: Fine-tune YOLOv8 on your specific crops
3. **Implement Feedback Loop**: Allow users to correct predictions
4. **Add More Crops**: Expand to support additional crop types
5. **Advanced Analytics**: Implement trend analysis and forecasting
6. **Mobile App**: Create mobile app for field data collection

## 🆘 Troubleshooting

### Common Issues

#### CUDA Out of Memory
```python
# Reduce batch size or use CPU
device = 'cpu' if torch.cuda.is_available() else 'cpu'
model = YOLO('model.pt').to(device)
```

#### Model Loading Errors
```python
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Model loading failed: {e}")
    # Fallback to mock predictions
    return mock_ai_prediction(image_path)
```

#### OpenAI Rate Limits
```python
import time
from openai.error import RateLimitError

def chat_with_retry(message: str, max_retries: int = 3) -> str:
    for attempt in range(max_retries):
        try:
            return openai.ChatCompletion.create(...)
        except RateLimitError:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                return mock_chat_response(message)
```

---

**Ready to revolutionize agriculture with AI!** 🚜🤖

For questions or support, check the main README or open an issue on GitHub.