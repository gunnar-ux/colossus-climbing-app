// Data synchronization utilities for deployment testing
// Provides export/import functionality and simple cloud sync options

import { storage } from './validation.js';

/**
 * Export all user data to JSON
 * @returns {Object} - Complete user data export
 */
export function exportUserData() {
  const userData = storage.get('colossus-user-data', {});
  const sessions = storage.get('colossus-sessions', []);
  const calibrationDismissed = storage.get('colossus-calibration-dismissed', false);
  
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    userData,
    sessions,
    calibrationDismissed,
    stats: {
      totalSessions: sessions.length,
      totalClimbs: sessions.reduce((sum, s) => sum + (s.climbList?.length || 0), 0),
      dateRange: {
        oldest: sessions.length > 0 ? Math.min(...sessions.map(s => s.timestamp || 0)) : null,
        newest: sessions.length > 0 ? Math.max(...sessions.map(s => s.timestamp || 0)) : null
      }
    }
  };
}

/**
 * Import user data from JSON
 * @param {Object} data - User data export
 * @returns {boolean} - Success status
 */
export function importUserData(data) {
  try {
    if (!data.version || !data.userData || !data.sessions) {
      throw new Error('Invalid data format');
    }
    
    // Validate basic structure
    if (!Array.isArray(data.sessions)) {
      throw new Error('Sessions must be an array');
    }
    
    // Store data
    storage.set('colossus-user-data', data.userData);
    storage.set('colossus-sessions', data.sessions);
    storage.set('colossus-calibration-dismissed', data.calibrationDismissed || false);
    
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

/**
 * Download user data as JSON file
 */
export function downloadUserData() {
  const data = exportUserData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `colossus-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Clear all user data (reset app)
 */
export function clearAllData() {
  storage.remove('colossus-user-data');
  storage.remove('colossus-sessions');
  storage.remove('colossus-calibration-dismissed');
}

/**
 * Simple cloud sync using a mock API (for demo/testing)
 * In production, this would connect to your backend
 */
export class SimpleCloudSync {
  constructor(apiUrl = 'https://jsonbin.io/v3/b') {
    this.apiUrl = apiUrl;
    this.binId = storage.get('colossus-bin-id', null);
  }
  
  async saveToCloud() {
    try {
      const data = exportUserData();
      
      // Create or update bin
      const response = await fetch(this.binId ? `${this.apiUrl}/${this.binId}` : this.apiUrl, {
        method: this.binId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': '$2a$10$example', // Use your actual API key
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!this.binId && result.metadata?.id) {
        this.binId = result.metadata.id;
        storage.set('colossus-bin-id', this.binId);
      }
      
      return {
        success: true,
        syncId: this.binId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Cloud sync failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async loadFromCloud() {
    if (!this.binId) {
      return { success: false, error: 'No sync ID found' };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/${this.binId}/latest`, {
        headers: {
          'X-Master-Key': '$2a$10$example', // Use your actual API key
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (importUserData(data)) {
        return {
          success: true,
          timestamp: data.exportDate
        };
      } else {
        throw new Error('Failed to import data');
      }
    } catch (error) {
      console.error('Cloud load failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Generate a shareable link for data (for gym testing)
 * @returns {string} - Shareable URL with data
 */
export function generateShareableLink() {
  const data = exportUserData();
  const compressed = btoa(JSON.stringify(data));
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?data=${compressed}`;
}

/**
 * Load data from URL parameter (for gym testing)
 * @returns {boolean} - True if data was loaded from URL
 */
export function loadFromShareableLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const dataParam = urlParams.get('data');
  
  if (dataParam) {
    try {
      const data = JSON.parse(atob(dataParam));
      return importUserData(data);
    } catch (error) {
      console.error('Failed to load shared data:', error);
      return false;
    }
  }
  
  return false;
}

/**
 * Development utilities for testing
 */
export const devUtils = {
  // Add sample data for testing
  addSampleData: () => {
    const sampleUser = {
      name: 'Test Climber',
      age: 28,
      gender: 'Male',
      height: { feet: 5, inches: 10, cm: 178 },
      weight: { value: 160, unit: 'lbs' },
      apeIndex: 2,
      location: 'Boulder, CO',
      totalSessions: 5,
      totalClimbs: 47,
      hasCompletedOnboarding: true,
      hasSeenWelcomeTour: true
    };
    
    storage.set('colossus-user-data', sampleUser);
    
    // Generate some test sessions
    const testSessions = [];
    const now = Date.now();
    
    for (let i = 0; i < 5; i++) {
      const sessionTime = now - (i * 2 * 24 * 60 * 60 * 1000); // Every 2 days
      testSessions.push({
        date: new Date(sessionTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: sessionTime,
        startTime: sessionTime,
        endTime: sessionTime + (90 * 60 * 1000), // 90 minutes
        duration: '1h 30m',
        climbs: 8 + Math.floor(Math.random() * 10),
        medianGrade: `V${3 + Math.floor(Math.random() * 3)}`,
        avgRPE: 6 + Math.random() * 2,
        climbList: Array.from({ length: 8 + Math.floor(Math.random() * 10) }, (_, j) => ({
          grade: `V${2 + Math.floor(Math.random() * 4)}`,
          angle: ['SLAB', 'VERTICAL', 'OVERHANG'][Math.floor(Math.random() * 3)],
          style: ['Power', 'Technical', 'Simple'][Math.floor(Math.random() * 3)],
          rpe: 5 + Math.floor(Math.random() * 4),
          attempts: 1 + Math.floor(Math.random() * 3),
          timestamp: sessionTime + (j * 10 * 60 * 1000) // 10 minutes apart
        }))
      });
    }
    
    storage.set('colossus-sessions', testSessions);
    
    return true;
  },
  
  // Reset to onboarding state
  resetToOnboarding: () => {
    clearAllData();
    window.location.reload();
  },
  
  // Show data stats
  showDataStats: () => {
    const data = exportUserData();
    console.log('Current data stats:', data.stats);
    return data.stats;
  }
};
