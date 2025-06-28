import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FocusWrapper } from "../../components/FocusWrapper";
import { Fade } from "@/components/ui/fade-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: string;
}

const UpcomingScheduleWidget = () => {
  const { signIn } = useAuth();

  const { data: scheduleItems, isLoading, error } = useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      try {
        const accessToken = await getAccessToken();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-schedule`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // Try to refresh the session
            await signIn();
            throw new Error("Please try again");
          }
          throw new Error("Failed to fetch schedule");
        }

        return response.json();
      } catch (error) {
        console.error("Error fetching schedule:", error);
        throw error;
      }
    },
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <FocusWrapper widgetId="upcoming-schedule" className="col-span-2">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Upcoming Schedule</CardTitle>
          <CardDescription>Your next 24 hours.</CardDescription>
        </CardHeader>
        <CardContent>
          <Fade show={isLoading} duration="normal">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="mr-4 h-2 w-2 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </Fade>

          <Fade show={!isLoading && scheduleItems?.length === 0} duration="normal">
            <div className="text-center py-8 text-gray-500">
              Your schedule is clear for the next 24 hours.
            </div>
          </Fade>

          <Fade show={!isLoading && scheduleItems && scheduleItems.length > 0} duration="normal">
            <ul className="space-y-4">
              {scheduleItems?.map((item: ScheduleItem) => (
                <li
                  key={item.id}
                  className="flex items-center space-x-4"
                  aria-label={`${item.title} from ${formatTime(
                    item.start_time
                  )} to ${formatTime(item.end_time)}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      {formatTime(item.start_time)} -{" "}
                      {formatTime(item.end_time)}
                    </div>
                  </div>
                  <Badge>{item.type}</Badge>
                </li>
              ))}
            </ul>
          </Fade>
        </CardContent>
      </Card>
    </FocusWrapper>
  );
};

export default UpcomingScheduleWidget; 