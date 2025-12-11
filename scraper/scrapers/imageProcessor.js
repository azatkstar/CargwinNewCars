/**
 * Image Processing Pipeline
 * Download images (without Sharp for ARM64 compatibility)
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ImageProcessor {
  constructor(config = {}) {
    this.outputDir = config.outputDir || './output/images';
  }

  async ensureDir(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  async downloadImage(imageUrl, dealId) {
    try {
      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const buffer = Buffer.from(response.data);
      
      // Generate filename
      const hash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
      const filename = `${dealId}_${hash}${ext}`;
      const outputPath = path.join(this.outputDir, dealId, filename);
      
      // Ensure directory
      await this.ensureDir(path.join(this.outputDir, dealId));
      
      // Save original
      await fs.writeFile(outputPath, buffer);
      
      console.log(`[Images] Downloaded: ${filename}`);
      
      return {
        original: imageUrl,
        processed: outputPath,
        url: `/scraper/images/${dealId}/${filename}`
      };
      
    } catch (error) {
      console.error(`[Images] Failed to download ${imageUrl}: ${error.message}`);
      return null;
    }
  }

  async processOfferImages(offer) {
    const images = offer.images || [offer.image];
    const processed = [];
    
    for (const imageUrl of images) {
      if (!imageUrl) continue;
      
      const result = await this.downloadImage(imageUrl, offer.id);
      if (result) {
        processed.push(result);
      }
    }
    
    return processed;
  }

  async batchProcess(offers, concurrency = 3) {
    const results = [];
    
    // Process in batches
    for (let i = 0; i < offers.length; i += concurrency) {
      const batch = offers.slice(i, i + concurrency);
      
      const batchResults = await Promise.all(
        batch.map(offer => this.processOfferImages(offer))
      );
      
      results.push(...batchResults);
      
      console.log(`[Images] Processed batch ${i / concurrency + 1}`);
    }
    
    return results;
  }
}

module.exports = ImageProcessor;
