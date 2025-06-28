import React from 'react';
import { cn } from "@/lib/utils";

interface IconWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function IconWrapper({ children, className }: IconWrapperProps) {
  return (
    <div className={cn(
      "flex items-center justify-center w-8 h-8",
      className
    )}>
      {children}
    </div>
  );
} 