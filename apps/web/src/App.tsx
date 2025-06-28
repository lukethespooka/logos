import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Button } from "./components/ui/button";
import { SmartTaskOverviewWidget } from "./features/dashboard/SmartTaskOverviewWidget";
import DailyBriefWidget from "./features/dashboard/DailyBriefWidget";
import PrioritizedInboxWidget from "./features/dashboard/PrioritizedInboxWidget";
import UpcomingScheduleWidget from "./features/dashboard/UpcomingScheduleWidget";
import { useState } from "react";
import ContextRibbon from "./features/dashboard/ContextRibbon";
import { FocusProvider, useFocusContext } from './contexts/FocusContext';
import { FocusWrapper } from "@/components/FocusWrapper";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "./components/ui/toast";

const queryClient = new QueryClient();

function Dashboard() {
  const { user, signIn } = useAuth();
  const { isFocused, toggleFocus } = useFocusContext();
  const [isLoading, setIsLoading] = useState(false);

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
            <SettingsDialog />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-1 lg:col-span-2">
            <FocusWrapper widgetId="tasks">
              <SmartTaskOverviewWidget />
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
            <Dashboard />
          </FocusProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 