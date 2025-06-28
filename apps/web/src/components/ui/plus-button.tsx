import { Plus } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface PlusButtonProps {
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PlusButton({ onClick, className, size = "md" }: PlusButtonProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12", 
    lg: "h-14 w-14"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "fixed bottom-6 right-6 z-40",
        sizeClasses[size],
        className
      )}
    >
      <Plus className={iconSizes[size]} />
      <span className="sr-only">Add new task</span>
    </Button>
  );
} 