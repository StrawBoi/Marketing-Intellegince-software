# 🚀 Marketing Intelligence Pro - Deployment Guide

## 📋 **Quick Setup Guide**

### **Prerequisites**
- Node.js 18+ and yarn
- Python 3.9+ and pip
- MongoDB 5.0+
- Git

### **Environment Variables**

Create `.env` files in both backend and frontend directories:

#### **Backend `.env`**
```bash
# Database Configuration
MONGO_URL=mongodb://localhost:27017/marketing_intelligence
DB_NAME=marketing_intelligence

# AI Integration
EMERGENT_LLM_KEY=your_emergent_key_here

# API Configuration
USE_REAL_APIS=False  # Set to True for production
NEWS_API_KEY=your_news_api_key  # Optional

# Server Configuration
PORT=8001
HOST=0.0.0.0
```

#### **Frontend `.env`**
```bash
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Optional: Analytics
REACT_APP_GA_TRACKING_ID=your_ga_id
```

### **Quick Start Commands**

```bash
# Clone repository
git clone <your-repo-url>
cd marketing-intelligence-pro

# Backend setup
cd backend
pip install -r requirements.txt
python server.py

# Frontend setup (new terminal)
cd frontend
yarn install
yarn start
```

## 🐳 **Docker Deployment**

### **Docker Compose Setup**

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    container_name: marketing-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: marketing_intelligence

  backend:
    build: ./backend
    container_name: marketing-backend
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
    environment:
      - MONGO_URL=mongodb://mongodb:27017/marketing_intelligence
      - DB_NAME=marketing_intelligence
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    container_name: marketing-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001

volumes:
  mongodb_data:
```

### **Docker Commands**
```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

## ☁️ **Cloud Deployment Options**

### **AWS Deployment**

#### **Using AWS ECS with Fargate**
```bash
# Build and push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Backend
docker build -t marketing-backend ./backend
docker tag marketing-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/marketing-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/marketing-backend:latest

# Frontend
docker build -t marketing-frontend ./frontend
docker tag marketing-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/marketing-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/marketing-frontend:latest
```

#### **Environment Variables for AWS**
```bash
# Use AWS Secrets Manager or Parameter Store
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/marketing_intelligence
EMERGENT_LLM_KEY=from_aws_secrets
```

### **Vercel Deployment (Frontend)**

#### **vercel.json**
```json
{
  "name": "marketing-intelligence-pro",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_BACKEND_URL": "@backend-url"
  }
}
```

### **Railway Deployment (Backend)**

#### **railway.json**
```json
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🔧 **Production Configuration**

### **Backend Production Settings**

#### **Dockerfile**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]
```

#### **Performance Optimizations**
```python
# server.py additions for production
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Frontend Production Settings**

#### **Dockerfile**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html index.htm;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 📊 **Monitoring & Analytics**

### **Health Checks**

#### **Backend Health Endpoint**
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

### **Logging Configuration**

#### **Python Logging**
```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=[
        RotatingFileHandler('app.log', maxBytes=10485760, backupCount=5),
        logging.StreamHandler()
    ]
)
```

### **Analytics Integration**

#### **Google Analytics 4**
```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🔒 **Security Considerations**

### **Environment Security**
- Use environment variables for all secrets
- Implement API rate limiting
- Enable CORS only for trusted domains
- Use HTTPS in production
- Implement input validation and sanitization

### **Database Security**
```javascript
// MongoDB connection with authentication
const mongoUrl = `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority`;
```

### **API Security**
```python
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

# Rate limiting
@app.get("/api/generate")
@limiter(RateLimiter(times=10, seconds=60))
async def generate_intelligence():
    pass
```

## 📈 **Performance Optimization**

### **Database Indexing**
```javascript
// MongoDB indexes for better performance
db.campaign_history.createIndex({ "created_at": -1 })
db.campaign_history.createIndex({ "geographic_location": 1 })
db.campaign_metrics.createIndex({ "campaign_id": 1, "date_recorded": -1 })
```

### **Caching Strategy**
```python
from functools import lru_cache
import redis

# Redis caching
redis_client = redis.Redis(host='localhost', port=6379, db=0)

@lru_cache(maxsize=100)
def get_cached_analysis(campaign_id: str):
    cached = redis_client.get(f"analysis:{campaign_id}")
    if cached:
        return json.loads(cached)
    return None
```

## 🚀 **CI/CD Pipeline**

### **GitHub Actions Workflow**

#### **.github/workflows/deploy.yml**
```yaml
name: Deploy Marketing Intelligence Pro

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          
      - name: Install dependencies
        run: |
          cd frontend && yarn install
          cd ../backend && pip install -r requirements.txt
          
      - name: Run tests
        run: |
          cd frontend && yarn test
          cd ../backend && python -m pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

## 📚 **Additional Resources**

### **Monitoring Tools**
- **Sentry**: Error tracking and performance monitoring
- **New Relic**: Application performance monitoring  
- **DataDog**: Infrastructure and application monitoring
- **LogRocket**: Frontend session replay and monitoring

### **Documentation Tools**
- **Swagger/OpenAPI**: Automatic API documentation
- **Storybook**: Component documentation and testing
- **Notion**: Team documentation and knowledge base

### **Backup & Recovery**
```bash
# MongoDB backup
mongodump --host localhost --port 27017 --db marketing_intelligence --out backup/

# MongoDB restore
mongorestore --host localhost --port 27017 --db marketing_intelligence backup/marketing_intelligence/
```

---

*This deployment guide covers the essential steps for getting Marketing Intelligence Pro running in various environments. For specific deployment questions, consult the platform documentation or contact the development team.*