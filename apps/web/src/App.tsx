import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DailyBriefWidget from "./features/dashboard/DailyBriefWidget";
import PrioritizedInboxWidget from "./features/dashboard/PrioritizedInboxWidget";
import UpcomingScheduleWidget from "./features/dashboard/UpcomingScheduleWidget";
import SmartTaskOverviewWidget from "./features/dashboard/SmartTaskOverviewWidget";

const queryClient = new QueryClient();

export default function App() {
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