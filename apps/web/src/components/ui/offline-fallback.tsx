import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Fade } from './fade-transition';

interface OfflineFallbackProps {
  children: React.ReactNode;
  className?: string;
  onRetry?: () => void;
}

export function OfflineFallback({ children, className, onRetry }: OfflineFallbackProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  if (isOnline) {
    return children;
  }

  return (
    <Fade show>
      <div className={cn(
        "rounded-lg border bg-card p-6 text-card-foreground shadow-sm",
        className
      )}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-muted p-3">
            <WifiOff className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold">You're offline</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check your internet connection and try again
            </p>
          </div>

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Fade>
  );
} 