# Advanced Accessibility Features Implementation

## Overview

This document outlines the implementation of three advanced accessibility features for the DeepSkyn frontend application:
1. **Focus Management** - Smart focus trapping and restoration
2. **Reduced Motion Mode** - Disable animations for users with vestibular disorders
3. **Text-to-Speech** - Audio reading of page content

## 1. Focus Management

### Purpose
Provides intelligent focus handling for modals, dialogs, and popups to ensure keyboard and screen reader users can navigate effectively.

### Implementation

#### Files Created
- **[src/app/utils/focusManagement.ts](src/app/utils/focusManagement.ts)** - Core focus trap utilities
  - `trapFocus()` - Traps focus within a container and cycles through focusable elements
  - `releaseFocus()` - Releases focus trap and restores to previous element
  - `getFocusableElements()` - Gets all keyboard-navigable elements
  - `announceFocusChange()` - Announces focus changes to screen readers

#### Features
- **Modal Focus Trapping**: When a modal/dialog opens, focus automatically enters and cycles within it
- **Focus Restoration**: When the modal closes, focus returns to the element that opened it
- **Tab Cycling**: Pressing Tab at the last element cycles back to the first
- **Shift+Tab Support**: Shift+Tab at the first element cycles back to the last
- **Screen Reader Announcements**: Focus changes are announced to assistive technology

#### Usage in AccessibilityMenu

The `AccessibilityMenu` component implements focus trapping:

```typescript
// Focus trap is automatically applied when dialog opens
const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (event.key === "Escape") {
    setIsOpen(false);
    return;
  }
  // Tab cycling logic handles focus trapping
}
```

#### Translations

- **focusManagementLabel**: "Smart Focus Management"
- **focusManagementDescription**: "Automatic focus trapping in modals and dialogs"
- **enableFocusManagement**: "Enable focus management"
- **disableFocusManagement**: "Disable focus management"

---

## 2. Reduced Motion Mode

### Purpose
Disables animations and transitions for users with vestibular disorders, photosensitivity, or motion sensitivity.

### Implementation

#### Files Modified
- **[src/app/contexts/AccessibilityContext.tsx](src/app/contexts/AccessibilityContext.tsx)** - New context for accessibility features
  - `reducedMotion` state - Boolean flag for motion reduction
  - Automatic detection of system preference: `prefers-reduced-motion`
  - LocalStorage persistence
  - CSS class application: `reduced-motion` on `<html>` element

- **[src/styles/custom.css](src/styles/custom.css)** - CSS rules for reduced motion
  - Disables all animations: `animation: none !important`
  - Disables all transitions: `transition: none !important`
  - Overrides Framer Motion animations
  - Sets scroll behavior to auto

#### Features
- **Automatic System Detection**: Reads `prefers-reduced-motion: reduce` from OS settings
- **User Override**: Users can manually enable/disable in Accessibility Menu
- **Persistence**: Settings saved to localStorage
- **Global CSS Rules**: Applies `animation: none` and `transition: none` to all elements
- **Framer Motion Support**: Overrides motion library animations

#### Behavior

When enabled:
- All page transitions lose animation
- Button hover effects become instant
- Modal open/close animations are disabled
- Scroll animations are removed
- Float and pulse effects are disabled

#### Translations

- **reducedMotionLabel**: "Reduce Motion"
- **reducedMotionDescription**: "Disables animations and transitions"
- **enableReducedMotion**: "Enable reduced motion"
- **disableReducedMotion**: "Disable reduced motion"
- **reducedMotionEnabled**: "Reduced motion enabled. Animations are disabled."
- **motionAndAnimationTitle**: "Motion & Animation"

#### CSS Implementation

```css
html.reduced-motion * {
  animation: none !important;
  animation-duration: 0.01ms !important;
  transition: none !important;
  transition-duration: 0.01ms !important;
}
```

---

## 3. Text-to-Speech (TTS)

