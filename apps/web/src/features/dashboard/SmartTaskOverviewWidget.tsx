import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { mockTasks, Urgency } from "./mocks";

const SmartTaskOverviewWidget = () => {
  const urgencyColors: Record<Urgency, string> = {
    High: "bg-red-500",
    Medium: "bg-yellow-500",
    Low: "bg-green-500",
  };

  return (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Smart Task Overview</CardTitle>
        <CardDescription>Your prioritized to-do list.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {mockTasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  aria-label={task.title}
                />
                <label htmlFor={`task-${task.id}`} className="ml-3">
                  {task.title}
                </label>
              </div>
              <Badge
                className={`${
                  urgencyColors[task.urgency]
                } text-white`}
              >
                {task.urgency}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SmartTaskOverviewWidget; 