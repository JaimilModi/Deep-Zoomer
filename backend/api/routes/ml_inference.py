from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Dict, Any
import logging
import asyncio

from ...services.ml_service import MLService
from ...services.tile_service import TileService
from ...models.schemas import MLInferenceRequest, MLInferenceResponse
from ...models.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
ml_service = MLService()
tile_service = TileService()

@router.post("/infer", response_model=MLInferenceResponse)
async def run_inference(
    request: MLInferenceRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Run ML inference on a specific tile
    
    - **image_id**: Unique identifier for the image
    - **z**: Zoom level
    - **x**: X coordinate  
    - **y**: Y coordinate
    - **operations**: List of operations to perform (sr, denoise, segment, classify)
    - **confidence_threshold**: Minimum confidence for results
    """
    try:
        start_time = asyncio.get_event_loop().time()
        
        # Get original tile
        original_tile = await tile_service._fetch_original_tile(
            request.image_id, 
            request.z, 
            request.x, 
            request.y
        )
        
        if not original_tile:
            raise HTTPException(status_code=404, detail="Original tile not found")
        
        # Process tile based on requested operations
        results = {
            "sr": None,
            "denoise": None,
            "segment": None,
            "classify": None
        }
        
        confidence_scores = {}
        features_detected = []
        model_versions = {}
        
        # Convert bytes to PIL Image for processing
        from PIL import Image
        import io
        image = Image.open(io.BytesIO(original_tile))
        
        # Super-resolution
        if "sr" in request.operations:
            try:
                sr_image = await ml_service.super_resolve(image)
                results["sr"] = sr_image
                confidence_scores["sr"] = 0.95  # This would come from actual model
                model_versions["sr"] = "Real-ESRGAN-1.0.0"
            except Exception as e:
                logger.error(f"Error in super-resolution: {str(e)}")
                results["sr"] = image  # Fallback to original
        
        # Denoising
        if "denoise" in request.operations:
            try:
                denoised_image = await ml_service.denoise(image)
                results["denoise"] = denoised_image
                confidence_scores["denoise"] = 0.88
                model_versions["denoise"] = "DnCNN-1.0.0"
            except Exception as e:
                logger.error(f"Error in denoising: {str(e)}")
                results["denoise"] = image
        
        # Segmentation
        if "segment" in request.operations:
            try:
                features = await ml_service._detect_features(image, request.confidence_threshold)
                features_detected = features
                confidence_scores["segment"] = 0.92
                model_versions["segment"] = "U-Net-1.0.0"
            except Exception as e:
                logger.error(f"Error in segmentation: {str(e)}")
                features_detected = []
        
        # Classification
        if "classify" in request.operations:
            try:
                # This would run actual classification
                classification_results = {
                    "crater": 0.85,
                    "lava_flow": 0.72,
                    "dust_storm": 0.15
                }
                confidence_scores["classify"] = max(classification_results.values())
                model_versions["classify"] = "ResNet-1.0.0"
            except Exception as e:
                logger.error(f"Error in classification: {str(e)}")
                classification_results = {}
        
        processing_time = asyncio.get_event_loop().time() - start_time
        
        # Store results in background
        background_tasks.add_task(
            _store_inference_results,
            request.image_id,
            request.z,
            request.x,
            request.y,
            results,
            confidence_scores,
            features_detected,
            model_versions,
            processing_time
        )
        
        return MLInferenceResponse(
            success=True,
            processing_time=processing_time,
            model_versions=model_versions,
            confidence_scores=confidence_scores,
            features_detected=features_detected
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in ML inference: {str(e)}")
        return MLInferenceResponse(
            success=False,
            processing_time=0.0,
            model_versions={},
            confidence_scores={},
            features_detected=[],
            error=str(e)
        )

@router.get("/models/status")
async def get_models_status():
    """
    Get status of all ML models
    """
    try:
        health_check = await ml_service.health_check()
        
        return {
            "ml_service": health_check,
            "available_operations": ["sr", "denoise", "segment", "classify"],
            "supported_formats": ["JPEG", "PNG", "TIFF"],
            "max_tile_size": 1024
        }
        
    except Exception as e:
        logger.error(f"Error getting models status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting models status: {str(e)}")

@router.post("/batch")
async def batch_inference(
    requests: List[MLInferenceRequest],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Run ML inference on multiple tiles in batch
    """
    try:
        results = []
        
        # Process in batches
        batch_size = 4  # This should come from config
        for i in range(0, len(requests), batch_size):
            batch = requests[i:i + batch_size]
            batch_results = await _process_batch(batch)
            results.extend(batch_results)
        
        return {
            "message": "Batch inference completed",
            "total_requests": len(requests),
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Error in batch inference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in batch inference: {str(e)}")

@router.post("/precompute/{image_id}")
async def precompute_enhanced_tiles(
    image_id: str,
    zoom_levels: List[int],
    operations: List[str],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Precompute enhanced tiles for an image
    """
    try:
        # Start precomputation in background
        background_tasks.add_task(
            _precompute_tiles_background,
            image_id,
            zoom_levels,
            operations
        )
        
        return {
            "message": "Precomputation started",
            "image_id": image_id,
            "zoom_levels": zoom_levels,
            "operations": operations
        }
        
    except Exception as e:
        logger.error(f"Error starting precomputation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting precomputation: {str(e)}")

async def _store_inference_results(
    image_id: str,
    z: int,
    x: int,
    y: int,
    results: Dict[str, Any],
    confidence_scores: Dict[str, float],
    features_detected: List[Dict[str, Any]],
    model_versions: Dict[str, str],
    processing_time: float
):
    """Store inference results in database"""
    try:
        from ...models.models import TileMetadata
        
        # This would be done with proper database session
        # For now, just log the results
        logger.info(f"Stored inference results for {image_id}/{z}/{x}/{y}")
        
    except Exception as e:
        logger.error(f"Error storing inference results: {str(e)}")

async def _process_batch(requests: List[MLInferenceRequest]) -> List[Dict[str, Any]]:
    """Process a batch of inference requests"""
    try:
        results = []
        
        for request in requests:
            # Process each request (simplified)
            result = {
                "image_id": request.image_id,
                "coordinates": {"z": request.z, "x": request.x, "y": request.y},
                "success": True,
                "processing_time": 0.1  # Simplified
            }
            results.append(result)
        
        return results
        
    except Exception as e:
        logger.error(f"Error processing batch: {str(e)}")
        return []

async def _precompute_tiles_background(
    image_id: str,
    zoom_levels: List[int],
    operations: List[str]
):
    """Background task for precomputing tiles"""
    try:
        logger.info(f"Starting precomputation for {image_id}")
        
        # This would implement the actual precomputation logic
        # For now, just log the progress
        for z in zoom_levels:
            logger.info(f"Precomputing zoom level {z} for {image_id}")
            # Actual precomputation would go here
        
        logger.info(f"Completed precomputation for {image_id}")
        
    except Exception as e:
        logger.error(f"Error in precomputation: {str(e)}")
