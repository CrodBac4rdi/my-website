'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type BackgroundContextType = {
  backgroundUrl: string | null;
  setBackgroundUrl: (url: string | null) => void;
};

const BackgroundContext = createContext<BackgroundContextType>({
  backgroundUrl: null,
  setBackgroundUrl: () => {},
});

export const useBackground = () => useContext(BackgroundContext);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [backgroundUrl, setBackgroundUrlState] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Load from localStorage on mount
    const savedBg = localStorage.getItem('horizon_bg_url');
    if (savedBg) {
      setBackgroundUrlState(savedBg);
    }
  }, []);

  const setBackgroundUrl = (url: string | null) => {
    setBackgroundUrlState(url);
    if (url) {
      localStorage.setItem('horizon_bg_url', url);
    } else {
      localStorage.removeItem('horizon_bg_url');
    }
  };

  // Do not render global background on media detail pages
  const isDetailPage = pathname?.startsWith('/media/');
  const shouldRenderBackground = !isDetailPage;

  return (
    <BackgroundContext.Provider value={{ backgroundUrl, setBackgroundUrl }}>
      {/* GLOBAL DYNAMIC BACKGROUND */}
      <div className="fixed inset-0 z-[-2] pointer-events-none bg-[#020205] overflow-hidden transition-all duration-1000">
        {shouldRenderBackground && backgroundUrl ? (
          <>
            <img 
              src={backgroundUrl} 
              className="w-full h-full object-cover opacity-60 md:opacity-80 transition-opacity duration-1000" 
              alt="Global Backdrop" 
            />
            {/* Soft gradient to blend with content */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020205]/60 to-[#020205]/95"></div>
          </>
        ) : shouldRenderBackground ? (
          /* FALLBACK DEFAULT BACKGROUND */
          <>
            <div className="absolute left-0 right-0 top-[-10%] m-auto h-[500px] w-full max-w-[1500px] rounded-full bg-blue-600/20 opacity-50 blur-[120px]"></div>
            <div className="absolute -left-40 bottom-[-10%] h-[600px] w-[800px] rounded-full bg-purple-600/20 opacity-50 blur-[150px]"></div>
          </>
        ) : null}
      </div>
      {children}
    </BackgroundContext.Provider>
  );
}
