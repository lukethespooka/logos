import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockSchedule } from "./mocks";

const UpcomingScheduleWidget = () => {
  return (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Upcoming Schedule</CardTitle>
        <CardDescription>Your next 24 hours.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {mockSchedule.map((item) => (
            <li
              key={item.id}
              className="flex items-center"
              aria-label={`${item.title} from ${item.time}`}
            >
              <div className={`mr-4 h-2 w-2 rounded-full ${item.color}`} />
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default UpcomingScheduleWidget; 