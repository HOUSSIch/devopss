import { createContext, useContext, useCallback, useEffect, useState } from "react";

interface AccessibilityContextType {
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  textToSpeechEnabled: boolean;
  setTextToSpeechEnabled: (value: boolean) => void;
  focusManagementEnabled: boolean;
  setFocusManagementEnabled: (value: boolean) => void;
  cognitiveSimplificationEnabled: boolean;
  setCognitiveSimplificationEnabled: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("reducedMotion");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(() => {
    const stored = localStorage.getItem("textToSpeechEnabled");
    return stored !== null ? stored === "true" : false;
  });

  const [focusManagementEnabled, setFocusManagementEnabled] = useState(() => {
    const stored = localStorage.getItem("focusManagementEnabled");
    return stored !== null ? stored === "true" : true; // enabled by default
  });

  const [cognitiveSimplificationEnabled, setCognitiveSimplificationEnabled] = useState(() => {
    const stored = localStorage.getItem("cognitiveSimplificationEnabled");
    return stored !== null ? stored === "true" : false;
  });

  // Persist settings and apply CSS class for reduced motion
  useEffect(() => {
    localStorage.setItem("reducedMotion", String(reducedMotion));
    
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
      document.documentElement.style.setProperty("--animation-duration", "0s");
    } else {
      document.documentElement.classList.remove("reduced-motion");
      document.documentElement.style.setProperty("--animation-duration", "0.3s");
    }
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem("textToSpeechEnabled", String(textToSpeechEnabled));
  }, [textToSpeechEnabled]);

  useEffect(() => {
    localStorage.setItem("focusManagementEnabled", String(focusManagementEnabled));
  }, [focusManagementEnabled]);

  useEffect(() => {
    localStorage.setItem("cognitiveSimplificationEnabled", String(cognitiveSimplificationEnabled));
    
    if (cognitiveSimplificationEnabled) {
      document.documentElement.classList.add("cognitive-simplification");
    } else {
      document.documentElement.classList.remove("cognitive-simplification");
    }
  }, [cognitiveSimplificationEnabled]);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("reducedMotion") === null) {
        setReducedMotion(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        reducedMotion,
        setReducedMotion,
        textToSpeechEnabled,
        setTextToSpeechEnabled,
        focusManagementEnabled,
        setFocusManagementEnabled,
        cognitiveSimplificationEnabled,
        setCognitiveSimplificationEnabled,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
