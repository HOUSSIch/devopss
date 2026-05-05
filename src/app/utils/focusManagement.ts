/**
 * Focus Management Utilities
 * Provides focus trapping and focus restoration for modals, dialogs, and overlays
 */

export interface FocusContext {
  element: HTMLElement;
  previousActiveElement: Element | null;
}

const focusStack: FocusContext[] = [];

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
    (el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null
  );
}

/**
 * Create a focus trap for a modal or dialog
 * Keeps focus cycling within the element
 */
export function trapFocus(element: HTMLElement): void {
  const previousActiveElement = document.activeElement as Element | null;
  focusStack.push({ element, previousActiveElement });

  const focusableElements = getFocusableElements(element);

  if (focusableElements.length === 0) {
    // If no focusable elements, focus the container itself
    element.focus();
    return;
  }

  // Focus first element
  focusableElements[0].focus();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      if (activeElement === firstElement || activeElement === element) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Store cleanup function
  (element as any).__focusTrapCleanup = () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Release focus trap and restore focus to previous element
 */
export function releaseFocus(element?: HTMLElement): void {
  if (element && (element as any).__focusTrapCleanup) {
    (element as any).__focusTrapCleanup();
  }

  const context = focusStack.pop();
  if (context && context.previousActiveElement instanceof HTMLElement) {
    context.previousActiveElement.focus();
  }
}

/**
 * Clear all focus traps
 */
export function clearFocusStack(): void {
  focusStack.forEach((context) => {
    if ((context.element as any).__focusTrapCleanup) {
      (context.element as any).__focusTrapCleanup();
    }
  });
  focusStack.length = 0;
}

/**
 * Check if focus is trapped in a specific element
 */
export function isFocusTrapped(element: HTMLElement): boolean {
  return focusStack.some((context) => context.element === element);
}

/**
 * Announce focus change to screen readers
 */
export function announceFocusChange(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    announcement.remove();
  }, 1000);
}
