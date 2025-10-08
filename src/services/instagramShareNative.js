import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

/**
 * Custom Capacitor plugin for Instagram Stories sharing
 * This implements the proper iOS pasteboard approach that Meta documented
 */
const InstagramStoriesPlugin = registerPlugin('InstagramStories', {
  web: () => import('./instagramShareWeb.js').then(m => new m.InstagramStoriesWeb()),
});

/**
 * Native Instagram Stories sharing service
 * Implements the exact approach from Meta's documentation
 */
export class InstagramStoriesNative {
  constructor() {
    this.appId = '1840929596840822';
    this.isNative = Capacitor.isNativePlatform();
    this.isIOS = Capacitor.getPlatform() === 'ios';
  }

  /**
   * Share image to Instagram Stories using native iOS pasteboard approach
   * @param {string} imageDataURL - Base64 image data
   * @returns {Promise<boolean>} - Success status
   */
  async shareToInstagramStories(imageDataURL) {
    if (!this.isIOS || !this.isNative) {
      throw new Error('Instagram Stories sharing only available on iOS');
    }

    try {
      console.log('🔥 Starting native Instagram Stories share...');
      
      // Convert data URL to base64 data
      const base64Data = imageDataURL.split(',')[1];
      
      // Use our custom plugin to handle the native iOS implementation
      const result = await InstagramStoriesPlugin.shareToStories({
        imageData: base64Data,
        appId: this.appId
      });
      
      console.log('🔥 Instagram Stories share result:', result);
      return result.success;
      
    } catch (error) {
      console.error('🔥 Native Instagram Stories sharing failed:', error);
      throw error;
    }
  }

  /**
   * Check if Instagram is available
   * @returns {Promise<boolean>} - Whether Instagram is available
   */
  async isInstagramAvailable() {
    if (!this.isIOS || !this.isNative) {
      return false;
    }

    try {
      const result = await InstagramStoriesPlugin.canOpenInstagram();
      return result.available;
    } catch (error) {
      console.warn('🔥 Could not check Instagram availability:', error);
      return false;
    }
  }
}

// Web fallback implementation
class InstagramStoriesWeb {
  async shareToStories({ imageData, appId }) {
    // Convert base64 back to data URL for web fallback
    const dataURL = `data:image/jpeg;base64,${imageData}`;
    
    // Create download link
    const link = document.createElement('a');
    link.download = `pogo-session-${Date.now()}.jpg`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show instructions
    alert('Image saved! Open Instagram Stories and select the downloaded image to share your climbing session.');
    
    return { success: true };
  }

  async canOpenInstagram() {
    return { available: false };
  }
}

export { InstagramStoriesWeb };
