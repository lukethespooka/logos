import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Urgency } from "./mocks";
import { supabase } from "@/lib/supabase";

// Define the shape of our task object from the backend
interface Task {
  id: string;
  title: string;
  completed_at: string | null;
  urgency: Urgency;
}

const SmartTaskOverviewWidget = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-tasks");
      if (error) throw error;
      return data;
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      isCompleted,
    }: {
      taskId: string;
      isCompleted: boolean;
    }) => {
      const { error } = await supabase.functions.invoke("update-task-status", {
        body: {
          task_id: taskId,
          completed_at: isCompleted ? new Date().toISOString() : null,
        },
      });
      if (error) throw error;
    },
    onMutate: async (variables) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((task) =>
          task.id === variables.taskId
            ? { ...task, completed_at: new Date().toISOString() }
            : task
        )
      );
      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const urgencyColors: Record<Urgency, string> = {
    High: "bg-red-500",
    Medium: "bg-yellow-500",
    Low: "bg-green-500",
  };

  const sortedTasks = tasks?.sort((a, b) => {
    const urgencyOrder = { High: 1, Medium: 2, Low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Smart Task Overview</CardTitle>
        <CardDescription>Your prioritized to-do list.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading tasks...</p>}
        <ul className="space-y-4">
          {sortedTasks?.map((task) => (
            <li key={task.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={!!task.completed_at}
                  onCheckedChange={(isChecked) =>
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      isCompleted: !!isChecked,
                    })
                  }
                  aria-label={task.title}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={`ml-3 ${
                    task.completed_at ? "text-gray-500 line-through" : ""
                  }`}
                >
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