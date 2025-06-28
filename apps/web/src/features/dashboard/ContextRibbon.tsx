import { Button } from "@/components/ui/button";
import { Lightbulb, CalendarCheck } from "lucide-react";
import { useFocusContext } from "@/contexts/FocusContext";
import { PomodoroTimer } from "./PomodoroTimer";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-12 w-12 flex items-center justify-center" aria-label="Plan My Day">
                    <IconWrapper>
                      <CalendarCheck className="text-primary" strokeWidth={2.5} />
                    </IconWrapper>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Plan My Day</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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