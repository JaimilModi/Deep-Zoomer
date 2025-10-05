from sqlalchemy import Column, String, DateTime, Float, JSON, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .database import Base
import uuid

class Annotation(Base):
    __tablename__ = "annotations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    image_id = Column(String, nullable=False, index=True)
    tile_coordinates = Column(JSON, nullable=False)  # {"z": 10, "x": 100, "y": 50}
    annotation_type = Column(String, nullable=False)  # "crater", "lava_flow", "dust_storm", etc.
    geometry = Column(JSON, nullable=False)  # {"type": "Polygon", "coordinates": [...]}
    properties = Column(JSON, nullable=True)  # Additional properties
    confidence = Column(Float, nullable=True)  # ML confidence score
    user_id = Column(String, nullable=True)  # User who created the annotation
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TileMetadata(Base):
    __tablename__ = "tile_metadata"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    image_id = Column(String, nullable=False, index=True)
    z = Column(Integer, nullable=False)
    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)
    enhanced = Column(String, nullable=False)  # "true" or "false"
    model_version = Column(String, nullable=True)
    processing_time = Column(Float, nullable=True)  # Processing time in seconds
    confidence_scores = Column(JSON, nullable=True)  # {"sr": 0.95, "denoise": 0.88, "segmentation": 0.92}
    features_detected = Column(JSON, nullable=True)  # List of detected features
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ImageMetadata(Base):
    __tablename__ = "image_metadata"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    image_id = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    nasa_id = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    iiif_url = Column(String, nullable=True)
    dimensions = Column(JSON, nullable=True)  # {"width": 10000, "height": 8000}
    zoom_levels = Column(JSON, nullable=True)  # Available zoom levels
    enhanced_available = Column(String, nullable=False, default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class UserFeedback(Base):
    __tablename__ = "user_feedback"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    image_id = Column(String, nullable=False, index=True)
    tile_coordinates = Column(JSON, nullable=False)
    feedback_type = Column(String, nullable=False)  # "correction", "improvement", "bug_report"
    content = Column(Text, nullable=False)
    user_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
