import { useEffect, useRef } from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useAnnouncement } from "../contexts/AnnouncementContext";
import { useTTS } from "../utils/textToSpeech";

function getReadableName(el: Element | null): string {
  if (!el) return "";
  const element = el as HTMLElement;
  // aria-label
  const ariaLabel = element.getAttribute?.("aria-label");
  if (ariaLabel) return ariaLabel.trim();

  // aria-labelledby
  const labelled = element.getAttribute?.("aria-labelledby");
  if (labelled) {
    const ids = labelled.split(/\s+/).map((id) => id.trim()).filter(Boolean);
    const texts = ids.map((id) => document.getElementById(id)?.textContent || "").join(" ").trim();
    if (texts) return texts;
  }

  // alt for images
  if (element instanceof HTMLImageElement && element.alt) return element.alt.trim();

  // inputs: placeholder or value
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (element.placeholder) return element.placeholder.trim();
    if ((element as HTMLInputElement).value) return (element as HTMLInputElement).value.trim();
  }

  // button / a textContent or innerText
  const text = element.innerText || element.textContent || "";
  return text.trim();
}

export default function FocusAnnouncer() {
  const { focusManagementEnabled, textToSpeechEnabled } = useAccessibility();
  const { announce } = useAnnouncement();
  const { speak } = useTTS();

  const hadKeyboardRef = useRef(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab" || e.key === "ArrowDown" || e.key === "ArrowUp") {
        hadKeyboardRef.current = true;
      }
    }

    function onPointerDown() {
      hadKeyboardRef.current = false;
    }

    function onFocusIn(e: FocusEvent) {
      if (!focusManagementEnabled) return;
      // only announce when user is navigating via keyboard
      if (!hadKeyboardRef.current) return;

      const target = e.target as Element | null;
      const name = getReadableName(target);
      if (!name) return;

      // announce for screen readers
      announce(name);

      // optionally speak via TTS
      if (textToSpeechEnabled) {
        try {
          speak(name);
        } catch (err) {
          // swallow errors
          console.error('TTS speak error on focus announce', err);
        }
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
    };
  }, [focusManagementEnabled, textToSpeechEnabled, announce, speak]);

  return null;
}
