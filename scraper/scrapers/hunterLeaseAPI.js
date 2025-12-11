/**
 * Hunter.Lease API Integration
 * Auto-publish scraped offers
 */

const axios = require('axios');

class HunterLeaseAPI {
  constructor(config) {
    this.baseUrl = config.apiUrl || 'http://localhost:8001/api';
    this.adminToken = config.adminToken;
  }

  async importOffer(offerData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/admin/import-offer`,
        offerData,
        {
          headers: {
            'Authorization': `Bearer ${this.adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.ok) {
        console.log(`[API] Imported offer: ${offerData.title} → ID: ${response.data.id}`);
        return response.data.id;
      }

      return null;
    } catch (error) {
      console.error(`[API] Import failed: ${error.message}`);
      return null;
    }
  }

  async updateOffer(offerId, updates) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/admin/offers/${offerId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${this.adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.ok;
    } catch (error) {
      console.error(`[API] Update failed: ${error.message}`);
      return false;
    }
  }

  async markInactive(offerId) {
    try {
      await this.updateOffer(offerId, { status: 'inactive' });
      console.log(`[API] Marked inactive: ${offerId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncOffers(scrapedOffers, hunterIdMap) {
    const results = {
      imported: 0,
      updated: 0,
      failed: 0
    };

    for (const offer of scrapedOffers) {
      const hunterId = hunterIdMap[offer.id];

      if (hunterId) {
        // Update existing
        const success = await this.updateOffer(hunterId, offer);
        if (success) results.updated++;
        else results.failed++;
      } else {
        // Import new
        const newId = await this.importOffer(offer);
        if (newId) {
          hunterIdMap[offer.id] = newId;
          results.imported++;
        } else {
          results.failed++;
        }
      }
    }

    return results;
  }
}

module.exports = HunterLeaseAPI;
