import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/useReducedMotion"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: number | string;
  height?: number | string;
}

export function Skeleton({
  className,
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  ...props
}: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion && animation !== 'none';

  const baseStyles = {
    width: width,
    height: height,
  };

  return (
    <div
      className={cn(
        "bg-muted/50 dark:bg-muted/20",
        {
          'rounded-md': variant === 'text',
          'rounded-full': variant === 'circular',
          'rounded-lg': variant === 'rectangular',
          'animate-pulse': shouldAnimate && animation === 'pulse',
          'animate-shimmer': shouldAnimate && animation === 'wave',
        },
        className
      )}
      style={baseStyles}
      {...props}
    />
  );
}

// Compound components for common use cases
export function SkeletonText({ className, ...props }: Omit<SkeletonProps, 'variant'>) {
  return (
    <Skeleton
      variant="text"
      className={cn("h-4 w-full", className)}
      {...props}
    />
  );
}

export function SkeletonTitle({ className, ...props }: Omit<SkeletonProps, 'variant'>) {
  return (
    <Skeleton
      variant="text"
      className={cn("h-6 w-3/4", className)}
      {...props}
    />
  );
}

export function SkeletonAvatar({ size = 40, className, ...props }: Omit<SkeletonProps, 'variant' | 'width' | 'height'> & { size?: number }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

export function SkeletonCard({ className, ...props }: Omit<SkeletonProps, 'variant'>) {
  return (
    <Skeleton
      variant="rectangular"
      className={cn("h-48 w-full", className)}
      {...props}
    />
  );
} 