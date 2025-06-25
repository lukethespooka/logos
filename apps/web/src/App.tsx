import DailyBriefWidget from "@/features/dashboard/DailyBriefWidget";
import UpcomingScheduleWidget from "@/features/dashboard/UpcomingScheduleWidget";

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-8 bg-slate-50">
      <DailyBriefWidget />
      <UpcomingScheduleWidget />
    </div>
  );
} 