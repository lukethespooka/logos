import * as React from 'react'
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/useReducedMotion"

interface FadeProps extends React.HTMLAttributes<HTMLDivElement> {
  show?: boolean;
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
  children: React.ReactNode;
}

export function Fade({
  show = true,
  duration = 'normal',
  className,
  children,
  ...props
}: FadeProps) {
  const [isVisible, setIsVisible] = React.useState(show);
  const [shouldRender, setShouldRender] = React.useState(show);
  const prefersReducedMotion = useReducedMotion();

  const durations = {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300'
  };

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Wait a frame before showing to trigger transition
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      // Wait for transition to complete before unmounting
      const timer = setTimeout(
        () => setShouldRender(false),
        prefersReducedMotion ? 0 : duration === 'slow' ? 300 : duration === 'fast' ? 150 : 200
      );
      return () => clearTimeout(timer);
    }
  }, [show, duration, prefersReducedMotion]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "transition-opacity",
        !prefersReducedMotion && durations[duration],
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 