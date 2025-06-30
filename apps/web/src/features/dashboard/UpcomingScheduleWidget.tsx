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
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  color: string;
  provider_data?: {
    provider: string;
    sync_token?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface UpcomingScheduleWidgetProps {
  className?: string;
}

export function UpcomingScheduleWidget({ className }: UpcomingScheduleWidgetProps) {
  const { session } = useAuth();

  const { data: scheduleData, isLoading, error } = useQuery({
    queryKey: ['schedule'],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error('No access token available');
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next 24 hours
            include_tasks: true,
            include_completed: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Schedule API error:', errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch schedule');
        }

        return data.data || [];
      } catch (error) {
        console.error('Error fetching schedule:', error);
        throw error;
      }
    },
    enabled: !!session?.access_token, // Only run query when we have an access token
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
    <FocusWrapper widgetId="upcoming-schedule" className={`col-span-2 ${className || ''}`}>
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

          <Fade show={!isLoading && scheduleData?.length === 0} duration="normal">
            <div className="text-center py-8 text-gray-500">
              Your schedule is clear for the next 24 hours.
            </div>
          </Fade>

          <Fade show={!isLoading && scheduleData && scheduleData.length > 0} duration="normal">
            <ul className="space-y-4">
              {scheduleData?.map((item: ScheduleItem) => (
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
                  <Badge className={item.color}>{item.provider_data?.provider || 'Schedule'}</Badge>
                </li>
              ))}
            </ul>
          </Fade>
        </CardContent>
      </Card>
    </FocusWrapper>
  );
}

export default UpcomingScheduleWidget; 