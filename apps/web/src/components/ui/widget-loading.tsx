import { cn } from '@/lib/utils';
import { SkeletonTitle, SkeletonText, SkeletonCard } from './skeleton';

interface WidgetLoadingProps {
  className?: string;
  variant?: 'default' | 'compact' | 'list';
  itemCount?: number;
}

export function WidgetLoading({ 
  className,
  variant = 'default',
  itemCount = 3
}: WidgetLoadingProps) {
  const items = Array.from({ length: itemCount }, (_, i) => i);

  const renderDefaultLayout = () => (
    <div className="space-y-6">
      <SkeletonTitle />
      <div className="space-y-4">
        {items.map((i) => (
          <div key={i} className="space-y-2">
            <SkeletonText className="w-3/4" />
            <SkeletonText className="w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompactLayout = () => (
    <div className="space-y-4">
      <SkeletonTitle className="w-1/2" />
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i} className="space-y-2">
            <SkeletonText className="w-full" />
            <SkeletonText className="w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-4">
      <SkeletonTitle className="w-2/3" />
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <SkeletonCard className="h-12 w-12" />
            <div className="space-y-2 flex-1">
              <SkeletonText className="w-3/4" />
              <SkeletonText className="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const layouts = {
    default: renderDefaultLayout,
    compact: renderCompactLayout,
    list: renderListLayout
  };

  return (
    <div className={cn(
      "rounded-lg border bg-card p-6 text-card-foreground shadow-sm animate-in fade-in-50",
      className
    )}>
      {layouts[variant]()}
    </div>
  );
} 