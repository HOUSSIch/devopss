import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Accessibility, Moon, Sun, Type, Globe, X, Check } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";

export function AdminAccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, textSize, setTextSize } = useTheme();
  const { language, direction, setLanguage, t } = useLanguage();
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

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

  const textSizeOptions = [
    { value: "small", label: t("textSize.small.label") },
    { value: "medium", label: t("textSize.medium.label") },
    { value: "large", label: t("textSize.large.label") },
    { value: "extra-large", label: t("textSize.extraLarge.label") },
  ] as const;

  const languageOptions = [
    { code: "en", label: t("languages.en.nativeName") },
    { code: "fr", label: t("languages.fr.nativeName") },
    { code: "ar", label: t("languages.ar.nativeName") },
  ] as const;

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
      <div className={`fixed bottom-6 ${direction === "rtl" ? "left-6" : "right-6"} z-40 group`}>
        <motion.button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={t("admin.accessibilityShortcut")}
          title={t("admin.accessibilityShortcut")}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <Accessibility className="w-6 h-6" />
        </motion.button>

        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {t("admin.accessibilityShortcut")}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
              aria-hidden="true"
            />

            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, x: direction === "rtl" ? -300 : 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === "rtl" ? -300 : 300 }}
              className={`fixed ${direction === "rtl" ? "left-0" : "right-0"} top-0 h-full w-full max-w-md bg-white dark:bg-[#2d1b4e] shadow-2xl z-50 overflow-y-auto`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-accessibility-title"
              dir={direction}
              tabIndex={-1}
              onKeyDown={handleDialogKeyDown}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] rounded-xl flex items-center justify-center">
                      <Accessibility className="w-6 h-6 text-white" />
                    </div>
                    <h2 id="admin-accessibility-title" className="text-2xl font-bold text-gray-800 dark:text-white">
                      {t("accessibility.title")}
                    </h2>
                  </div>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    aria-label={t("accessibility.closeButton")}
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {theme === "dark" ? (
                        <Moon className="w-6 h-6 text-[#8b63d3]" />
                      ) : (
                        <Sun className="w-6 h-6 text-[#8b63d3]" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t("admin.themeMode")}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t("admin.choosePreferredTheme")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === "light"
                          ? "border-[#8b63d3] bg-purple-100 dark:bg-purple-900/40"
                          : "border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                      }`}
                    >
                      <Sun className="w-6 h-6 text-[#8b63d3]" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{t("theme.light.label")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === "dark"
                          ? "border-[#8b63d3] bg-purple-100 dark:bg-purple-900/40"
                          : "border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                      }`}
                    >
                      <Moon className="w-6 h-6 text-[#8b63d3]" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{t("theme.dark.label")}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Type className="w-6 h-6 text-[#8b63d3]" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t("admin.textSizeTitle")}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("admin.adjustTextSize")}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {textSizeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTextSize(option.value)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          textSize === option.value
                            ? "border-[#8b63d3] bg-purple-100 dark:bg-purple-900/40"
                            : "border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{option.label}</span>
                        <span className="text-gray-600 dark:text-gray-400">Aa</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-6 h-6 text-[#8b63d3]" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t("admin.languageTitle")}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("admin.selectPreferredLanguage")}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {languageOptions.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => setLanguage(option.code)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          language === option.code
                            ? "border-[#8b63d3] bg-purple-100 dark:bg-purple-900/40"
                            : "border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                        }`}
                        aria-pressed={language === option.code}
                      >
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{option.label}</span>
                        {language === option.code && <Check className="ml-auto w-5 h-5 text-[#8b63d3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
