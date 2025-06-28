import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false);

  React.useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);

  const handleChange = (newChecked: boolean) => {
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={isChecked}
      onCheckedChange={handleChange}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border-2 border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative",
        // Checked state with high contrast colors
        "data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900",
        // Dark mode checked state  
        "dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator asChild>
        <div className="absolute inset-0 flex items-center justify-center">
          <Check 
            className={cn(
              "h-3 w-3",
              "text-white dark:text-slate-900"
            )} 
            strokeWidth={3} 
          />
        </div>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
