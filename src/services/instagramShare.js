import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { captureElementAsImage, dataURLToBlob, downloadImage, getOptimalCaptureSettings } from '../utils/imageCapture.js';
import { InstagramStoriesNative } from './instagramShareNative.js';

/**
 * Instagram Stories sharing service for POGO climbing app
 * Handles both iOS native sharing and web fallbacks
 */
class InstagramShareService {
  constructor() {
    this.appId = '1840929596840822'; // Facebook App ID
    this.isNative = Capacitor.isNativePlatform();
    this.isIOS = Capacitor.getPlatform() === 'ios';
    this.nativeInstagram = new InstagramStoriesNative();
  }

  /**
   * Shares a social card to Instagram Stories
   * @param {HTMLElement} cardElement - The SocialCard DOM element to capture
   * @param {Object} options - Sharing options
   * @returns {Promise<boolean>} - Success status
   */
  async shareToInstagramStories(cardElement, options = {}) {
    try {
      console.log('🔥 Starting Instagram Stories share process...');
      
      let imageDataURL;
      
      // Check if this is a test share with a pre-made image
      if (options.testImageDataURL) {
        console.log('🔥 Using test image for sharing');
        imageDataURL = options.testImageDataURL;
      } else if (cardElement) {
        // Capture the social card as an optimized image
        const captureSettings = getOptimalCaptureSettings();
        imageDataURL = await captureElementAsImage(cardElement, {
          ...captureSettings,
          ...options
        });
        console.log('🔥 Social card captured successfully');
      } else {
        throw new Error('No card element or test image provided');
      }
      
      if (this.isIOS && this.isNative) {
        // Use the working share sheet approach while we fix image capture
        console.log('🔥 Using share sheet approach (working flow)...');
        return await this.shareWithShareSheet(imageDataURL);
      } else {
        return await this.shareWithWebFallback(imageDataURL);
      }
      
    } catch (error) {
      console.error('🔥 Instagram sharing failed:', error);
      throw new Error(`Sharing failed: ${error.message}`);
    }
  }

  /**
   * iOS-specific Instagram Stories sharing using direct custom URL schemes
   * This bypasses the iOS share sheet and opens Instagram Stories directly
   * @param {string} imageDataURL - Base64 image data
   * @returns {Promise<boolean>} - Success status
   */
  async shareToInstagramStoriesIOS(imageDataURL) {
    try {
      console.log('🔥 Attempting direct Instagram Stories share...');
      
      // Convert data URL to blob
      const blob = dataURLToBlob(imageDataURL);
      
      // Convert blob to NSData format for iOS pasteboard
      const base64Data = await this.blobToBase64(blob);
      
      // Use Instagram's direct custom URL scheme with pasteboard
      // This is the approach Spotify and other apps use
      const instagramURL = `instagram-stories://share?source_application=${this.appId}`;
      
      console.log('🔥 Opening Instagram Stories directly with URL:', instagramURL);
      
      // First, we need to set the image data to the pasteboard
      // Since we're in a web context via Capacitor, we'll use a different approach
      
      // Save image as temporary file for iOS to access
      const fileName = `pogo-session-${Date.now()}.jpg`;
      
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });
      
      console.log('🔥 Image saved for Instagram access');
      
      // Get the file URI
      const fileUri = await Filesystem.getUri({
        directory: Directory.Cache,
        path: fileName
      });
      
      // Now we need to use a custom approach to open Instagram directly
      // We'll create a custom intent that mimics what Spotify does
      
