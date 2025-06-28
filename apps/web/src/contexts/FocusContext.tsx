import React, { createContext, useContext } from 'react';
import { useFocusMode } from '../hooks/useFocusMode';

interface FocusContextType {
  isFocused: boolean;
  toggleFocus: () => void;
  widgetImportance: Record<string, number>;
  trackWidgetInteraction: (widgetId: string) => void;
}

const FocusContext = createContext<FocusContextType | null>(null);

export function useFocusContext() {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocusContext must be used within a FocusProvider');
  }
  return context;
}

interface FocusProviderProps {
  children: React.ReactNode;
}

export function FocusProvider({ children }: FocusProviderProps) {
  const focusMode = useFocusMode();

  return (
    <FocusContext.Provider value={focusMode}>
      {children}
    </FocusContext.Provider>
  );
} 