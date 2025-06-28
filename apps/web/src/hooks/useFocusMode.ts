import { useState, useEffect, useCallback } from "react";

interface UseFocusMode {
  isFocused: boolean;
  isAutoFocused: boolean;
  toggleFocus: () => void;
  widgetImportance: Record<string, number>;
  trackWidgetInteraction: (widgetId: string) => void;
}

const IDLE_TIMEOUT = 30000; // 30 seconds
const STORAGE_KEY = "focus_mode";
const IMPORTANCE_KEY = "widget_importance";

export function useFocusMode(timeoutMinutes: number = 5): UseFocusMode {
  // Focus mode state
  const [isFocused, setIsFocused] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  });

  // Auto focus state
  const [isAutoFocused, setIsAutoFocused] = useState(false);

  // Widget importance tracking
  const [widgetImportance, setWidgetImportance] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem(IMPORTANCE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Idle detection
  useEffect(() => {
    if (isFocused) return; // Don't prompt if already focused

    let timeoutId: number;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        // Only prompt if not already focused
        if (!isFocused) {
          const shouldFocus = window.confirm(
            "You've been inactive for a while. Would you like to enter Focus Mode?"
          );
          if (shouldFocus) {
            setIsFocused(true);
          }
        }
      }, IDLE_TIMEOUT);
    };

    // Track user activity
    const activities = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    activities.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Start initial timer

    return () => {
      window.clearTimeout(timeoutId);
      activities.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isFocused]);

  // Persist focus state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isFocused));
  }, [isFocused]);

  // Persist importance scores
  useEffect(() => {
    localStorage.setItem(IMPORTANCE_KEY, JSON.stringify(widgetImportance));
  }, [widgetImportance]);

  // Track widget interactions
  const trackWidgetInteraction = useCallback((widgetId: string) => {
    setWidgetImportance((prev: Record<string, number>) => ({
      ...prev,
      [widgetId]: (prev[widgetId] || 0) + 1
    }));
  }, []);

  const toggleFocus = useCallback(() => {
    setIsFocused((prev: boolean) => !prev);
    setIsAutoFocused(false);
  }, []);

  // Auto focus detection
  useEffect(() => {
    const checkActivity = () => {
      // Implementation of activity checking
      // For now, we'll just use a simple timeout
      if (!isFocused) {
        setIsAutoFocused(true);
        setIsFocused(true);
      }
    };

    const timer = setInterval(checkActivity, timeoutMinutes * 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isFocused, timeoutMinutes]);

  return {
    isFocused,
    isAutoFocused,
    toggleFocus,
    widgetImportance,
    trackWidgetInteraction
  };
} 