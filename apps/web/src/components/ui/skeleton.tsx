import { cn } from "@/lib/utils"
import { animations } from "@/lib/animations"
import { useReducedMotion } from "@/hooks/useReducedMotion"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  /**
   * The visual variant of the skeleton
   * @default "default"
   */
  variant?: "default" | "avatar" | "title" | "text" | "button"
}

export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const variants = {
    default: "h-4 w-full",
    avatar: "h-12 w-12 rounded-full",
    title: "h-7 w-3/4",
    text: "h-4 w-[90%]",
    button: "h-9 w-24 rounded-md"
  }

  return (
    <div
      className={cn(
        "rounded-md bg-gray-200",
        !prefersReducedMotion && animations.loading.skeleton,
        variants[variant],
        className
      )}
      {...props}
    />
  )
} 