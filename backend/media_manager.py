"""
Media Manager

Internal media management system for Hunter.Lease
Handles image uploads, storage, and metadata tracking
"""
import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from uuid import uuid4
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# Storage paths
MEDIA_DIR = Path("/app/media")
MEDIA_DB = Path("/app/backend/media_db.json")

# Allowed extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'}


def ensure_media_dir():
    """Ensure media directory exists"""
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    
    if not MEDIA_DB.exists():
        MEDIA_DB.write_text(json.dumps([]))
        logger.info("Created media_db.json")


def load_media_db() -> List[Dict[str, Any]]:
    """Load media metadata from JSON"""
    try:
        ensure_media_dir()
        with open(MEDIA_DB, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load media DB: {e}")
        return []


def save_media_db(media_list: List[Dict[str, Any]]):
    """Save media metadata to JSON"""
    try:
        ensure_media_dir()
        with open(MEDIA_DB, 'w') as f:
            json.dump(media_list, f, indent=2, default=str)
    except Exception as e:
        logger.error(f"Failed to save media DB: {e}")


def upload_media(
    file_content: bytes,
    filename: str,
    uploaded_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Upload media file
    
    Args:
        file_content: File bytes
        filename: Original filename
        uploaded_by: User email
        
    Returns:
        Media metadata dict
        
    Raises:
        ValueError: If file type not allowed or too large
    """
    ensure_media_dir()
    
    # Validate extension
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File type {ext} not allowed. Allowed: {ALLOWED_EXTENSIONS}")
    
    # Validate size (max 10MB)
    if len(file_content) > 10 * 1024 * 1024:
        raise ValueError("File size exceeds 10MB limit")
    
    # Generate unique filename
    media_id = str(uuid4())
    safe_filename = f"{media_id}{ext}"
    file_path = MEDIA_DIR / safe_filename
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(file_content)
    
    # Create metadata
    media_entry = {
        "id": media_id,
        "filename": filename,
        "stored_filename": safe_filename,
        "url": f"/media/{safe_filename}",
        "size": len(file_content),
        "extension": ext,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": uploaded_by
    }
    
    # Add to DB
    media_list = load_media_db()
    media_list.append(media_entry)
    save_media_db(media_list)
    
    logger.info(f"Media uploaded: {media_id} ({filename}) by {uploaded_by}")
    
    return media_entry


def list_media(limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get list of uploaded media
    
    Args:
        limit: Maximum number of items
        
    Returns:
        List of media metadata
    """
    media_list = load_media_db()
    
    # Sort by upload date (newest first)
    media_list.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
    
    return media_list[:limit]


def get_media(media_id: str) -> Optional[Dict[str, Any]]:
    """
    Get single media by ID
    
    Args:
        media_id: Media ID
        
    Returns:
        Media metadata or None
    """
    media_list = load_media_db()
    
    for media in media_list:
        if media.get("id") == media_id:
            return media
    
    return None


def delete_media(media_id: str) -> bool:
    """
    Delete media file and metadata
    
    Args:
        media_id: Media ID
        
    Returns:
        True if deleted, False if not found
    """
    media_list = load_media_db()
    
    # Find and remove
    media_entry = None
    for i, media in enumerate(media_list):
        if media.get("id") == media_id:
            media_entry = media
            media_list.pop(i)
            break
    
    if not media_entry:
        return False
    
    # Delete file
    try:
        file_path = MEDIA_DIR / media_entry.get("stored_filename", "")
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        logger.error(f"Failed to delete file: {e}")
    
    # Save updated DB
    save_media_db(media_list)
    
    logger.info(f"Media deleted: {media_id}")
    
    return True


def get_media_stats() -> Dict[str, Any]:
    """
    Get media storage statistics
    
    Returns:
        Stats dict
    """
    media_list = load_media_db()
    
    total_size = sum(m.get("size", 0) for m in media_list)
    
    # Count by type
    by_type = {}
    for media in media_list:
        ext = media.get("extension", "unknown")
        by_type[ext] = by_type.get(ext, 0) + 1
    
    return {
        "total_files": len(media_list),
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "by_type": by_type
    }
