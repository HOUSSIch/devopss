import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Sun, Moon, Contrast, Type, Check, Globe, X, Volume2, VolumeX, Zap, Maximize, MessageCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAnnouncement } from "../contexts/AnnouncementContext";
import { useAccessibility } from "../contexts/AccessibilityContext";

export function AccessibilityMenu() {
  const { theme, setTheme, textSize, setTextSize } = useTheme();
  const { language, direction, setLanguage, t } = useLanguage();
  const { announce } = useAnnouncement();
  const { reducedMotion, setReducedMotion, textToSpeechEnabled, setTextToSpeechEnabled, focusManagementEnabled, setFocusManagementEnabled, cognitiveSimplificationEnabled, setCognitiveSimplificationEnabled } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"appearance" | "assistive" | "advanced">("appearance");
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(() => {
    const stored = localStorage.getItem("screenReaderEnabled");
    return stored !== null ? stored === "true" : true; // enabled by default
  });
  const hasMountedRef = useRef(false);
  const previousSettingsRef = useRef({ language, theme, textSize });
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const themeButtonsRef = useRef<HTMLButtonElement[]>([]);
  const textSizeButtonsRef = useRef<HTMLButtonElement[]>([]);
  const languageButtonsRef = useRef<HTMLButtonElement[]>([]);

  const themeOptions = [
    { value: "light", label: t("theme.light.label"), icon: Sun, description: t("theme.light.description") },
    { value: "dark", label: t("theme.dark.label"), icon: Moon, description: t("theme.dark.description") },
    {
      value: "high-contrast",
      label: t("theme.highContrast.label"),
      icon: Contrast,
      description: t("theme.highContrast.description"),
    },
  ] as const;

  const textSizeOptions = [
    { value: "small", label: t("textSize.small.label"), description: t("textSize.small.description"), size: "14px" },
    { value: "medium", label: t("textSize.medium.label"), description: t("textSize.medium.description"), size: "16px" },
    { value: "large", label: t("textSize.large.label"), description: t("textSize.large.description"), size: "18px" },
    { value: "extra-large", label: t("textSize.extraLarge.label"), description: t("textSize.extraLarge.description"), size: "20px" },
  ] as const;

  const languageOptions = [
    { code: "en", label: t("languages.en.nativeName") },
    { code: "fr", label: t("languages.fr.nativeName") },
    { code: "ar", label: t("languages.ar.nativeName") },
  ] as const;

  const getThemeLabel = (value: string) => {
    if (value === "dark") return t("theme.dark.label");
    if (value === "high-contrast") return t("theme.highContrast.label");
    return t("theme.light.label");
  };

  const getTextSizeLabel = (value: string) => {
    if (value === "small") return t("textSize.small.label");
    if (value === "medium") return t("textSize.medium.label");
    if (value === "large") return t("textSize.large.label");
    return t("textSize.extraLarge.label");
  };

  const getLanguageLabel = (value: string) => {
    if (value === "fr") return t("languages.fr.nativeName");
    if (value === "ar") return t("languages.ar.nativeName");
    return t("languages.en.nativeName");
  };

  const handleRadioKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    buttonsRef: React.MutableRefObject<HTMLButtonElement[]>,
    currentValue: string,
    options: Array<{ value?: string; code?: string }>,
    onChange: (value: string) => void
  ) => {
    const key = event.key;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = options.findIndex((opt) => (opt.value || opt.code) === currentValue);
    let nextIndex = currentIndex;

    if (key === "ArrowUp" || key === "ArrowLeft") {
      nextIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
    } else if (key === "ArrowDown" || key === "ArrowRight") {
      nextIndex = currentIndex >= options.length - 1 ? 0 : currentIndex + 1;
    } else if (key === "Home") {
      nextIndex = 0;
    } else if (key === "End") {
      nextIndex = options.length - 1;
    }

    const nextButton = buttonsRef.current[nextIndex];
    if (nextButton) {
      nextButton.focus();
      onChange(options[nextIndex].value || options[nextIndex].code || "");
    }
  };

  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      (closeButtonRef.current ?? dialogRef.current?.querySelector<HTMLButtonElement>("button"))?.focus();

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    openButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem("screenReaderEnabled", String(screenReaderEnabled));
  }, [screenReaderEnabled]);

  useEffect(() => {
    const previousSettings = previousSettingsRef.current;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousSettingsRef.current = { language, theme, textSize };
      return;
    }

    if (!screenReaderEnabled) {
      previousSettingsRef.current = { language, theme, textSize };
      return;
    }

    let message = "";
    if (previousSettings.language !== language) {
      message = `${t("accessibility.language")}: ${getLanguageLabel(language)}`;
    } else if (previousSettings.theme !== theme) {
      message = `${t("accessibility.theme")}: ${getThemeLabel(theme)}`;
    } else if (previousSettings.textSize !== textSize) {
      message = `${t("accessibility.textSize")}: ${getTextSizeLabel(textSize)}`;
    }

    if (message) {
      announce(message);
    }

    previousSettingsRef.current = { language, theme, textSize };
  }, [language, theme, textSize, t, screenReaderEnabled, announce]);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (activeElement === firstElement || activeElement === dialogRef.current) {
        event.preventDefault();
        lastElement.focus();
      }
      return;
    }

    if (activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <>

      <motion.button
        ref={openButtonRef}
        type="button"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${direction === "rtl" ? "left-6" : "right-6"} z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] dark:from-[#b89de6] dark:to-[#c4b5fd] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center pulse-glow`}
        aria-label={t("accessibility.openButton")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Settings className="w-6 h-6" aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50"
              aria-hidden="true"
            />

            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-title"
              aria-describedby="accessibility-description"
              dir={direction}
              tabIndex={-1}
              onKeyDown={handleDialogKeyDown}
            >
              <GlassCard className="bg-white/95 dark:bg-slate-900 high-contrast:bg-black border border-purple-200/70 dark:border-purple-700/70 high-contrast:border-white shadow-xl flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 px-6 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id="accessibility-title" className="text-lg font-bold text-gray-800 dark:text-gray-100 high-contrast:text-white">
                        {t("accessibility.title")}
                      </h2>
                      <p id="accessibility-description" className="text-xs text-gray-600 dark:text-gray-300 high-contrast:text-white">
                        {t("accessibility.subtitle")}
                      </p>
                    </div>
                  </div>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-purple-100 dark:hover:bg-slate-800 high-contrast:hover:bg-gray-800 flex items-center justify-center transition-colors"
                    aria-label={t("accessibility.closeButton")}
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300 high-contrast:text-white" aria-hidden="true" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 px-6 pb-4 border-b border-purple-200/50 dark:border-purple-700/50 high-contrast:border-white">
                  <button
                    type="button"
                    onClick={() => setActiveTab("appearance")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeTab === "appearance"
                        ? "bg-purple-100 dark:bg-purple-900/40 text-[#8b63d3] dark:text-[#b89de6] high-contrast:bg-yellow-300 high-contrast:text-black"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    {t("accessibility.theme")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("assistive")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeTab === "assistive"
                        ? "bg-purple-100 dark:bg-purple-900/40 text-[#8b63d3] dark:text-[#b89de6] high-contrast:bg-yellow-300 high-contrast:text-black"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    Assistive
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("advanced")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeTab === "advanced"
                        ? "bg-purple-100 dark:bg-purple-900/40 text-[#8b63d3] dark:text-[#b89de6] high-contrast:bg-yellow-300 high-contrast:text-black"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    Advanced
                  </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
                  {/* APPEARANCE TAB */}
                  {activeTab === "appearance" && (
                    <>
                      {/* Screen Reader Toggle */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 high-contrast:bg-gray-900 rounded-xl border border-blue-200/70 dark:border-blue-700/70 high-contrast:border-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            screenReaderEnabled
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                              : "bg-blue-100 dark:bg-slate-700 high-contrast:bg-gray-800 text-blue-600 dark:text-blue-400 high-contrast:text-white"
                          }`}>
                            SR
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 high-contrast:text-white">
                              {t("accessibility.screenReaderLabel")}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 high-contrast:text-gray-300">
                              {t("accessibility.screenReaderDescription")}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newVal = !screenReaderEnabled;
                            setScreenReaderEnabled(newVal);
                            announce(newVal ? t("accessibility.enableScreenReader") : t("accessibility.disableScreenReader"));
                          }}
                          aria-label={`${screenReaderEnabled ? t("accessibility.disableScreenReader") : t("accessibility.enableScreenReader")}`}
                          aria-pressed={screenReaderEnabled}
                          className={`relative w-10 h-6 rounded-full transition-colors ${
                            screenReaderEnabled
                              ? "bg-gradient-to-br from-blue-500 to-blue-600"
                              : "bg-gray-300 dark:bg-gray-600 high-contrast:bg-gray-700"
                          }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            screenReaderEnabled ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {/* Theme */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 high-contrast:text-white mb-2">
                          {t("accessibility.theme")}
                        </h3>
                        <div className="space-y-1" role="radiogroup" aria-label={t("accessibility.theme")}>
                          {themeOptions.map((option, index) => (
                            <button
                              key={option.value}
                              ref={(el) => {
                                if (el) themeButtonsRef.current[index] = el;
                              }}
                              type="button"
                              role="radio"
                              aria-label={`Theme: ${option.label}`}
                              aria-checked={theme === option.value}
                              tabIndex={theme === option.value ? 0 : -1}
                              onClick={() => setTheme(option.value)}
                              onKeyDown={(e) =>
                                handleRadioKeyDown(e, themeButtonsRef, theme, themeOptions, (val) => setTheme(val))
                              }
                              className={`w-full p-2 rounded-lg border text-left text-sm transition-all ${
                                theme === option.value
                                  ? "border-[#8b63d3] dark:border-[#b89de6] high-contrast:border-yellow-400 bg-purple-50 dark:bg-purple-900/30 high-contrast:bg-gray-900"
                                  : "border-purple-200/70 dark:border-slate-700 high-contrast:border-white hover:border-purple-300"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <option.icon className="w-4 h-4 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" aria-hidden="true" />
                                  <span className="font-medium text-gray-800 dark:text-gray-100 high-contrast:text-white">
                                    {option.label}
                                  </span>
                                </div>
                                {theme === option.value && (
                                  <Check className="w-4 h-4 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" aria-hidden="true" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text Size */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 high-contrast:text-white mb-2">
                          {t("accessibility.textSize")}
                        </h3>
                        <div className="space-y-1" role="radiogroup" aria-label={t("accessibility.textSize")}>
                          {textSizeOptions.map((option, index) => (
                            <button
                              key={option.value}
                              ref={(el) => {
                                if (el) textSizeButtonsRef.current[index] = el;
                              }}
                              type="button"
                              role="radio"
                              aria-label={`Text size: ${option.label}`}
                              aria-checked={textSize === option.value}
                              tabIndex={textSize === option.value ? 0 : -1}
                              onClick={() => setTextSize(option.value)}
                              onKeyDown={(e) =>
                                handleRadioKeyDown(e, textSizeButtonsRef, textSize, textSizeOptions, (val) => setTextSize(val))
                              }
                              className={`w-full p-2 rounded-lg border text-left text-sm transition-all ${
                                textSize === option.value
                                  ? "border-[#8b63d3] dark:border-[#b89de6] high-contrast:border-yellow-400 bg-purple-50 dark:bg-purple-900/30 high-contrast:bg-gray-900"
                                  : "border-purple-200/70 dark:border-slate-700 high-contrast:border-white hover:border-purple-300"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" style={{ fontSize: option.size }}>
                                    Aa
                                  </span>
                                  <span className="font-medium text-gray-800 dark:text-gray-100 high-contrast:text-white">
                                    {option.label}
                                  </span>
                                </div>
                                {textSize === option.value && (
                                  <Check className="w-4 h-4 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" aria-hidden="true" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 high-contrast:text-white mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" aria-hidden="true" />
                          {t("accessibility.language")}
                        </h3>
                        <div className="space-y-1" role="radiogroup" aria-label={t("accessibility.language")}>
                          {languageOptions.map((option, index) => (
                            <button
                              key={option.code}
                              ref={(el) => {
                                if (el) languageButtonsRef.current[index] = el;
                              }}
                              type="button"
                              role="radio"
                              aria-label={`Language: ${option.label}`}
                              aria-checked={language === option.code}
                              tabIndex={language === option.code ? 0 : -1}
                              onClick={() => setLanguage(option.code)}
                              onKeyDown={(e) =>
                                handleRadioKeyDown(e, languageButtonsRef, language, languageOptions, (val) => setLanguage(val))
                              }
                              className={`w-full p-2 rounded-lg border text-left text-sm transition-all ${
                                language === option.code
                                  ? "border-[#8b63d3] dark:border-[#b89de6] high-contrast:border-yellow-400 bg-purple-50 dark:bg-purple-900/30 high-contrast:bg-gray-900"
                                  : "border-purple-200/70 dark:border-slate-700 high-contrast:border-white hover:border-purple-300"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-gray-800 dark:text-gray-100 high-contrast:text-white">
                                  {option.label}
                                </span>
                                {language === option.code && (
                                  <Check className="w-4 h-4 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" aria-hidden="true" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ASSISTIVE TAB */}
                  {activeTab === "assistive" && (
                    <>
                      {/* Screen Reader */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 high-contrast:bg-gray-900 rounded-xl border border-blue-200/70 dark:border-blue-700/70 high-contrast:border-white">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                          <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 high-contrast:text-white">
                              Screen Reader
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 high-contrast:text-gray-300">
                              Live announcements
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setScreenReaderEnabled(!screenReaderEnabled)}
                          aria-pressed={screenReaderEnabled}
                          className={`relative w-10 h-6 rounded-full transition-colors ${
                            screenReaderEnabled
                              ? "bg-gradient-to-br from-blue-500 to-blue-600"
                              : "bg-gray-300 dark:bg-gray-600 high-contrast:bg-gray-700"
                          }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            screenReaderEnabled ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {/* Reduced Motion */}
                      <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/30 high-contrast:bg-gray-900 rounded-xl border border-amber-200/70 dark:border-amber-700/70 high-contrast:border-white">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                          <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 high-contrast:text-white">
                              {t("accessibility.reducedMotionLabel")}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 high-contrast:text-gray-300">
                              {t("accessibility.reducedMotionDescription")}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newVal = !reducedMotion;
                            setReducedMotion(newVal);
                            announce(newVal ? t("accessibility.reducedMotionEnabled") : t("accessibility.disableReducedMotion"));
                          }}
                          aria-pressed={reducedMotion}
                          className={`relative w-10 h-6 rounded-full transition-colors ${
                            reducedMotion
                              ? "bg-gradient-to-br from-amber-500 to-amber-600"
                              : "bg-gray-300 dark:bg-gray-600 high-contrast:bg-gray-700"
                          }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            reducedMotion ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {/* Text-to-Speech */}
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 high-contrast:bg-gray-900 rounded-xl border border-green-200/70 dark:border-green-700/70 high-contrast:border-white">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                          <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 high-contrast:text-white">
                              {t("accessibility.textToSpeechLabel")}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 high-contrast:text-gray-300">
                              {t("accessibility.textToSpeechDescription")}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newVal = !textToSpeechEnabled;
                            setTextToSpeechEnabled(newVal);
                            announce(newVal ? t("accessibility.enableTextToSpeech") : t("accessibility.disableTextToSpeech"));
                          }}
                          aria-pressed={textToSpeechEnabled}
                          className={`relative w-10 h-6 rounded-full transition-colors ${
                            textToSpeechEnabled
                              ? "bg-gradient-to-br from-green-500 to-green-600"
                              : "bg-gray-300 dark:bg-gray-600 high-contrast:bg-gray-700"
                          }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            textToSpeechEnabled ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {/* Info Box */}
                      <div className="p-3 bg-purple-50 dark:bg-slate-800/60 high-contrast:bg-gray-900 rounded-xl border border-purple-200/70 dark:border-slate-700 high-contrast:border-white">
                        <p className="text-xs text-gray-700 dark:text-gray-300 high-contrast:text-white">
                          <strong>{t("accessibility.tipLabel")}:</strong> {t("accessibility.tip")}
                        </p>
                      </div>
                    </>
                  )}

                  {/* ADVANCED TAB */}
                  {activeTab === "advanced" && (
                    <>
                      {/* Focus Management */}
                      <div className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/30 high-contrast:bg-gray-900 rounded-xl border border-cyan-200/70 dark:border-cyan-700/70 high-contrast:border-white">
                        <div className="flex items-center gap-3">
                          <Maximize className="w-5 h-5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                          <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 high-contrast:text-white">
                              {t("accessibility.focusManagementLabel")}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 high-contrast:text-gray-300">
                              {t("accessibility.focusManagementDescription")}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newVal = !focusManagementEnabled;
                            setFocusManagementEnabled(newVal);
                            announce(newVal ? t("accessibility.enableFocusManagement") : t("accessibility.disableFocusManagement"));
                          }}
                          aria-pressed={focusManagementEnabled}
                          className={`relative w-10 h-6 rounded-full transition-colors ${
                            focusManagementEnabled
                              ? "bg-gradient-to-br from-cyan-500 to-cyan-600"
                              : "bg-gray-300 dark:bg-gray-600 high-contrast:bg-gray-700"
                          }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            focusManagementEnabled ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {/* Cognitive Simplification */}
                      <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/30 high-contrast:bg-gray-900 rounded-xl border border-rose-200/70 dark:border-rose-700/70 high-contrast:border-white">
                        <div className="flex items-center gap-3">
                          <Maximize className="w-5 h-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                          <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 high-contrast:text-white">
                              {t("accessibility.cognitiveSimplificationLabel")}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 high-contrast:text-gray-300">
                              {t("accessibility.cognitiveSimplificationDescription")}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newVal = !cognitiveSimplificationEnabled;
                            setCognitiveSimplificationEnabled(newVal);
                            announce(newVal ? t("accessibility.enableCognitiveSimplification") : t("accessibility.disableCognitiveSimplification"));
                          }}
                          aria-pressed={cognitiveSimplificationEnabled}
                          className={`relative w-10 h-6 rounded-full transition-colors ${
                            cognitiveSimplificationEnabled
                              ? "bg-gradient-to-br from-rose-500 to-rose-600"
                              : "bg-gray-300 dark:bg-gray-600 high-contrast:bg-gray-700"
                          }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            cognitiveSimplificationEnabled ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="p-3 bg-purple-50 dark:bg-slate-800/60 high-contrast:bg-gray-900 rounded-xl border border-purple-200/70 dark:border-slate-700 high-contrast:border-white">
                        <p className="text-xs text-gray-700 dark:text-gray-300 high-contrast:text-white">
                          Advanced features for enhanced accessibility and cognitive support.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
