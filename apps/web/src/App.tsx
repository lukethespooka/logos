import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DailyBriefWidget from "./features/dashboard/DailyBriefWidget";
import PrioritizedInboxWidget from "./features/dashboard/PrioritizedInboxWidget";
import UpcomingScheduleWidget from "./features/dashboard/UpcomingScheduleWidget";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DailyBriefWidget />
          <UpcomingScheduleWidget />
          <PrioritizedInboxWidget />
        </div>
      </div>
    </QueryClientProvider>
  );
} 