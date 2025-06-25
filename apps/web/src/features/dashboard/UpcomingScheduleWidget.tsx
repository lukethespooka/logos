import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockEvents } from "./mocks";
import { AlertTriangle } from "lucide-react";

const UpcomingScheduleWidget = () => {
  return (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Upcoming Schedule</CardTitle>
        <CardDescription>Your day at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {mockEvents.map((event) => (
            <li key={event.id} className="flex items-center gap-4">
              <span className={`h-2 w-2 rounded-full ${event.color}`} />
              <div className="flex-grow">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-slate-500">{event.time}</p>
              </div>
              {event.isConflict && (
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              )}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Full Calendar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingScheduleWidget; 