import { useState, useEffect, useCallback, useRef } from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimerSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
};

// Simple beep sound as a data URL
const BEEP_SOUND = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEgODlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaRQ0PVqzl77BeGQc9ltvyxnUoBSh+zPDaizsIGGS56+mjTxELTKXh8bllHgU1jdT0z3wvBSJzxPDglUQKElux6eyrWRUIRJve8sFuJAUug8/z1YU2BRxqvu3mnEgODlOq5O+zYRsGPJLZ88p3KgUme8rx3I4+CRVht+rqpVMSC0mh4fK8aiAFM4nU8tGAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYGK4DN8tiIOQcZZ7zs56BODwxPp+PxtmQcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hWEwlGnt/yv2wiBDCG0fPTgzQHHG/A7eSaSg0PVqzl77BeGQc9ltv0xnUoBSh9y/HajDsIF2W56+mjUREKTKPi8blnHgU1jdTy0HwvBSJzxPDglUQKElux6eyrWRUIRJrd88FwJAQug8/z1YY2BRxqvu3mnEgODlKp5e+zYRsGOpPY88p3KgUmecnw3Y4/CBVht+rqpVMSC0mh4PG9aiAFM4nS89GAMQYfccLv45dGCxFYrufur1sYB0CY3PLEcSYGK4DN8tiIOQcZZ7zs56BODwxPp+PxtmQcBjiP1/PMeS0GI3bH8d2RQQk=";

export function PomodoroTimer() {
  const [settings] = useLocalStorage<TimerSettings>(
    "pomodoroSettings",
    DEFAULT_SETTINGS
  );
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleReset = useCallback(() => {
    setTimeLeft(settings.workDuration * 60);
    setIsRunning(false);
    setIsWorkSession(true);
    setSessionCount(0);
  }, [settings]);

  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    audio.volume = 0.5; // Set volume to 50%
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      const nextIsWork = !isWorkSession;
      const nextSessionCount = nextIsWork ? sessionCount : sessionCount + 1;
      const isLongBreak = !nextIsWork && nextSessionCount % settings.sessionsUntilLongBreak === 0;
      
      setIsWorkSession(nextIsWork);
      setSessionCount(nextSessionCount);
      setTimeLeft(
        nextIsWork
          ? settings.workDuration * 60
          : (isLongBreak ? settings.longBreakDuration : settings.breakDuration) * 60
      );

      // Show visual notification
      if (Notification.permission === "granted") {
        new Notification(
          nextIsWork ? "Break time is over!" : "Work session is over!",
          {
            body: nextIsWork
              ? "Time to focus!"
              : isLongBreak
              ? "Time for a long break!"
              : "Time for a short break!",
            silent: true, // Don't play notification sound since we're using our own
          }
        );
      }
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRunning, timeLeft, settings, isWorkSession, sessionCount]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2.5 rounded-md border bg-background px-4 py-2">
          <IconWrapper>
            <Timer className="text-primary" strokeWidth={2.5} />
          </IconWrapper>
          <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          <span className="text-sm text-muted-foreground">
            {isWorkSession ? "Work" : sessionCount % settings.sessionsUntilLongBreak === 0 ? "Long Break" : "Break"}
          </span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 flex items-center justify-center"
              onClick={() => {
                setIsRunning(!isRunning);
              }}
              aria-label={isRunning ? "Pause Timer" : "Start Timer"}
            >
              <IconWrapper>
                {isRunning ? (
                  <Pause className="text-primary" strokeWidth={2.5} />
                ) : (
                  <Play className="text-primary" strokeWidth={2.5} />
                )}
              </IconWrapper>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRunning ? "Pause Timer" : "Start Timer"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 flex items-center justify-center"
              onClick={() => {
                handleReset();
              }}
              aria-label="Reset Timer"
            >
              <IconWrapper>
                <RotateCcw className="text-primary" strokeWidth={2.5} />
              </IconWrapper>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Timer</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
} 