import React from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTTS } from "../utils/textToSpeech";
import { useAnnouncement } from "../contexts/AnnouncementContext";

export function AccessibilityDebugPanel() {
  const { reducedMotion, textToSpeechEnabled, focusManagementEnabled, cognitiveSimplificationEnabled } = useAccessibility();
  const { getState, speak, stop } = useTTS();
  const { announce } = useAnnouncement();

  const ttsState = getState();

  return (
    <div className="fixed left-4 top-20 z-50 bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs w-64 shadow-lg">
      <div className="font-semibold mb-2">Accessibility Debug</div>
      <div className="space-y-1">
        <div>Reduced motion: <strong>{String(reducedMotion)}</strong></div>
        <div>TTS enabled: <strong>{String(textToSpeechEnabled)}</strong></div>
        <div>Focus mgmt: <strong>{String(focusManagementEnabled)}</strong></div>
        <div>Cognitive simp.: <strong>{String(cognitiveSimplificationEnabled)}</strong></div>
        <div>TTS supported: <strong>{String(ttsState.isSupported)}</strong></div>
        <div>TTS speaking: <strong>{String(ttsState.isSpeaking)}</strong></div>
      </div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <button
          onClick={() => speak("This is a test of the text to speech system.")}
          className="px-2 py-1 bg-purple-600 text-white rounded"
        >
          Speak
        </button>
        <button
          onClick={() => stop()}
          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
          Stop
        </button>
        <button
          onClick={() => announce("Debug announcement: settings changed")}
          className="px-2 py-1 bg-amber-200 rounded"
        >
          Announce
        </button>
        <button
          onClick={() => {
            const el = document.getElementById("main-content");
            if (el) {
              // @ts-ignore - speakElement accepts HTMLElement
              speak(el.innerText || el.textContent || "");
            } else {
              announce("Unable to find main content to read");
            }
          }}
          className="px-2 py-1 bg-emerald-500 text-white rounded"
        >
          Read Page
        </button>
      </div>
    </div>
  );
}

export default AccessibilityDebugPanel;
