import html2canvas from 'html2canvas';

/**
 * Captures a DOM element as a high-quality image optimized for Instagram Stories
 * @param {HTMLElement} element - The DOM element to capture
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Base64 data URL of the captured image
 */
export const captureElementAsImage = async (element, options = {}) => {
  const {
    width = 1080,
    height = 1920,
    quality = 1.0,
    backgroundColor = '#000000',
    scale = 2 // For high DPI displays
  } = options;

  try {
    // Get the element's current dimensions
    const rect = element.getBoundingClientRect();
    const aspectRatio = rect.width / rect.height;
    
    // Calculate optimal dimensions for Instagram Stories (9:16 aspect ratio)
    // The SocialCard is 3:4, so we'll center it on a 9:16 background
    let canvasWidth = width;
    let canvasHeight = height;
    
    // Scale the element to fit nicely in the Instagram Stories frame
    const targetCardWidth = width * 0.85; // Use 85% of the width for padding
    const targetCardHeight = targetCardWidth / aspectRatio;
    
    // Ensure the card fits within the frame
    if (targetCardHeight > height * 0.8) {
      const adjustedHeight = height * 0.8;
      const adjustedWidth = adjustedHeight * aspectRatio;
      canvasWidth = adjustedWidth / 0.85 * scale;
      canvasHeight = height * scale;
    } else {
      canvasWidth = width * scale;
      canvasHeight = height * scale;
    }

    console.log('🔥 Starting html2canvas with element:', element);
    console.log('🔥 Element rect:', rect);
    
    const canvas = await html2canvas(element, {
      width: rect.width,
      height: rect.height,
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Let the element's background show through
      logging: true, // Enable logging to debug
      imageTimeout: 15000,
      removeContainer: true,
      foreignObjectRendering: false,
      // Simplified onclone to avoid breaking styles
      onclone: (clonedDoc, clonedElement) => {
        console.log('🔥 Cloned element:', clonedElement);
        
        // Ensure the element is visible and positioned correctly
        clonedElement.style.position = 'relative';
        clonedElement.style.left = '0';
        clonedElement.style.top = '0';
        clonedElement.style.transform = 'none';
        clonedElement.style.webkitTransform = 'none';
        clonedElement.style.margin = '0';
        clonedElement.style.padding = '0';
        
        // Ensure all text and elements are visible
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach(el => {
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.opacity === '0' || computedStyle.visibility === 'hidden') {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
          }
        });
        
        console.log('🔥 Cloned element after modifications:', clonedElement);
      }
    });
    
    console.log('🔥 html2canvas completed, canvas:', canvas);
    console.log('🔥 Canvas dimensions:', canvas.width, 'x', canvas.height);

    // Create a new canvas with Instagram Stories dimensions
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvasWidth;
    finalCanvas.height = canvasHeight;
    const ctx = finalCanvas.getContext('2d');
    
    // Fill with background color (black for Instagram Stories)
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Calculate position to center the social card
    const cardWidth = targetCardWidth * scale;
    const cardHeight = targetCardHeight * scale;
    const x = (canvasWidth - cardWidth) / 2;
    const y = (canvasHeight - cardHeight) / 2;
    
    // Draw the captured element centered on the canvas
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, x, y, cardWidth, cardHeight);
    
    // Convert to high-quality JPEG (Instagram prefers JPEG over PNG)
    return finalCanvas.toDataURL('image/jpeg', quality);
    
  } catch (error) {
    console.error('Failed to capture element as image:', error);
    throw new Error(`Image capture failed: ${error.message}`);
  }
};

/**
 * Converts a data URL to a Blob
 * @param {string} dataURL - Base64 data URL
 * @returns {Blob} - Blob representation of the image
 */
export const dataURLToBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * Downloads an image data URL as a file
 * @param {string} dataURL - Base64 data URL
 * @param {string} filename - Filename for the download
 */
export const downloadImage = (dataURL, filename = 'pogo-session.jpg') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Optimizes image capture settings based on device capabilities
 * @returns {Object} - Optimized capture settings
 */
export const getOptimalCaptureSettings = () => {
  const pixelRatio = window.devicePixelRatio || 1;
  const isHighDPI = pixelRatio > 1;
  
  return {
    width: 1080,
    height: 1920,
    scale: isHighDPI ? Math.min(pixelRatio, 3) : 2, // Cap at 3x for performance
    quality: 0.95, // High quality JPEG
    backgroundColor: '#000000' // Black background for Instagram Stories
  };
};
