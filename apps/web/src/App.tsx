import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import DailyBriefWidget from "./features/dashboard/DailyBriefWidget";
import PrioritizedInboxWidget from "./features/dashboard/PrioritizedInboxWidget";
import UpcomingScheduleWidget from "./features/dashboard/UpcomingScheduleWidget";
import SmartTaskOverviewWidget from "./features/dashboard/SmartTaskOverviewWidget";
import { supabase } from "./lib/supabase";
import ContextRibbon from "./features/dashboard/ContextRibbon";

const queryClient = new QueryClient();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Temporary login for development
  useEffect(() => {
    const signIn = async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password123",
      });
      if (error) {
        console.error("Error signing in test user:", error);
      } else {
        setIsAuthenticated(true);
      }
    };
    signIn();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen w-full overflow-x-hidden bg-gray-50">
        <div className="mx-auto flex w-full max-w-7xl flex-col p-8">
          <header className="w-full">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, Alex</h1>
          </header>
          <div className="mt-4 w-full">
            <ContextRibbon />
          </div>
          <div className="mt-8 w-full flex-grow">
            {isAuthenticated ? (
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="w-full overflow-hidden">
                  <DailyBriefWidget />
                </div>
                <div className="w-full overflow-hidden">
                  <PrioritizedInboxWidget />
                </div>
                <div className="w-full overflow-hidden">
                  <SmartTaskOverviewWidget />
                </div>
                <div className="w-full overflow-hidden">
                  <UpcomingScheduleWidget />
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                Loading...
              </div>
            )}
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
} 