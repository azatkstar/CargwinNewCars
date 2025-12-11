"""
Image Processing System for Offers
Generates: preview (640x400), full-size (1440px), blurred background
"""
import os
from pathlib import Path
from PIL import Image, ImageFilter
import urllib.request
import hashlib
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

# Output directories
IMAGES_DIR = Path("/app/frontend/public/images/deals")


def ensure_dir(path):
    """Ensure directory exists"""
    Path(path).mkdir(parents=True, exist_ok=True)


def download_image(url):
    """Download image from URL"""
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            return BytesIO(response.read())
    except Exception as e:
        logger.error(f"Failed to download {url}: {e}")
        return None


def process_offer_images(offer_id, image_urls):
    """
    Process multiple images for an offer
    
    Returns:
        List of processed image URLs
    """
    ensure_dir(IMAGES_DIR / offer_id)
    
    processed = []
    
    for index, url in enumerate(image_urls):
        try:
            # Download
            img_bytes = download_image(url)
            if not img_bytes:
                continue
            
            # Open image
            img = Image.open(img_bytes)
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Generate preview (640x400, center crop, 16:10 ratio)
            preview = generate_preview(img, index, offer_id)
            
            # Generate full-size (1440px width)
            fullsize = generate_fullsize(img, index, offer_id)
            
            # Generate blurred background
            blurred = generate_blurred_bg(img, index, offer_id)
            
            processed.append({
                'index': index,
                'original': url,
                'preview': f'/images/deals/{offer_id}/{index}.webp',
                'fullsize': f'/images/deals/{offer_id}/{index}-full.webp',
                'blurred': f'/images/deals/{offer_id}/{index}-blur.webp'
            })
            
            logger.info(f"Processed image {index} for offer {offer_id}")
            
        except Exception as e:
            logger.error(f"Failed to process image {index}: {e}")
            continue
    
    return processed


def generate_preview(img, index, offer_id):
    """
    Generate preview: 640x400, center crop, WebP 85%
    """
    target_width = 640
    target_height = 400
    
    # Calculate crop to maintain 16:10 ratio
    img_ratio = img.width / img.height
    target_ratio = target_width / target_height
    
    if img_ratio > target_ratio:
        # Image wider - crop width
        new_width = int(img.height * target_ratio)
        left = (img.width - new_width) // 2
        cropped = img.crop((left, 0, left + new_width, img.height))
    else:
        # Image taller - crop height
        new_height = int(img.width / target_ratio)
        top = (img.height - new_height) // 2
        cropped = img.crop((0, top, img.width, top + new_height))
    
    # Resize
    preview = cropped.resize((target_width, target_height), Image.LANCZOS)
    
    # Save as WebP
    output_path = IMAGES_DIR / offer_id / f"{index}.webp"
    preview.save(output_path, 'WEBP', quality=85, method=6)
    
    return str(output_path)


def generate_fullsize(img, index, offer_id):
    """
    Generate full-size: 1440px width, WebP 90%
    """
    target_width = 1440
    
    # Calculate proportional height
    ratio = target_width / img.width
    target_height = int(img.height * ratio)
    
    # Resize
    fullsize = img.resize((target_width, target_height), Image.LANCZOS)
    
    # Save as WebP
    output_path = IMAGES_DIR / offer_id / f"{index}-full.webp"
    fullsize.save(output_path, 'WEBP', quality=90, method=6)
    
    return str(output_path)


def generate_blurred_bg(img, index, offer_id):
    """
    Generate blurred background: 20px Gaussian blur
    """
    # Extreme downscale for blur effect
    small = img.resize((20, 20), Image.LANCZOS)
    
    # Apply Gaussian blur
    blurred = small.filter(ImageFilter.GaussianBlur(radius=10))
    
    # Upscale back to preview size
    blurred_bg = blurred.resize((640, 400), Image.LANCZOS)
    
    # Lighten (overspread effect)
    from PIL import ImageEnhance
    enhancer = ImageEnhance.Brightness(blurred_bg)
    blurred_bg = enhancer.enhance(1.2)
    
    # Save as WebP
    output_path = IMAGES_DIR / offer_id / f"{index}-blur.webp"
    blurred_bg.save(output_path, 'WEBP', quality=60, method=6)
    
    return str(output_path)


def validate_image_url(url):
    """
    Validate image URL format and accessibility
    """
    if not url:
        return False, "Image URL is required"
    
    # Check format
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    if not any(url.lower().endswith(ext) for ext in valid_extensions):
        return False, "Invalid image format. Use JPG, PNG, or WebP"
    
    # Try to download (with timeout)
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            if response.status != 200:
                return False, "Image URL not accessible"
    except:
        return False, "Failed to load image from URL"
    
    return True, ""
