import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../logo/POGO.json';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="w-[458px] h-[458px] mb-4">
          <Lottie 
            animationData={animationData}
            loop={false}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
