import React from 'react';

interface IntroVideoProps {
  src: string; // e.g., /videos/intro.mp4
  poster?: string; // optional poster image
  heightClass?: string; // tailwind height class, default h-64
  objectPositionClass?: string; // e.g., object-top, object-center
}

const IntroVideo: React.FC<IntroVideoProps> = ({ src, poster, heightClass = 'h-64', objectPositionClass = 'object-top' }) => {
  return (
    <>
      <style>{`
        @keyframes floatY { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
      `}</style>
      <div
        className={`w-full bg-black rounded-lg shadow mb-6 overflow-hidden ${heightClass}`}
        style={{ animation: 'floatY 6s ease-in-out infinite' }}
      >
        <video
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          className={`w-full h-full object-cover ${objectPositionClass}`}
        />
      </div>
    </>
  );
};

export default IntroVideo;
