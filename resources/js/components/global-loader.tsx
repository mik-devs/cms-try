import { useEffect, useState } from 'react';

export default function GlobalLoader({ show }: { show: boolean }) {
  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-cream/90 backdrop-blur-sm transition-opacity duration-300 ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 border-4 border-gold-soft border-t-gold rounded-full animate-spin"></div>
        <img 
          src="/images/image.webp" 
          alt="Kiblawan Logo" 
          width={80} 
          height={80} 
          className="w-20 h-20 object-contain animate-pulse relative z-10"
        />
      </div>
      <p className="mt-6 text-sm font-semibold tracking-widest text-forest uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );
}