### Purpose
Provides audio reading of page content for users who are blind, have low vision, or prefer auditory learning.

### Implementation

#### Files Created
- **[src/app/utils/textToSpeech.ts](src/app/utils/textToSpeech.ts)** - TTS engine
  - `TextToSpeechManager` class - Manages speech synthesis
  - `ttsManager` singleton - Global TTS instance
  - `useTTS()` hook - React hook for TTS functionality
  - Methods:
    - `speak(text)` - Read text aloud
    - `speakElement(element)` - Read element content
    - `pause()` - Pause ongoing speech
    - `resume()` - Resume paused speech
    - `stop()` - Stop all speech
    - `getVoices()` - Get available system voices
    - `setVoice(index)` - Select voice

#### Features

**Speech Synthesis API Integration**
- Uses browser's native Web Speech API
- Supports multiple voices from system
- Configurable rate, pitch, and volume
- Utterance queue for multiple readings

**Advanced Features**
- **Utterance Queuing**: Multiple TTS requests are queued and spoken sequentially
- **Error Handling**: Catches and logs speech synthesis errors
- **State Management**: Tracks speaking/paused state
- **Voice Selection**: Allows choosing from available system voices
- **Language Support**: Respects language context for proper pronunciation

#### Usage

```typescript
const { speak, stop, isSpeaking } = useTTS();

// Read text
speak("Hello, world!", { rate: 1.0, pitch: 1.0 });

// Read element
speakElement(document.getElementById("content"));

// Control
pause();
resume();
stop();
```

#### Integration with Accessibility Menu

The TTS toggle is available in the `AccessibilityMenu`:

```typescript
const { textToSpeechEnabled, setTextToSpeechEnabled } = useAccessibility();

// Toggle in settings
<button onClick={() => setTextToSpeechEnabled(!textToSpeechEnabled)} ... />
```

#### Translations

- **textToSpeechLabel**: "Text-to-Speech"
- **textToSpeechDescription**: "Read page content aloud"
- **enableTextToSpeech**: "Enable text-to-speech"
- **disableTextToSpeech**: "Disable text-to-speech"

#### Accessibility Features

- **Respects Reduced Motion**: TTS works alongside reduced motion setting
- **Language Aware**: Uses current language context for pronunciation
- **Focus Integration**: Can announce content based on focused elements
- **Screen Reader Friendly**: Announcements can be made to live regions

---

## Context Management

### AccessibilityContext

**New context** ([src/app/contexts/AccessibilityContext.tsx](src/app/contexts/AccessibilityContext.tsx)) manages all advanced accessibility settings:

```typescript
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
```

**Features**
- Automatic system preference detection
- LocalStorage persistence
- CSS class application for reduced motion
- Reactive state updates

### Updated App.tsx

Wrapped application with `AccessibilityProvider`:

```typescript
export default function App() {
  return (
    <AccessibilityProvider>
      <ThemeProvider>
        {/* ... rest of providers ... */}
      </ThemeProvider>
    </AccessibilityProvider>
  );
}
```

---

## AccessibilityMenu Updates

The `AccessibilityMenu` component now includes **four new toggles**:

1. **Reduced Motion** (Amber icon: Zap)
   - Disables animations for motion-sensitive users
   
2. **Text-to-Speech** (Green icon: MessageCircle)
   - Enables audio reading of content
   
3. **Smart Focus Management** (Cyan icon: Maximize)
   - Automatic focus trapping in dialogs
   
4. **Cognitive Simplification** (Rose icon: Maximize)
   - Simplifies layouts and visual distractions

Each toggle includes:
- Color-coded icon background
- Clear label and description
- Accessible toggle button with `aria-pressed`
- Persistent user preference storage
- Live region announcements

---

## CSS Implementation

### Reduced Motion CSS

All animations and transitions are disabled when `html.reduced-motion` class is applied:

```css
html.reduced-motion * {
  animation: none !important;
  animation-duration: 0.01ms !important;
  transition: none !important;
}
```

