import { Home, Plus, Search, Settings, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface QuickNavDockProps {
  onHomeClick: () => void;
  onQuickAddClick: () => void;
  className?: string;
}

export function QuickNavDock({ onHomeClick, onQuickAddClick, className }: QuickNavDockProps) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50",
      "flex flex-col gap-2 p-2 bg-background/95 backdrop-blur-sm",
      "border border-border rounded-lg shadow-lg",
      "transition-all duration-200 hover:shadow-xl",
      className
    )}>
      {/* Home/Dashboard */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onHomeClick}
        className="h-9 w-9 p-0"
        title="Return to Dashboard (⌘H)"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {/* Quick Add */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onQuickAddClick}
        className="h-9 w-9 p-0"
        title="Quick Add Task (⌘K)"
      >
        <Plus className="h-4 w-4" />
      </Button>
      
      {/* Focus Mode Indicator */}
      <div className="w-full h-px bg-border my-1" />
      
      <div className="flex items-center justify-center h-6">
        <div className="text-xs text-muted-foreground font-mono">
          ⌘H
        </div>
      </div>
    </div>
  );
} 