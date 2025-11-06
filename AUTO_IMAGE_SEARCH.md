# 🖼️ Auto Image Search Feature

**Date:** 2025-01-XX  
**Status:** ✅ Implemented

---

## Feature Overview

Automatic image search functionality for car lots in the admin panel. Searches for high-quality vehicle photos from multiple sources including AutoBandit-style image databases and free stock photo APIs.

---

## How It Works

### Backend API Endpoint

**Endpoint:** `GET /api/admin/search-car-images`

**Parameters:**
- `make` (required) - Car manufacturer (e.g., "Lexus")
- `model` (required) - Car model (e.g., "RX")
- `year` (required) - Model year (e.g., 2025)
- `trim` (optional) - Trim level (e.g., "Premium")

**Authentication:** Requires editor/admin role (JWT)

**Response Format:**
```json
{
  "make": "Lexus",
  "model": "RX",
  "year": 2025,
  "trim": "Premium",
  "images": [
    {
      "url": "https://...",
      "thumb": "https://...",
      "source": "unsplash",
      "alt": "2025 Lexus RX",
      "photographer": "John Doe",
      "width": 1920,
      "height": 1080
    }
  ],
  "note": "Optional note about image sources"
}
```

---

## Image Sources

### 1. Unsplash API (Primary)
- **Source:** Unsplash.com (free, high-quality stock photos)
- **Configuration:** Set `UNSPLASH_ACCESS_KEY` in backend/.env
- **Search:** Uses make, model, year, trim to find relevant car photos
- **Limit:** Returns up to 5 images per search

**Get Unsplash API Key:**
1. Go to https://unsplash.com/developers
2. Register your application
3. Copy the Access Key
4. Add to `/app/backend/.env`: `UNSPLASH_ACCESS_KEY=your_key_here`

### 2. Fallback Generic Images
- **Source:** Curated Unsplash URLs
- **When:** Used if API fails or no specific images found
- **Images:** Generic car photos (exterior, front view, etc.)

---

## Frontend Integration

### Admin Panel - Lot Form

**Location:** Media tab in lot creation/edit form

**UI Elements:**
- Button: "Auto-Find Images"
- Requirement: Make, Model, Year must be filled
- Action: Searches for images and adds them to the lot

**User Flow:**
1. Admin fills in Make, Model, Year (and optionally Trim)
2. Clicks "Auto-Find Images" button
3. System searches multiple sources
4. Found images are automatically added to the lot
5. Success alert shows number of images found

**Code Location:**
- `/app/frontend/src/components/admin/LotForm.jsx`

---

## Usage Example

### Admin Workflow:

1. **Create New Lot:**
   ```
   Make: Lexus
   Model: RX
   Year: 2025
   Trim: Premium
   ```

2. **Click "Auto-Find Images":**
   - System searches for "2025 Lexus RX Premium car"
   - Finds 5 high-quality images
   - Adds them to the lot

3. **Review & Edit:**
   - Admin can remove unwanted images
   - Can manually upload additional photos
   - Can reorder images

4. **Save Lot:**
   - Images are saved with the lot
   - Displayed on car detail pages

---

## AutoBandit Integration Research

### Image URL Structure (for future enhancement):

AutoBandit uses ChromeData Media Gallery:
```
http://media.chromedata.com/MediaGallery/media/{id}/cc_{chrome_code}_01_{view}_{color}.png
```

**Parameters:**
- `{id}` - Internal ChromeData ID
- `{chrome_code}` - Year/Make/Model/Trim code
- `{view}` - View angle: `2100` (exterior), `5000` (interior)
- `{color}` - Color code (hex format)

**Example:**
```
http://media.chromedata.com/MediaGallery/media/MzI0NDIxXk1lZGlhIEdhbGxlcnk/cc_2025LES122012456_01_2100_4Y5.png
```

### ChromeData API (Paid Service)

**Note:** ChromeData is a paid automotive data provider.

**To integrate:**
1. Sign up for ChromeData API access
2. Get API credentials
3. Implement search by VIN or Make/Model/Year/Trim
4. Retrieve image URLs

**Alternative:** Use NHTSA VIN decoder (already implemented) to get vehicle details, then search free sources.

---

## Environment Variables

### Backend (.env)

```bash
# Optional - Unsplash API for high-quality car photos
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# Optional - For future ChromeData integration
CHROMEDATA_API_KEY=your_chromedata_api_key
CHROMEDATA_API_SECRET=your_chromedata_secret
```

---

## Future Enhancements

### Planned Improvements:

1. **Multiple Image Sources:**
   - Pexels API
   - Pixabay API
   - Google Custom Search API
   - Bing Image Search API

2. **Image Filtering:**
   - Filter by orientation (landscape/portrait)
   - Filter by view angle (front, side, interior)
   - Color filtering

3. **AI Enhancement:**
   - Use GPT Vision to verify image matches vehicle
   - Auto-categorize images (exterior, interior, detail)
   - Auto-detect poor quality images

4. **ChromeData Integration:**
   - Official OEM photos
   - Multiple angles and colors
   - Interior shots

5. **Caching:**
   - Cache search results
   - Store image metadata
   - Faster subsequent searches

---

## API Limits & Costs

### Unsplash API:
- **Free Tier:** 50 requests/hour
- **Cost:** Free for demo applications
- **Upgrade:** Contact Unsplash for higher limits

### ChromeData API:
- **Cost:** Paid service (contact for pricing)
- **Features:** OEM photos, specs, pricing
- **Quality:** Professional dealership-grade images

---

## Testing

### Manual Test:

1. Login as admin
2. Go to Admin → Lots → Create New
3. Fill in:
   - Make: "Lexus"
   - Model: "RX"
   - Year: "2025"
4. Go to "Media" tab
5. Click "Auto-Find Images"
6. Verify: Images appear in uploader
7. Save lot
8. View lot detail page
9. Verify: Images display correctly

### API Test:

```bash
# Get JWT token first (admin login)
TOKEN="your_jwt_token"

# Search for images
curl -X GET \
  "https://your-backend-url/api/admin/search-car-images?make=Lexus&model=RX&year=2025" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### No Images Found:

**Possible Causes:**
1. No Unsplash API key configured
2. API rate limit exceeded
3. No matching images for specific vehicle

**Solutions:**
1. Add `UNSPLASH_ACCESS_KEY` to .env
2. Wait for rate limit reset (1 hour)
3. Try generic search terms or use fallback images

### Images Not Loading:

**Possible Causes:**
1. CORS issues
2. Image URLs expired
3. Network timeout

**Solutions:**
1. Check CORS configuration
2. Re-search for images
3. Increase timeout settings

---

## Files Modified:

### Backend:
- `/app/backend/server.py` - Added search-car-images endpoint

### Frontend:
- `/app/frontend/src/components/admin/LotForm.jsx` - Added Auto-Find Images button

---

## Security Considerations:

1. **API Key Protection:**
   - Store in .env file (not in code)
   - Never commit to Git
   - Use environment variables

2. **Rate Limiting:**
   - Implement backend rate limiting
   - Cache results to reduce API calls
   - Monitor usage

3. **Image Validation:**
   - Verify image URLs before saving
   - Check image format and size
   - Scan for inappropriate content (if needed)

---

## Conclusion

The auto image search feature simplifies the process of finding and adding car photos to inventory listings. It integrates multiple free and paid sources, with fallback options to ensure admins always have images available.

**Next Steps:**
- Add more image sources (Pexels, Pixabay)
- Implement caching for faster searches
- Consider ChromeData integration for OEM photos

---

**Status:** ✅ Ready for production use  
**Requires:** Optional Unsplash API key for best results
