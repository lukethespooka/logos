import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface ScheduleItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  color: string;
}

const UpcomingScheduleWidget = () => {
  const { data: scheduleItems, isLoading } = useQuery<ScheduleItem[]>({
    queryKey: ["schedule"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-schedule");
      if (error) throw error;
      return data;
    },
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="cursor-pointer rounded-t-lg transition-colors hover:bg-gray-100">
        <CardTitle>Upcoming Schedule</CardTitle>
        <CardDescription>Your next 24 hours.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading schedule...</p>}
        {scheduleItems && scheduleItems.length > 0 ? (
          <ul className="space-y-4">
            {scheduleItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center"
                aria-label={`${item.title} from ${formatTime(
                  item.start_time
                )} to ${formatTime(item.end_time)}`}
              >
                <div className={`mr-4 h-2 w-2 rounded-full ${item.color}`} />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatTime(item.start_time)} -{" "}
                    {formatTime(item.end_time)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !isLoading && <p>Your schedule is clear for the next 24 hours.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingScheduleWidget; 