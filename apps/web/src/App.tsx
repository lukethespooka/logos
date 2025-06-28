import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Button } from "./components/ui/button";
import { SmartTaskOverviewWidget } from "./features/dashboard/SmartTaskOverviewWidget";
import DailyBriefWidget from "./features/dashboard/DailyBriefWidget";
import PrioritizedInboxWidget from "./features/dashboard/PrioritizedInboxWidget";
import UpcomingScheduleWidget from "./features/dashboard/UpcomingScheduleWidget";
import { useState, useEffect, useCallback, useRef } from "react";
import ContextRibbon from "./features/dashboard/ContextRibbon";
import { FocusProvider, useFocusContext } from './contexts/FocusContext';
import { FocusWrapper } from "@/components/FocusWrapper";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";

const queryClient = new QueryClient();

function Dashboard() {
  const { user, signIn } = useAuth();
  const { isFocused, toggleFocus } = useFocusContext();
  const [isLoading, setIsLoading] = useState(false);
  const taskWidgetRef = useRef<{ openCreateDialog: () => void } | null>(null);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn();
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut for quick task creation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to create task
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (taskWidgetRef.current?.openCreateDialog) {
          taskWidgetRef.current.openCreateDialog();
          
          // Show helpful toast
          (window as any).showToast?.({
            type: 'info',
            title: '⚡ Quick Add',
            description: 'Use Ctrl/Cmd + K anytime to add tasks quickly!',
            duration: 2000
          });
        }
      }
    };

    if (user) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Welcome to LogOS</h1>
          <Button 
            onClick={handleSignIn} 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in with Test Account"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ContextRibbon />
      <div className="container mx-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleFocus}
              className="ml-4"
            >
              {isFocused ? "Exit Focus" : "Enter Focus"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <kbd className="font-mono bg-background px-1 rounded text-[10px]">⌘K</kbd>
              <span>Quick Add</span>
            </div>
            <SettingsDialog />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-1 lg:col-span-2">
            <FocusWrapper widgetId="tasks">
              <SmartTaskOverviewWidget ref={taskWidgetRef} />
            </FocusWrapper>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <FocusWrapper widgetId="daily-brief">
              <DailyBriefWidget />
            </FocusWrapper>
          </div>
          <div className="sm:col-span-1 lg:col-span-2">
            <FocusWrapper widgetId="inbox">
              <PrioritizedInboxWidget />
            </FocusWrapper>
          </div>
          <div className="sm:col-span-1 lg:col-span-2">
            <FocusWrapper widgetId="schedule">
              <UpcomingScheduleWidget />
            </FocusWrapper>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <FocusProvider>
            <TooltipProvider>
              <Dashboard />
            </TooltipProvider>
          </FocusProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 