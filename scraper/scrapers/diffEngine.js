/**
 * Diff Engine - Detect changes in offers
 */

const fs = require('fs').promises;
const path = require('path');

class DiffEngine {
  constructor() {
    this.previousSnapshot = null;
    this.currentSnapshot = null;
  }

  async loadPreviousSnapshot() {
    try {
      const file = path.join(__dirname, '../state/inventorySnapshot.json');
      const data = await fs.readFile(file, 'utf8');
      this.previousSnapshot = JSON.parse(data);
      return this.previousSnapshot;
    } catch {
      return {};
    }
  }

  async saveSnapshot(snapshot) {
    const file = path.join(__dirname, '../state/inventorySnapshot.json');
    await fs.writeFile(file, JSON.stringify(snapshot, null, 2));
  }

  detectChanges(oldOffers, newOffers) {
    const changes = {
      added: [],
      removed: [],
      modified: [],
      unchanged: []
    };

    const oldMap = new Map(oldOffers.map(o => [o.id, o]));
    const newMap = new Map(newOffers.map(o => [o.id, o]));

    // Detect added
    for (const [id, offer] of newMap) {
      if (!oldMap.has(id)) {
        changes.added.push(offer);
      }
    }

    // Detect removed
    for (const [id, offer] of oldMap) {
      if (!newMap.has(id)) {
        changes.removed.push(offer);
      }
    }

    // Detect modified
    for (const [id, newOffer] of newMap) {
      if (oldMap.has(id)) {
        const oldOffer = oldMap.get(id);
        
        if (this.hasChanges(oldOffer, newOffer)) {
          changes.modified.push({
            id,
            old: oldOffer,
            new: newOffer,
            diff: this.getDiff(oldOffer, newOffer)
          });
        } else {
          changes.unchanged.push(newOffer);
        }
      }
    }

    return changes;
  }

  hasChanges(oldOffer, newOffer) {
    const keys = ['msrp', 'payment', 'mf', 'term', 'residual', 'discount'];
    
    for (const key of keys) {
      if (oldOffer[key] !== newOffer[key]) {
        return true;
      }
    }
    
    return false;
  }

  getDiff(oldOffer, newOffer) {
    const diff = {};
    const keys = ['msrp', 'payment', 'mf', 'term', 'residual', 'discount', 'images'];
    
    for (const key of keys) {
      if (JSON.stringify(oldOffer[key]) !== JSON.stringify(newOffer[key])) {
        diff[key] = {
          old: oldOffer[key],
          new: newOffer[key]
        };
      }
    }
    
    return diff;
  }

  async saveDiffLog(changes) {
    const timestamp = new Date().toISOString().split('T')[0];
    const diffFile = path.join(__dirname, `../output/diffs/${timestamp}_offer_changes.json`);
    
    await fs.writeFile(diffFile, JSON.stringify(changes, null, 2));
    
    // Also append to log
    const logFile = path.join(__dirname, '../logs/offer_changes.log');
    const logEntry = `${new Date().toISOString()} | Added: ${changes.added.length} | Modified: ${changes.modified.length} | Removed: ${changes.removed.length}\n`;
    
    await fs.appendFile(logFile, logEntry);
  }
}

module.exports = DiffEngine;
