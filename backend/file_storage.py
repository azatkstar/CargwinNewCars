"""
File Storage and Upload Management for CargwinNewCar
Supports local storage with future extensibility for cloud storage (S3, CloudFlare R2)
"""
import os
import shutil
import logging
import mimetypes
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, BinaryIO
from pathlib import Path
import hashlib
import uuid
from PIL import Image, ImageOps
from fastapi import HTTPException, UploadFile
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Configuration
UPLOAD_DIR = Path("/app/uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}
ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 
    'image/webp', 'image/avif'
}

# Image size configurations
IMAGE_SIZES = {
    'thumbnail': (300, 200),    # For listings
    'medium': (800, 600),       # For gallery
    'large': (1200, 900),       # For detail view
    'hero': (1920, 1080),       # For hero sections
}

class ImageAsset(BaseModel):
    """Image asset model"""
    id: str
    original_filename: str
    filename: str
    url: str
    alt: str = ""
    width: int
    height: int
    size_bytes: int
    mime_type: str
    ratio: str = "16:9"
    is_hero: bool = False
    variants: Dict[str, str] = {}  # Different sizes
    created_at: datetime

class FileStorageManager:
    """Manages file uploads and storage"""
    
    def __init__(self, base_upload_dir: Path = UPLOAD_DIR):
        self.base_upload_dir = base_upload_dir
        self.ensure_directories()
    
    def ensure_directories(self):
        """Create upload directories if they don't exist"""
        directories = [
            self.base_upload_dir,
            self.base_upload_dir / "images",
            self.base_upload_dir / "images" / "original",
            self.base_upload_dir / "images" / "processed",
            self.base_upload_dir / "temp"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
        logger.info(f"Upload directories ensured at: {self.base_upload_dir}")
    
    def validate_file(self, file: UploadFile) -> bool:
        """Validate uploaded file"""
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Check MIME type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"MIME type {file.content_type} not allowed"
            )
        
        # Check file size (note: this might not be accurate for streaming uploads)
        if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        return True
    
    def generate_filename(self, original_filename: str) -> tuple[str, str]:
        """Generate unique filename and ID"""
        file_ext = Path(original_filename).suffix.lower()
        file_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file_id}{file_ext}"
        return file_id, filename
    
    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA-256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        return sha256_hash.hexdigest()
    
    def get_image_dimensions(self, file_path: Path) -> tuple[int, int]:
        """Get image dimensions"""
        try:
            with Image.open(file_path) as img:
                return img.size
        except Exception as e:
            logger.error(f"Failed to get image dimensions for {file_path}: {e}")
            return (0, 0)
    
    def calculate_aspect_ratio(self, width: int, height: int) -> str:
        """Calculate aspect ratio string"""
        if width == 0 or height == 0:
            return "unknown"
        
        # Common ratios
        ratio = width / height
        if abs(ratio - 16/9) < 0.1:
            return "16:9"
        elif abs(ratio - 4/3) < 0.1:
            return "4:3"
        elif abs(ratio - 1) < 0.1:
            return "1:1"
        elif abs(ratio - 3/2) < 0.1:
            return "3:2"
        else:
            return f"{width}:{height}"
    
    async def save_uploaded_file(self, file: UploadFile, temp: bool = False) -> Path:
        """Save uploaded file to disk"""
        # Validate file
        self.validate_file(file)
        
        # Generate filename
        file_id, filename = self.generate_filename(file.filename)
        
        # Choose directory
        if temp:
            file_path = self.base_upload_dir / "temp" / filename
        else:
            file_path = self.base_upload_dir / "images" / "original" / filename
        
        # Save file
        try:
            with open(file_path, "wb") as buffer:
                content = await file.read()
                
                # Check actual file size
                if len(content) > MAX_FILE_SIZE:
                    os.unlink(file_path)  # Delete partial file
                    raise HTTPException(
                        status_code=400,
                        detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                    )
                
                buffer.write(content)
            
            logger.info(f"File saved: {filename} ({len(content)} bytes)")
            return file_path
            
        except Exception as e:
            # Clean up on error
            if file_path.exists():
                os.unlink(file_path)
            logger.error(f"Failed to save file {filename}: {e}")
            raise HTTPException(status_code=500, detail="Failed to save file")
    
    def create_image_variants(self, original_path: Path, file_id: str) -> Dict[str, str]:
        """Create different sizes of the image"""
        variants = {}
        
        try:
            with Image.open(original_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Auto-orient based on EXIF data
                img = ImageOps.exif_transpose(img)
                
                # Create variants
                for size_name, (width, height) in IMAGE_SIZES.items():
                    # Calculate new size maintaining aspect ratio
                    img_ratio = img.width / img.height
                    target_ratio = width / height
                    
                    if img_ratio > target_ratio:
                        # Image is wider, fit to width
                        new_width = width
                        new_height = int(width / img_ratio)
                    else:
                        # Image is taller, fit to height
                        new_height = height
                        new_width = int(height * img_ratio)
                    
                    # Resize image
                    resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Create filename
                    variant_filename = f"{file_id}_{size_name}.jpg"
                    variant_path = self.base_upload_dir / "images" / "processed" / variant_filename
                    
                    # Save variant
                    resized_img.save(variant_path, "JPEG", quality=85, optimize=True)
                    
                    # Store variant info
                    variants[size_name] = f"/uploads/images/processed/{variant_filename}"
                    
                    logger.debug(f"Created {size_name} variant: {new_width}x{new_height}")
        
        except Exception as e:
            logger.error(f"Failed to create image variants for {original_path}: {e}")
            # Don't fail the whole upload if variants fail
        
        return variants
    
    async def process_image(self, file: UploadFile, alt_text: str = "") -> ImageAsset:
        """Process uploaded image and create ImageAsset"""
        # Save original file
        original_path = await self.save_uploaded_file(file)
        file_id = original_path.stem.split('_')[-1]  # Extract UUID from filename
        
        try:
            # Get file info
            file_size = original_path.stat().st_size
            width, height = self.get_image_dimensions(original_path)
            ratio = self.calculate_aspect_ratio(width, height)
            
            # Create image variants
            variants = self.create_image_variants(original_path, file_id)
            
            # Generate URLs
            original_url = f"/uploads/images/original/{original_path.name}"
            
            # Create ImageAsset
            image_asset = ImageAsset(
                id=file_id,
                original_filename=file.filename,
                filename=original_path.name,
                url=original_url,
                alt=alt_text,
                width=width,
                height=height,
                size_bytes=file_size,
                mime_type=file.content_type,
                ratio=ratio,
                is_hero=False,  # Set by caller
                variants=variants,
                created_at=datetime.now(timezone.utc)
            )
            
            logger.info(f"Image processed successfully: {file.filename} -> {file_id}")
            return image_asset
            
        except Exception as e:
            # Clean up on error
            if original_path.exists():
                os.unlink(original_path)
            logger.error(f"Failed to process image {file.filename}: {e}")
            raise HTTPException(status_code=500, detail="Failed to process image")
    
    def delete_image(self, image_asset: ImageAsset) -> bool:
        """Delete image and all its variants"""
        deleted = True
        
        try:
            # Delete original
            original_path = self.base_upload_dir / "images" / "original" / image_asset.filename
            if original_path.exists():
                os.unlink(original_path)
                logger.info(f"Deleted original: {image_asset.filename}")
            
            # Delete variants
            for size_name, variant_url in image_asset.variants.items():
                variant_filename = Path(variant_url).name
                variant_path = self.base_upload_dir / "images" / "processed" / variant_filename
                if variant_path.exists():
                    os.unlink(variant_path)
                    logger.debug(f"Deleted variant {size_name}: {variant_filename}")
            
        except Exception as e:
            logger.error(f"Failed to delete image {image_asset.id}: {e}")
            deleted = False
        
        return deleted
    
    def get_file_url(self, relative_path: str, base_url: str = "") -> str:
        """Get full URL for file"""
        if base_url:
            return f"{base_url.rstrip('/')}/{relative_path.lstrip('/')}"
        return relative_path
    
    def cleanup_temp_files(self, max_age_hours: int = 24):
        """Clean up temporary files older than max_age_hours"""
        temp_dir = self.base_upload_dir / "temp"
        if not temp_dir.exists():
            return
        
        current_time = datetime.now(timezone.utc).timestamp()
        deleted_count = 0
        
        for file_path in temp_dir.iterdir():
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > (max_age_hours * 3600):
                    try:
                        os.unlink(file_path)
                        deleted_count += 1
                    except Exception as e:
                        logger.error(f"Failed to delete temp file {file_path}: {e}")
        
        if deleted_count > 0:
            logger.info(f"Cleaned up {deleted_count} temporary files")

# Global instance
file_storage_manager = FileStorageManager()

def get_file_storage_manager() -> FileStorageManager:
    """Get file storage manager instance"""
    return file_storage_manager