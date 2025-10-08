import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from '../../logo/POGO.json';

const LoadingScreen = ({ onAnimationComplete }) => {
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    // Animation duration is ~3.2 seconds (95 frames at 30fps)
    // Add a small buffer to ensure it completes
    const timer = setTimeout(() => {
      setAnimationFinished(true);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3300); // 3.3 seconds

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="w-[458px] h-[458px] mb-4">
          <Lottie 
            animationData={animationData}
            loop={false}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
            onComplete={() => {
              // Lottie's onComplete callback for additional timing control
              console.log('🎬 Animation completed');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
