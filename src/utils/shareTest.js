/**
 * Test utilities for Instagram Stories sharing functionality
 * Use these in development to validate the sharing system
 */

import { instagramShareService } from '../services/instagramShare.js';
import { captureElementAsImage, getOptimalCaptureSettings } from './imageCapture.js';

/**
 * Test the image capture functionality
 * @param {HTMLElement} element - Element to test capture on
 */
export const testImageCapture = async (element) => {
  try {
    console.log('🧪 Testing image capture...');
    
    const settings = getOptimalCaptureSettings();
    console.log('🧪 Capture settings:', settings);
    
    const startTime = performance.now();
    const imageDataURL = await captureElementAsImage(element, settings);
    const endTime = performance.now();
    
    console.log(`🧪 Image captured in ${Math.round(endTime - startTime)}ms`);
    console.log(`🧪 Image size: ${Math.round(imageDataURL.length / 1024)}KB`);
    
    // Create a preview
    const img = new Image();
    img.src = imageDataURL;
    img.style.maxWidth = '200px';
    img.style.border = '2px solid #00ff00';
    img.title = 'Captured Social Card Preview';
    
    // Add to page for visual verification
    document.body.appendChild(img);
    
    console.log('🧪 Preview image added to page');
    return imageDataURL;
    
  } catch (error) {
    console.error('🧪 Image capture test failed:', error);
    throw error;
  }
};

/**
 * Test the sharing service capabilities
 */
export const testSharingCapabilities = () => {
  console.log('🧪 Testing sharing capabilities...');
  
  const capabilities = instagramShareService.getSharingCapabilities();
  console.log('🧪 Platform capabilities:', capabilities);
  
  console.log('🧪 Platform info:', {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    webShare: !!navigator.share,
    canShare: !!navigator.canShare
  });
  
  return capabilities;
};

/**
 * Test the complete sharing flow (web fallback)
 * @param {HTMLElement} element - Element to share
 */
export const testCompleteSharing = async (element) => {
  try {
    console.log('🧪 Testing complete sharing flow...');
    
    // Test capabilities first
    testSharingCapabilities();
    
    // Test image capture
    await testImageCapture(element);
    
    // Test sharing (will use web fallback in development)
    console.log('🧪 Initiating share test...');
    const success = await instagramShareService.shareToInstagramStories(element);
    
    console.log(`🧪 Sharing test ${success ? 'succeeded' : 'failed'}`);
    return success;
    
  } catch (error) {
    console.error('🧪 Complete sharing test failed:', error);
    throw error;
  }
};

/**
 * Add test buttons to the page for manual testing
 */
export const addTestButtons = () => {
  const testContainer = document.createElement('div');
  testContainer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    background: rgba(0,0,0,0.8);
    padding: 10px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;
  
  const buttons = [
    {
      text: 'Test Capabilities',
      action: testSharingCapabilities
    },
    {
      text: 'Test Capture',
      action: () => {
        const socialCard = document.querySelector('[data-testid="social-card"]') || 
                          document.querySelector('.aspect-\\[3\\/4\\]') ||
                          document.querySelector('section > div');
        if (socialCard) {
          testImageCapture(socialCard);
        } else {
          console.error('🧪 Could not find social card element');
        }
      }
    },
    {
      text: 'Test Share',
      action: () => {
        const socialCard = document.querySelector('[data-testid="social-card"]') || 
                          document.querySelector('.aspect-\\[3\\/4\\]') ||
                          document.querySelector('section > div');
        if (socialCard) {
          testCompleteSharing(socialCard);
        } else {
          console.error('🧪 Could not find social card element');
        }
      }
    }
  ];
  
  buttons.forEach(({ text, action }) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      padding: 8px 12px;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    button.onclick = action;
    testContainer.appendChild(button);
  });
  
  document.body.appendChild(testContainer);
  console.log('🧪 Test buttons added to page');
};

// Auto-add test buttons in development
if (process.env.NODE_ENV === 'development') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTestButtons);
  } else {
    addTestButtons();
  }
}
