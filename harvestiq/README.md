# HarvestIQ 🌱

**AI-Driven Yield Insights Platform**

HarvestIQ is a full-stack web application that provides farmers and agricultural traders with AI-powered crop yield predictions and insights. Built with modern technologies and designed for scalability, it offers a complete solution for agricultural data management and analysis.

![HarvestIQ Dashboard](https://via.placeholder.com/800x400/369b5c/ffffff?text=HarvestIQ+Dashboard)

## ✨ Features

### 🔐 **Authentication & User Management**
- JWT-based secure authentication
- Role-based access control (Farmer, Trader, Admin)
- User profile management with phone and role information

### 🚜 **Farm Management**
- Create and manage multiple farms
- Track farm details: location, crop type, area
- Farm-specific yield predictions and analytics

### 📊 **Yield Predictions**
- AI-powered crop detection and yield estimation
- Image upload and analysis (stub implementation)
- Historical prediction tracking and trends
- Manual prediction entry and editing

### 📈 **Dashboard & Analytics**
- Real-time yield statistics and trends
- Interactive charts showing prediction history
- Season-over-season performance tracking
- Mobile-responsive design

### 🤖 **AI Assistant (Stub)**
- Chat widget for agricultural insights
- Mock responses for weather, market, and farming advice
- Persistent chat history in localStorage
- Ready for LLM integration (OpenAI, HuggingFace)

### 📱 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Accessible components with ARIA labels
- Earthy green theme optimized for agricultural use
- Mobile-first approach

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy** ORM with SQLite (Postgres-compatible)
- **JWT** authentication with python-jose
- **Pydantic** for data validation
- **Uvicorn** ASGI server

### DevOps & Testing
- **Docker** & **docker-compose** for containerization
- **pytest** for backend testing
- **Vitest** & **React Testing Library** for frontend testing
- **GitHub Actions** for CI/CD
- **ESLint** & **Prettier** for code quality

## 🚀 Quick Start

### One-Command Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd harvestiq

# Start everything with Docker
docker-compose up --build

# In another terminal, seed the database
make seed
```

**That's it!** 🎉

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Farmer | `farmer@demo.com` | `demo123` |
| Trader | `trader@demo.com` | `demo123` |

## 📋 Local Development (Without Docker)

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup

```bash
# Seed the database with demo data
python backend/app/seed.py

# Or use the script
./scripts/seed.sh
```

## 🎯 10-Minute Demo Script

Follow this script to explore HarvestIQ's key features:

### 1. **Login & Dashboard** (2 minutes)
1. Open http://localhost:5173
2. Click "Demo Farmer" or login with `farmer@demo.com` / `demo123`
3. Explore the dashboard showing:
   - Farm statistics and yield predictions
   - Trend chart with last 14 predictions
   - Recent predictions list

### 2. **Farm Management** (2 minutes)
1. Click "Add Farm" button
2. Create a new farm:
   - Name: "Demo Vineyard"
   - Location: "Napa Valley, CA"
   - Crop: "Other" 
   - Area: 5.2 hectares
3. View the farm in the dashboard

### 3. **Upload & Analysis** (3 minutes)
1. Navigate to "Upload & Analyze"
2. Select your newly created farm
3. Upload any image file (the system will mock analyze it)
4. View the AI analysis results:
   - Detected item count
   - Predicted yield in kg
   - Confidence score
   - Ripeness analysis breakdown

### 4. **Predictions History** (2 minutes)
1. Go to "Predictions History"
2. View all predictions in a sortable table
3. Filter by specific farms
4. Add a manual prediction:
   - Select farm
   - Enter detected count: 30
   - Enter predicted yield: 25.5 kg
   - Add notes: "Manual entry for testing"

### 5. **AI Chat Assistant** (1 minute)
1. Click the chat bubble in bottom-right corner
2. Ask questions like:
   - "What's the weather forecast?"
   - "How are my yields looking?"
   - "What are current market prices?"
3. See mock AI responses and persistent chat history

## 📚 API Documentation

### Authentication Endpoints

#### POST `/auth/register`
Register a new user.

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+1-555-0123",
  "role": "farmer"
}
```

#### POST `/auth/token`
Login and get JWT token.

```bash
curl -X POST "http://localhost:8000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=farmer@demo.com&password=demo123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Farm Management

#### GET `/farms/`
Get all farms for authenticated user.

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/farms/
```

#### POST `/farms/`
Create a new farm.

```json
{
  "name": "Sunny Acres",
  "location": "California, USA",
  "crop_type": "tomatoes",
  "area": 12.5
}
```

### Predictions

#### GET `/predictions/`
Get all predictions for user's farms.

#### POST `/predictions/upload-stub`
Upload image for AI analysis (mock implementation).

```bash
curl -X POST "http://localhost:8000/predictions/upload-stub?farm_id=1" \
  -H "Authorization: Bearer <token>" \
  -F "file=@crop_image.jpg"
```

Response:
```json
{
  "detected_count": 25,
  "predicted_kg": 18.7,
  "confidence": 0.87,
  "boxes": [...],
  "ripeness_analysis": {
    "ripe": 10,
    "nearly_ripe": 8,
    "unripe": 7,
    "average_ripeness": 0.72
  }
}
```

#### POST `/predictions/chat`
Chat with AI assistant (mock implementation).

```bash
curl -X POST "http://localhost:8000/predictions/chat?message=How are my crops?" \
  -H "Authorization: Bearer <token>"
```

## 🧪 Testing

### Run All Tests
```bash
make test
```

### Backend Tests Only
```bash
cd backend
python -m pytest test_main.py -v
```

### Frontend Tests Only
```bash
cd frontend
npm test
```

### Test Coverage
- **Backend**: Authentication, CRUD operations, API endpoints
- **Frontend**: Component rendering, user interactions, API mocking

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Security
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Database
DATABASE_URL=sqlite:///./harvestiq.db
# For PostgreSQL: postgresql://user:pass@localhost:5432/harvestiq

# Frontend
VITE_API_BASE_URL=http://localhost:8000

# File uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,bmp,tiff
```

### Database Migration

For production with PostgreSQL:

```bash
# Update DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/harvestiq

# Install PostgreSQL adapter
pip install psycopg2-binary

# Run migrations (tables will be created automatically)
python backend/app/seed.py
```

## 🤖 AI Integration Guide

### Replacing Upload Stub with Real ML

The current upload endpoint returns mock data. To integrate real computer vision:

#### 1. **YOLOv8 Integration**

```python
# backend/app/utils.py
import torch
from ultralytics import YOLO

def real_ai_prediction(image_path: str) -> dict:
    # Load YOLOv8 model
    model = YOLO('path/to/your/crop_model.pt')
    
    # Run inference
    results = model(image_path)
    
    # Process results
    boxes = []
    for r in results:
        for box in r.boxes:
            boxes.append({
                "x": int(box.xyxy[0][0]),
                "y": int(box.xyxy[0][1]), 
                "width": int(box.xyxy[0][2] - box.xyxy[0][0]),
                "height": int(box.xyxy[0][3] - box.xyxy[0][1]),
                "confidence": float(box.conf[0])
            })
    
    return {
        "detected_count": len(boxes),
        "predicted_kg": len(boxes) * 0.8,  # Your yield calculation
        "confidence": float(results[0].boxes.conf.mean()),
        "boxes": boxes,
        "ripeness_analysis": analyze_ripeness(results)  # Your function
    }
```

#### 2. **ONNX Model Integration**

```python
import onnxruntime as ort
import cv2
import numpy as np

def onnx_prediction(image_path: str) -> dict:
    # Load ONNX model
    session = ort.InferenceSession('path/to/model.onnx')
    
    # Preprocess image
    image = cv2.imread(image_path)
    image = cv2.resize(image, (640, 640))
    image = image.astype(np.float32) / 255.0
    image = np.transpose(image, (2, 0, 1))
    image = np.expand_dims(image, axis=0)
    
    # Run inference
    outputs = session.run(None, {'input': image})
    
    # Process outputs and return results
    return process_onnx_outputs(outputs)
```

### Replacing Chat Stub with Real LLM

#### 1. **OpenAI Integration**

```python
# backend/app/utils.py
import openai

def real_chat_response(message: str, user_context: dict) -> str:
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    # Build context from user's farm data
    context = f"""
    You are an AI farming assistant. User has {len(user_context['farms'])} farms:
    {', '.join([f"{f['name']} ({f['crop_type']})" for f in user_context['farms']])}
    
    Recent predictions show average yield of {user_context['avg_yield']} kg.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": context},
            {"role": "user", "content": message}
        ]
    )
    
    return response.choices[0].message.content
```

#### 2. **HuggingFace Integration**

```python
from transformers import pipeline

# Initialize the model
chatbot = pipeline("conversational", model="microsoft/DialoGPT-medium")

def huggingface_chat_response(message: str) -> str:
    response = chatbot(message)
    return response.generated_responses[-1]
```

### Frontend Integration

Update the chat client to use real endpoints:

```typescript
// frontend/src/services/chatClient.ts
async sendMessage(message: string): Promise<void> {
    // Remove mock logic and use real API
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            message,
            context: await this.getUserContext()  // Farm data, etc.
        })
    });
    
    const data = await response.json();
    // Handle real response...
}
```

## 🚀 Production Deployment

### Docker Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/harvestiq
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
  
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: harvestiq
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: harvestiq-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: harvestiq-backend
  template:
    metadata:
      labels:
        app: harvestiq-backend
    spec:
      containers:
      - name: backend
        image: harvestiq/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: harvestiq-secrets
              key: database-url
```

### Security Checklist

- [ ] Change default JWT secret key
- [ ] Use HTTPS in production
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Use a reverse proxy (nginx/traefik)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript/Python type hints
- Write tests for new features
- Update documentation
- Follow existing code style (ESLint/Prettier configured)
- Ensure Docker builds pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** for the excellent Python web framework
- **React** and **Vite** for modern frontend development
- **Tailwind CSS** for beautiful, responsive styling
- **SQLAlchemy** for robust database ORM
- **Docker** for containerization and deployment

## 📞 Support

- 📧 Email: support@harvestiq.com
- 💬 Discord: [HarvestIQ Community](https://discord.gg/harvestiq)
- 📖 Documentation: [docs.harvestiq.com](https://docs.harvestiq.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/harvestiq/issues)

---

**Built with ❤️ for farmers and agricultural innovation** 🌾