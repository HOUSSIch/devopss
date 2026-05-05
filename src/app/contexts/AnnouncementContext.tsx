import { createContext, useContext, useCallback, useRef, useEffect } from "react";

interface AnnouncementContextType {
  announce: (message: string) => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef(true);

  const announce = useCallback((message: string) => {
    if (!isFirstRenderRef.current && liveRegionRef.current) {
      // Use textContent for more immediate screen reader pickup
      liveRegionRef.current.textContent = "";
      
      // Small delay then set the message
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
        }
      }, 50);
    }
  }, []);

  // Skip announcing on first render
  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  return (
    <AnnouncementContext.Provider value={{ announce }}>
      <div 
        ref={liveRegionRef}
        role="status" 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
        aria-label="Accessibility announcements"
      />
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncement() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error("useAnnouncement must be used within AnnouncementProvider");
  }
  return context;
}
