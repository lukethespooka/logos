import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useFocusContext } from '../contexts/FocusContext';
import { cn } from '../lib/utils';

interface FocusWrapperProps {
  children: ReactNode;
  widgetId?: string;
  className?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<FocusWrapperProps, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Use the global showToast function directly
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast({
        type: 'error',
        title: 'An error occurred',
        description: 'We encountered an unexpected error. Please try refreshing the page.',
        duration: 5000
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p>Please try refreshing the page. If the problem persists, contact support.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add window type declaration
declare global {
  interface Window {
    showToast?: (options: {
      type: 'success' | 'error' | 'info' | 'warning';
      title: string;
      description?: string;
      duration?: number;
    }) => void;
  }
}

export function FocusWrapper({ children, widgetId, className }: FocusWrapperProps) {
  const { isFocused, widgetImportance, trackWidgetInteraction } = useFocusContext();
  
  const importance = widgetImportance[widgetId || ''] || 0;
  const isImportant = importance > 5; // Threshold for important widgets

  const handleInteraction = () => {
    if (widgetId) {
      trackWidgetInteraction(widgetId);
    }
  };

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
} 