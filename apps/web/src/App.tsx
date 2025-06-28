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
import { Home, Layout } from "lucide-react";
import { Breadcrumb } from "./components/ui/breadcrumb";
import { QuickNavDock } from "./components/QuickNavDock";

const queryClient = new QueryClient();

function Dashboard() {
  const { user, signIn } = useAuth();
  const { isFocused, toggleFocus } = useFocusContext();
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'schedule'>('dashboard');
  const taskWidgetRef = useRef<{ openCreateDialog: () => void } | null>(null);

  // Return to dashboard function
  const returnToDashboard = useCallback(() => {
    const wasNotOnDashboard = currentView !== 'dashboard';
    setCurrentView('dashboard');
    
    // Show helpful feedback only if we weren't already on dashboard
    if (wasNotOnDashboard) {
      (window as any).showToast?.({
        type: 'success',
        title: '🏠 Welcome Home',
        description: 'Returned to main dashboard',
        duration: 1500
      });
    }
  }, [currentView]);

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

  // Keyboard shortcuts
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
      
      // Ctrl/Cmd + H to return to dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        returnToDashboard();
      }
    };

    if (user) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [user, returnToDashboard]);

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
            <button
              onClick={returnToDashboard}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
              title="Return to Dashboard (⌘H)"
            >
              <Layout className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <h1 className="text-xl font-bold">LogOS Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
              </div>
            </button>
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
            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={returnToDashboard}
              className="hidden sm:flex items-center gap-2"
              title="Return to Dashboard (⌘H)"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            
            <SettingsDialog />
          </div>
        </div>
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              {
                label: "Dashboard",
                onClick: returnToDashboard,
                current: currentView === 'dashboard'
              }
            ]}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <FocusWrapper widgetId="daily-brief">
              <DailyBriefWidget />
            </FocusWrapper>
            <FocusWrapper widgetId="inbox">
              <PrioritizedInboxWidget />
            </FocusWrapper>
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            <FocusWrapper widgetId="tasks">
              <SmartTaskOverviewWidget ref={taskWidgetRef} />
            </FocusWrapper>
            <FocusWrapper widgetId="schedule">
              <UpcomingScheduleWidget />
            </FocusWrapper>
          </div>
        </div>
        
        {/* Quick Navigation Dock */}
        <QuickNavDock
          onHomeClick={returnToDashboard}
          onQuickAddClick={() => {
            if (taskWidgetRef.current?.openCreateDialog) {
              taskWidgetRef.current.openCreateDialog();
            }
          }}
        />
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