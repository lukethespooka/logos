import { useCallback } from 'react';

interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

declare global {
  interface Window {
    showToast?: (options: ToastOptions) => void;
  }
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(options);
    }
  }, []);

  return { toast };
} 