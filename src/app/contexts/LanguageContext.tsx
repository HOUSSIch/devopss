import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { getTranslation, supportedLanguages, translations, type LanguageCode } from "../utils/translations";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: Record<string, unknown>,
          elementId: string,
        ) => unknown;
      };
    };
  }
}

type Direction = "ltr" | "rtl";

interface LanguageContextType {
  language: LanguageCode;
  direction: Direction;
  setLanguage: (language: LanguageCode) => void;
  t: (path: string) => string;
}

const LANGUAGE_STORAGE_KEY = "deepskyn-language";
const GOOGLE_TRANSLATE_ELEMENT_ID = "google_translate_element";
const GOOGLE_TRANSLATE_SCRIPT_ID = "google-translate-script";
const GOOGLE_TRANSLATE_RELOAD_KEY = "deepskyn-google-translate-reload";

function ensureGoogleTranslateContainer() {
  let container = document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = GOOGLE_TRANSLATE_ELEMENT_ID;
    container.style.display = "none";
    document.body.appendChild(container);
  }
}

function ensureGoogleTranslateScript() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  ensureGoogleTranslateContainer();

  if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
    return;
  }

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) {
      return;
    }

    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        autoDisplay: false,
        includedLanguages: "en,fr,ar",
      },
      GOOGLE_TRANSLATE_ELEMENT_ID,
    );
  };

  const script = document.createElement("script");
  script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

function setGoogleTranslateCookie(targetLanguage: LanguageCode) {
  const cookieValue = `googtrans=/en/${targetLanguage}`;
  document.cookie = `${cookieValue};path=/`;

  const domainParts = window.location.hostname.split(".");
  if (domainParts.length > 1) {
    const topLevelDomain = domainParts.slice(-2).join(".");
    document.cookie = `${cookieValue};path=/;domain=.${topLevelDomain}`;
  }
}

function applyGoogleTranslation(targetLanguage: LanguageCode, attempt = 0) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  setGoogleTranslateCookie(targetLanguage);

  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) {
    if (attempt < 15) {
      window.setTimeout(() => applyGoogleTranslation(targetLanguage, attempt + 1), 300);
    } else {
      const reloadMarker = `lang:${targetLanguage}`;
      const lastReloadMarker = window.sessionStorage.getItem(GOOGLE_TRANSLATE_RELOAD_KEY);
      if (lastReloadMarker !== reloadMarker) {
        window.sessionStorage.setItem(GOOGLE_TRANSLATE_RELOAD_KEY, reloadMarker);
        window.location.reload();
      }
    }
    return;
  }

  if (combo.value !== targetLanguage) {
    combo.value = targetLanguage;
    combo.dispatchEvent(new Event("change"));
  }

  window.sessionStorage.removeItem(GOOGLE_TRANSLATE_RELOAD_KEY);
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getBrowserLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage && supportedLanguages.includes(savedLanguage as LanguageCode)) {
    return savedLanguage as LanguageCode;
  }

  const browserLanguage = window.navigator.language.slice(0, 2).toLowerCase();
  if (supportedLanguages.includes(browserLanguage as LanguageCode)) {
    return browserLanguage as LanguageCode;
  }

  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => getBrowserLanguage());

  useEffect(() => {
    ensureGoogleTranslateScript();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-language", language);

    applyGoogleTranslation(language);
  }, [language]);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
  };

  const value = useMemo<LanguageContextType>(() => {
    const dictionary = translations[language];
    return {
      language,
      direction: language === "ar" ? "rtl" : "ltr",
      setLanguage,
      t: (path: string) =>
        getTranslation(dictionary as Record<string, unknown>, path) ||
        getTranslation(translations.en as Record<string, unknown>, path) ||
        path,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
