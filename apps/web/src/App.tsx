import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import DailyBriefWidget from "./features/dashboard/DailyBriefWidget";
import PrioritizedInboxWidget from "./features/dashboard/PrioritizedInboxWidget";
import UpcomingScheduleWidget from "./features/dashboard/UpcomingScheduleWidget";
import SmartTaskOverviewWidget from "./features/dashboard/SmartTaskOverviewWidget";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient();

export default function App() {
  // Temporary login for development
  useEffect(() => {
    const signIn = async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password123",
      });
      if (error) console.error("Error signing in test user:", error);
    };
    signIn();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full flex-col items-center bg-gray-50 p-8">
        <header className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, Alex</h1>
        </header>
        <main className="mt-8 flex flex-grow items-center justify-center">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DailyBriefWidget />
            <UpcomingScheduleWidget />
            <PrioritizedInboxWidget />
            <SmartTaskOverviewWidget />
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
} 