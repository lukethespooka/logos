import { Button } from "@/components/ui/button";
import { Lightbulb, CalendarCheck } from "lucide-react";
import { useFocusContext } from "@/contexts/FocusContext";
import { PomodoroTimer } from "./PomodoroTimer";
import { IconWrapper } from "@/components/ui/icon-wrapper";


const ContextRibbon = () => {
  const { isFocused } = useFocusContext();

  return (
    <div className="border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between p-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="text-sm font-semibold text-foreground">Next Best Actions</h3>
          </div>
          <div className="hidden h-8 border-l border-border sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <button 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-12 w-12"
              aria-label="Plan My Day"
              title="Plan My Day"
            >
              <IconWrapper>
                <CalendarCheck className="text-primary" strokeWidth={2.5} />
              </IconWrapper>
            </button>
            <PomodoroTimer />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFocused && (
            <span className="hidden text-sm font-medium text-primary sm:inline">
              Focus Mode Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextRibbon; 