### Cognitive Simplification CSS

Decorative elements are hidden and visual complexity is reduced:

```css
html.cognitive-simplification .future-orb,
html.cognitive-simplification .future-grid,
html.cognitive-simplification .ai-scan-overlay {
  display: none !important;
}
```

---

## Translations Added

### English
```
reducedMotionLabel: "Reduce Motion"
reducedMotionDescription: "Disables animations and transitions"
textToSpeechLabel: "Text-to-Speech"
textToSpeechDescription: "Read page content aloud"
focusManagementLabel: "Smart Focus Management"
focusManagementDescription: "Automatic focus trapping in modals and dialogs"
cognitiveSimplificationLabel: "Cognitive Simplification"
cognitiveSimplificationDescription: "Simplified layouts and fewer visual distractions"
```

### French & Arabic
All translations added for French (fr) and Arabic (ar) locales.

---

## WCAG 2.1 Compliance

These features improve compliance with:

- **2.3.3 Animation from Interactions (Level AAA)** - Reduced Motion disables animations
- **2.4.3 Focus Order (Level A)** - Focus Management ensures proper tab order
- **2.4.7 Focus Visible (Level AA)** - Focus states are clearly visible
- **4.1.2 Name, Role, Value (Level A)** - Proper ARIA labels and roles
- **4.1.3 Status Messages (Level AA)** - Live region announcements

---

## Testing Recommendations

### Manual Testing

1. **Focus Management**
   - Open AccessibilityMenu and press Tab - focus should cycle within dialog
   - Press Escape to close - focus should return to Settings button
   - Use keyboard-only navigation for all dialogs

2. **Reduced Motion**
   - Enable in Accessibility Menu
   - Verify all page transitions are instant
   - Check that system preference is respected initially
   - Disable and verify animations return

3. **Text-to-Speech**
   - Enable in Accessibility Menu
   - Verify browser supports Web Speech API
   - Test speaking different content types
   - Verify pause/resume functionality

### Accessibility Testing

- Use screen reader (NVDA, JAWS, VoiceOver) to verify announcements
- Test with keyboard-only navigation
- Verify proper focus indicators
- Test with different language settings

---

## Browser Support

| Feature | Browser Support |
|---------|-----------------|
| Focus Management | All modern browsers |
| Reduced Motion | All modern browsers (CSS) |
| Text-to-Speech | All modern browsers (except older IE) |
| prefers-reduced-motion | Chrome, Firefox, Safari, Edge |
| Web Speech API | Chrome, Edge, Safari (limited in Firefox) |

---

## Files Summary

### New Files
- `src/app/utils/focusManagement.ts` - Focus trap utilities (150 lines)
- `src/app/utils/textToSpeech.ts` - TTS engine (140 lines)
- `src/app/contexts/AccessibilityContext.tsx` - Accessibility context (80 lines)

### Modified Files
- `src/app/App.tsx` - Added AccessibilityProvider wrapper
- `src/app/components/AccessibilityMenu.tsx` - Added 4 new toggle controls
- `src/app/utils/translations.ts` - Added 24 new translation keys (x3 languages)
- `src/styles/custom.css` - Added 150+ lines of CSS for new features

### Total New Code
~400 lines of TypeScript + ~150 lines of CSS + translation keys

---

## Future Enhancements

1. **Enhanced TTS Controls**
   - Playback speed control
   - Voice selection UI
   - Reading mode (line, paragraph, page)

2. **Additional Focus Management**
   - Dropdown focus trapping
   - Breadcrumb navigation focus management
   - Combobox focus behavior

3. **Advanced Simplification**
   - Toggle for data visualization complexity
   - Simplified form layouts
   - Essential content only mode

4. **Performance**
   - Lazy load TTS library
   - Cache synthesized utterances
   - Optimize CSS for production

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [ARIA: Focus Management](https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/)
- [Motion & Animation](https://www.a11y-101.com/design/animations-and-transitions)

