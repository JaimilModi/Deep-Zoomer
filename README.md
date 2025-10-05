# NASA Deep Zoom AI Platform

A comprehensive AI-powered deep zoom platform for exploring NASA imagery with machine learning enhancement, feature detection, and interactive annotation capabilities.

## 🚀 Features

### Core Functionality
- **Infinite Deep Zoom**: Smooth tiled viewing using OpenSeadragon with IIIF/DZI support
- **AI Enhancement**: Real-time super-resolution, denoising, and image enhancement
- **Feature Detection**: Automatic identification of craters, lava flows, dust storms, and other planetary features
- **Interactive Annotations**: User-friendly annotation system with drawing tools and labeling
- **Comparison Mode**: Side-by-side original vs enhanced image comparison
- **Metadata Tracking**: Comprehensive provenance and confidence scoring

### AI/ML Capabilities
- **Super-Resolution**: Real-ESRGAN for 4x image enhancement
- **Denoising**: Advanced noise reduction for space imagery
- **Segmentation**: U-Net-based feature detection and classification
- **Object Detection**: Mask R-CNN for precise feature localization
- **Change Detection**: Time-series analysis for anomaly detection

### Technical Features
- **High Performance**: Redis caching and GPU acceleration
- **Scalable Architecture**: Microservices with FastAPI backend
- **Real-time Processing**: WebSocket support for live updates
- **Scientific Integrity**: Full provenance tracking and confidence metrics
- **Export Capabilities**: Multiple format support (JSON, COCO, etc.)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   ML Services   │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (PyTorch)     │
│                 │    │                 │    │                 │
│ • OpenSeadragon │    │ • Tile Service  │    │ • Real-ESRGAN   │
│ • AI Controls   │    │ • ML Inference  │    │ • DnCNN         │
│ • Annotations   │    │ • Cache (Redis) │    │ • U-Net         │
│ • Comparison    │    │ • Database      │    │ • ResNet        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **OpenSeadragon** for deep zoom functionality
- **Tailwind CSS** for styling
- **Radix UI** for components
- **React Query** for state management

### Backend
- **FastAPI** for high-performance API
- **PostgreSQL** for metadata storage
- **Redis** for caching
- **SQLAlchemy** for ORM
- **Alembic** for migrations

### ML/AI
- **PyTorch** for model training and inference
- **Real-ESRGAN** for super-resolution
- **OpenCV** for image processing
- **Transformers** for advanced models
- **ONNX/TensorRT** for optimization

### Infrastructure
- **Docker** for containerization
- **NVIDIA GPU** support
- **S3/Cloud Storage** for tile storage
- **WebSocket** for real-time updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Redis 6+
- NVIDIA GPU (recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/nasa-deep-zoom-ai.git
cd nasa-deep-zoom-ai
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Set up Environment Variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp .env.example .env.local
# Edit .env.local with your configuration
```

5. **Initialize Database**
```bash
cd backend
alembic upgrade head
```

6. **Start Development Servers**
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
npm run dev
```

7. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📖 Usage

### Basic Navigation
1. **Home**: Overview and featured images
2. **Gallery**: Browse local high-resolution images
3. **NASA Search**: Search NASA's image database
4. **AI Search**: AI-enhanced search with ML capabilities

### AI Enhancement
1. **Enable AI Enhancement**: Toggle in viewer controls
2. **Adjust Confidence**: Set threshold for feature detection
3. **Compare Views**: Use comparison slider for before/after
4. **View Metadata**: Check processing details and model versions

### Annotation System
1. **Select Drawing Tool**: Point, circle, rectangle, or polygon
2. **Draw Annotations**: Click and drag to create shapes
3. **Add Labels**: Provide descriptions and categories
4. **Export Data**: Download annotations in various formats

### Advanced Features
1. **Batch Processing**: Precompute tiles for popular images
2. **Custom Models**: Upload and use custom ML models
3. **Collaboration**: Share annotations and findings
4. **API Integration**: Use REST API for custom applications

## 🔧 Configuration

### Backend Configuration
```python
# backend/.env
DATABASE_URL=postgresql://user:password@localhost/nasa_deep_zoom
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=your_bucket
NASA_API_KEY=your_nasa_key
GPU_ENABLED=true
MODELS_DIR=models
```

### Frontend Configuration
```javascript
// .env.local
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_NASA_API_KEY=your_nasa_key
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Production Deployment
```bash
# Backend
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
npm run build
# Serve static files with nginx or similar
```

### Cloud Deployment
- **AWS**: Use ECS/EKS with GPU instances
- **Google Cloud**: Use GKE with GPU nodes
- **Azure**: Use AKS with GPU-enabled nodes

## 📊 Performance Optimization

### Caching Strategy
- **Redis**: Tile caching with TTL
- **CDN**: Static asset delivery
- **Browser**: Local storage for metadata

### GPU Optimization
- **TensorRT**: Optimized inference
- **Batch Processing**: Multiple tiles simultaneously
- **Model Quantization**: Reduced precision for speed

### Database Optimization
- **Indexing**: Optimized queries
- **Connection Pooling**: Efficient connections
- **Read Replicas**: Distributed reads

## 🔬 Scientific Features

### Provenance Tracking
- **Model Versions**: Track ML model versions
- **Confidence Scores**: Per-operation confidence
- **Processing Time**: Performance metrics
- **Source Attribution**: Original data sources

### Quality Assurance
- **Validation**: Input/output validation
- **Error Handling**: Graceful degradation
- **Monitoring**: Real-time performance tracking
- **Logging**: Comprehensive audit trail

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Maintain backward compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for providing the image datasets
- **OpenSeadragon** for the deep zoom functionality
- **Real-ESRGAN** for super-resolution capabilities
- **FastAPI** for the high-performance backend
- **React** community for the frontend framework

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/nasa-deep-zoom-ai/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/nasa-deep-zoom-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/nasa-deep-zoom-ai/discussions)
- **Email**: support@nasa-deep-zoom-ai.com

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic deep zoom functionality
- ✅ AI enhancement pipeline
- ✅ Annotation system
- ✅ NASA API integration

### Phase 2 (Next)
- 🔄 Advanced ML models
- 🔄 Real-time collaboration
- 🔄 Mobile optimization
- 🔄 API rate limiting

### Phase 3 (Future)
- 📋 3D visualization
- 📋 VR/AR support
- 📋 Advanced analytics
- 📋 Multi-language support

---

**Built with ❤️ for the scientific community**