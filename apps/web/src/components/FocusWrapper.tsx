import { type ReactNode } from 'react';
import { useFocusContext } from '../contexts/FocusContext';
import { cn } from '../lib/utils';

interface FocusWrapperProps {
  children: ReactNode;
  widgetId: string;
  className?: string;
}

export function FocusWrapper({ children, widgetId, className }: FocusWrapperProps) {
  const { isFocused, widgetImportance, trackWidgetInteraction } = useFocusContext();
  
  const importance = widgetImportance[widgetId] || 0;
  const isImportant = importance > 5; // Threshold for important widgets
  
  const handleInteraction = () => {
    trackWidgetInteraction(widgetId);
  };

  return (
    <div
      className={cn(
        'transition-all duration-300',
        {
          'opacity-20 hover:opacity-100': isFocused && !isImportant,
          'opacity-100': !isFocused || isImportant,
        },
        className
      )}
      onClick={handleInteraction}
      onKeyDown={handleInteraction}
      role="presentation"
    >
      {children}
    </div>
  );
} 