      try {
        // Try to open Instagram Stories directly using the custom URL scheme
        // This requires us to handle the pasteboard data differently
        
        // For now, let's use a hybrid approach:
        // 1. Save the image data
        // 2. Open Instagram Stories URL scheme
        // 3. Let Instagram access the saved image
        
        // Open Instagram Stories directly
        const success = await this.openInstagramStoriesDirectly(fileUri.uri, fileName);
        
        if (success) {
          console.log('🔥 Instagram Stories opened successfully');
          return true;
        } else {
          throw new Error('Failed to open Instagram Stories directly');
        }
        
      } catch (directError) {
        console.warn('🔥 Direct Instagram opening failed:', directError);
        
        // Fallback to the share sheet as last resort
        await Share.share({
          title: 'My POGO Climbing Session',
          text: 'Check out my climbing progress! Powered by POGO',
          url: fileUri.uri
        });
        
        return true;
      }
      
    } catch (error) {
      console.error('🔥 iOS Instagram sharing failed:', error);
      throw error;
    }
  }

  /**
   * Direct iOS Instagram Stories sharing - simplified approach
   * @param {string} imageDataURL - Base64 image data
   * @returns {Promise<boolean>} - Success status
   */
  async shareToInstagramStoriesIOSDirect(imageDataURL) {
    try {
      console.log('🔥 Starting direct Instagram Stories sharing...');
      console.log('🔥 Image data URL length:', imageDataURL.length);
      console.log('🔥 Image data URL preview:', imageDataURL.substring(0, 100) + '...');
      
      // First, let's try the direct URL approach without saving files
      const instagramURL = `instagram-stories://share?source_application=${this.appId}`;
      
      try {
        console.log('🔥 Attempting direct Instagram URL open:', instagramURL);
        
        // Try to open Instagram Stories directly first
        await Browser.open({
          url: instagramURL,
          windowName: '_system'
        });
        
        console.log('🔥 Instagram Stories URL opened - but image won\'t be there yet');
        console.log('🔥 This confirms Instagram is available and URL scheme works');
        
        // For now, this will open Instagram Stories but without the image
        // The image needs to be handled via pasteboard (which requires native code)
        return true;
        
      } catch (browserError) {
        console.error('🔥 Browser.open failed completely:', browserError);
        console.log('🔥 Instagram may not be installed or URL scheme not working');
        
        // Fall back to the share sheet approach
        console.log('🔥 Falling back to share sheet...');
        return await this.shareWithShareSheet(imageDataURL);
      }
      
    } catch (error) {
      console.error('🔥 Direct Instagram sharing failed:', error);
      throw error;
    }
  }

  /**
   * Fallback to share sheet approach
   * @param {string} imageDataURL - Base64 image data
   * @returns {Promise<boolean>} - Success status
   */
  async shareWithShareSheet(imageDataURL) {
    try {
      console.log('🔥 Using share sheet fallback...');
      console.log('🔥 Image data URL length:', imageDataURL.length);
      console.log('🔥 Image data preview:', imageDataURL.substring(0, 50) + '...');
      
      // Convert data URL to blob and save as temporary file
      const blob = dataURLToBlob(imageDataURL);
      console.log('🔥 Blob created:', blob.size, 'bytes, type:', blob.type);
      
      const fileName = `pogo-session-${Date.now()}.jpg`;
      
      // Convert blob to base64 for Capacitor Filesystem
      const base64Data = await this.blobToBase64(blob);
      console.log('🔥 Base64 data length:', base64Data.length);
      
      // Save image to temporary directory (no encoding for binary data)
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
        // No encoding specified for binary data
      });
      
      console.log('🔥 Image saved to cache:', writeResult);
      
      // Get the file URI for sharing
      const fileUri = await Filesystem.getUri({
        directory: Directory.Cache,
        path: fileName
      });
      
      console.log('🔥 File URI for sharing:', fileUri.uri);
      
      // Try different share approaches
      try {
        // First try with files array (preferred for images)
        await Share.share({
          title: 'My POGO Climbing Session',
          text: 'Check out my climbing progress! Powered by POGO',
          files: [fileUri.uri]
        });
        console.log('🔥 Share with files array succeeded');
      } catch (filesError) {
        console.warn('🔥 Share with files failed, trying url:', filesError);
        
        // Fallback to url parameter
        await Share.share({
          title: 'My POGO Climbing Session',
          text: 'Check out my climbing progress! Powered by POGO',
          url: fileUri.uri
        });
        console.log('🔥 Share with url succeeded');
      }
      
      // Clean up temporary file after a delay
      setTimeout(async () => {
        try {
          await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Cache
          });
          console.log('🔥 Temporary file cleaned up');
        } catch (cleanupError) {
          console.warn('🔥 Failed to clean up temporary file:', cleanupError);
        }
      }, 15000); // Even longer delay for share sheet
      
      return true;
      
    } catch (error) {
      console.error('🔥 Share sheet fallback failed:', error);
      console.error('🔥 Error details:', error.message, error.stack);
      throw error;
    }
  }

  /**
   * Opens Instagram Stories directly using custom URL scheme
   * This mimics how Spotify and other apps do direct Instagram integration
   * @param {string} fileUri - URI of the image file
   * @param {string} fileName - Name of the temporary file
   * @returns {Promise<boolean>} - Success status
   */
  async openInstagramStoriesDirectly(fileUri, fileName) {
    try {
      // This is where we need to implement the direct Instagram Stories opening
      // Similar to how Spotify does it
      
      // For Capacitor, we need to use the Browser plugin to open custom URL schemes
      const { Browser } = await import('@capacitor/browser');
      
      const instagramURL = `instagram-stories://share?source_application=${this.appId}`;
      
      // Try to open the Instagram URL scheme
      await Browser.open({
        url: instagramURL,
        windowName: '_system'
      });
      
      console.log('🔥 Instagram Stories URL opened');
      
      // Clean up the temporary file after a delay
      setTimeout(async () => {
        try {
          await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Cache
          });
          console.log('🔥 Temporary file cleaned up');
        } catch (cleanupError) {
          console.warn('🔥 Failed to clean up temporary file:', cleanupError);
        }
      }, 5000);
      
      return true;
      
    } catch (error) {
      console.error('🔥 Failed to open Instagram Stories directly:', error);
      return false;
    }
  }

  /**
   * Web fallback sharing - downloads image and provides sharing options
   * @param {string} imageDataURL - Base64 image data
   * @returns {Promise<boolean>} - Success status
   */
  async shareWithWebFallback(imageDataURL) {
    try {
      console.log('🔥 Using web fallback sharing...');
      
      // Check if Web Share API is available
      if (navigator.share && navigator.canShare) {
        try {
          const blob = dataURLToBlob(imageDataURL);
          const file = new File([blob], 'pogo-session.jpg', { type: 'image/jpeg' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'My POGO Climbing Session',
              text: 'Check out my climbing progress! Powered by POGO',
              files: [file]
            });
            
            console.log('🔥 Web Share API used successfully');
            return true;
          }
        } catch (webShareError) {
          console.warn('🔥 Web Share API failed:', webShareError);
        }
      }
      
      // Fallback to download
      downloadImage(imageDataURL, `pogo-session-${Date.now()}.jpg`);
      
      // Show user instructions
      this.showSharingInstructions();
      
      console.log('🔥 Image downloaded for manual sharing');
      return true;
      
    } catch (error) {
      console.error('🔥 Web fallback sharing failed:', error);
      throw error;
    }
  }

  /**
   * Shows instructions for manual sharing
   */
  showSharingInstructions() {
    // This could be enhanced with a modal or toast notification
    alert('Image saved! Open Instagram Stories and select the downloaded image to share your climbing session.');
  }

  /**
   * Converts blob to base64 string
   * @param {Blob} blob - Blob to convert
   * @returns {Promise<string>} - Base64 string
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data URL prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Checks if Instagram is installed (iOS only)
   * @returns {Promise<boolean>} - Whether Instagram is available
   */
  async isInstagramAvailable() {
    if (!this.isIOS || !this.isNative) {
      return false;
    }
    
    try {
      return await this.nativeInstagram.isInstagramAvailable();
    } catch (error) {
      console.warn('🔥 Could not check Instagram availability:', error);
      return false;
    }
  }

  /**
   * Gets sharing capabilities for the current platform
   * @returns {Object} - Available sharing options
   */
  getSharingCapabilities() {
    return {
      instagramStories: this.isIOS && this.isNative,
      webShare: !!navigator.share,
      download: true,
      genericShare: this.isNative
    };
  }
}

// Export singleton instance
export const instagramShareService = new InstagramShareService();

// Export class for testing
export { InstagramShareService };
