import { useState, useEffect, useCallback } from "react";

interface UseFocusMode {
  isFocused: boolean;
  isAutoFocused: boolean;
  toggleFocus: () => void;
  widgetImportance: Record<string, number>;
  trackWidgetInteraction: (widgetId: string) => void;
}

const STORAGE_KEY = "focus_mode";
const IMPORTANCE_KEY = "widget_importance";

interface InactivitySettings {
  inactiveNotificationsEnabled: boolean;
  inactiveTimeoutMinutes: number;
}

export function useFocusMode(): UseFocusMode {
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

  // Get inactivity settings from localStorage
  const getInactivitySettings = (): InactivitySettings => {
    const stored = localStorage.getItem("pomodoroSettings");
    if (stored) {
      const settings = JSON.parse(stored);
      return {
        inactiveNotificationsEnabled: settings.inactiveNotificationsEnabled ?? true,
        inactiveTimeoutMinutes: settings.inactiveTimeoutMinutes ?? 15
      };
    }
    return {
      inactiveNotificationsEnabled: true,
      inactiveTimeoutMinutes: 15
    };
  };

  // Idle detection
  useEffect(() => {
    if (isFocused) return; // Don't prompt if already focused

    const settings = getInactivitySettings();
    if (!settings.inactiveNotificationsEnabled) return; // Don't prompt if disabled

    let timeoutId: number;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        // Only prompt if not already focused
        if (!isFocused) {
          const shouldFocus = window.confirm(
            `You've been inactive for ${settings.inactiveTimeoutMinutes} minute${settings.inactiveTimeoutMinutes === 1 ? '' : 's'}. Would you like to enter Focus Mode?`
          );
          if (shouldFocus) {
            setIsFocused(true);
          }
        }
      }, settings.inactiveTimeoutMinutes * 60 * 1000);
    };

    // Track user activity
    const activities = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    activities.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Listen for settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pomodoroSettings") {
        // Settings changed, restart timer with new settings
        window.clearTimeout(timeoutId);
        const newSettings = getInactivitySettings();
        if (newSettings.inactiveNotificationsEnabled && !isFocused) {
          resetTimer();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    resetTimer(); // Start initial timer

    return () => {
      window.clearTimeout(timeoutId);
      activities.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      window.removeEventListener('storage', handleStorageChange);
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

  // Auto focus detection - disabled for now
  // useEffect(() => {
  //   const checkActivity = () => {
  //     // Implementation of activity checking
  //     // For now, we'll just use a simple timeout
  //     if (!isFocused) {
  //       setIsAutoFocused(true);
  //       setIsFocused(true);
  //     }
  //   };

  //   const timer = setInterval(checkActivity, 5 * 60 * 1000);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [isFocused]);

  return {
    isFocused,
    isAutoFocused,
    toggleFocus,
    widgetImportance,
    trackWidgetInteraction
  };
} 