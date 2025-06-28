import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useRef, useEffect, useImperativeHandle, useMemo, useCallback } from "react";
import { soundManager } from "@/lib/sounds";
import { createConfettiEffect, createSparkleEffect, addGlowEffect, animations } from "@/lib/animations";
import { GripVertical, Sparkles, Plus, Calendar, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCreateDialog } from "@/components/TaskCreateDialog";
import { TaskEditDialog } from "@/components/TaskEditDialog";
import { TaskSearchFilter, TaskFilters } from "@/components/TaskSearchFilter";
import { PlusButton } from "@/components/ui/plus-button";

interface Task {
  id: string;
  title: string;
  description: string | null;
  urgency: "High" | "Medium" | "Low";
  completed_at: string | null;
  due_date?: string | null;
  sort_order?: number;
}

export const SmartTaskOverviewWidget = React.forwardRef<{ openCreateDialog: () => void }>((props, ref) => {
  const { signIn } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    urgency: [],
    status: [],
    overdue: false
  });
  
  // Refs for celebration effects
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Simple ref setter to prevent infinite re-renders
  const setTaskRef = (taskId: string) => {
    return (el: HTMLDivElement | null) => {
      taskRefs.current[taskId] = el;
    };
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openCreateDialog: () => setIsCreateDialogOpen(true)
  }));

  const { data: tasksData, isLoading: isTasksLoading, error, refetch } = useQuery<Task[], Error>({
    queryKey: ["tasks"],
    queryFn: async (): Promise<Task[]> => {
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          const accessToken = await getAccessToken();
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-tasks`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401 && retryCount < maxRetries) {
              await signIn();
              retryCount++;
              continue;
            }
            throw new Error(errorData.error || "Failed to fetch tasks");
          }

          const data = await response.json();
          return data;
        } catch (error) {
          if (error instanceof Error && error.message.includes('Auth session missing') && retryCount < maxRetries) {
            await signIn();
            retryCount++;
            continue;
          }
          throw error;
        }
      }
      throw new Error("Max retries exceeded");
    },
  });

  // Update tasks state when data changes
  useEffect(() => {
    if (tasksData) {
      setTasks(tasksData);
    }
  }, [tasksData]);

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter(task => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) return false;
      }

      // Urgency filter
      if (filters.urgency.length > 0) {
        if (!filters.urgency.includes(task.urgency)) return false;
      }

      // Status filter
      if (filters.status.length > 0) {
        const isCompleted = !!task.completed_at;
        const statusMatch = filters.status.some(status => 
          (status === "completed" && isCompleted) || 
          (status === "active" && !isCompleted)
        );
        if (!statusMatch) return false;
      }

      // Overdue filter
      if (filters.overdue) {
        const isOverdue = task.due_date && 
          !task.completed_at && 
          new Date(task.due_date) < new Date();
        if (!isOverdue) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Calculate task counts for filter UI
  const taskCounts = useMemo(() => {
    if (!tasks) return undefined;

    const completed = tasks.filter(t => !!t.completed_at).length;
    const overdue = tasks.filter(t => 
      t.due_date && !t.completed_at && new Date(t.due_date) < new Date()
    ).length;

    return {
      total: tasks.length,
      completed,
      high: tasks.filter(t => t.urgency === "High").length,
      medium: tasks.filter(t => t.urgency === "Medium").length,
      low: tasks.filter(t => t.urgency === "Low").length,
      overdue
    };
  }, [tasks]);

  const handleTaskCreate = async (taskData: {
    title: string;
    description: string;
    urgency: "High" | "Medium" | "Low";
    due_date?: string;
  }) => {
    try {
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          const accessToken = await getAccessToken();
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-task`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(taskData),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401 && retryCount < maxRetries) {
              await signIn();
              retryCount++;
              continue;
            }
            throw new Error(errorData.error || "Failed to create task");
          }

          // Play success sound and show toast
          soundManager.play('success');
          (window as any).showToast?.({
            type: 'success',
            title: '✨ Task created!',
            description: `"${taskData.title}" has been added to your list.`,
            duration: 2500
          });

          // Refresh the task list
          await refetch();
          break;
        } catch (error) {
          if (error instanceof Error && error.message.includes('Auth session missing') && retryCount < maxRetries) {
            await signIn();
            retryCount++;
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
      soundManager.play('error');
      (window as any).showToast?.({
        type: 'error',
        title: 'Failed to create task',
        description: 'Please try again in a moment.',
        duration: 3000
      });
      throw error;
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: {
    title: string;
    description: string;
    urgency: "High" | "Medium" | "Low";
    due_date?: string;
  }) => {
    try {
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          const accessToken = await getAccessToken();
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-task`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ task_id: taskId, ...updates }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401 && retryCount < maxRetries) {
              await signIn();
              retryCount++;
              continue;
            }
            throw new Error(errorData.error || "Failed to update task");
          }

          // Play success sound and show toast
          soundManager.play('success');
          (window as any).showToast?.({
            type: 'success',
            title: '📝 Task updated!',
            description: `"${updates.title}" has been updated.`,
            duration: 2000
          });

          // Refresh the task list
          await refetch();
          break;
        } catch (error) {
          if (error instanceof Error && error.message.includes('Auth session missing') && retryCount < maxRetries) {
            await signIn();
            retryCount++;
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      soundManager.play('error');
      (window as any).showToast?.({
        type: 'error',
        title: 'Failed to update task',
        description: 'Please try again in a moment.',
        duration: 3000
      });
      throw error;
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          const accessToken = await getAccessToken();
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-task`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ task_id: taskId }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401 && retryCount < maxRetries) {
              await signIn();
              retryCount++;
              continue;
            }
            throw new Error(errorData.error || "Failed to delete task");
          }

          // Play success sound and show toast
          soundManager.play('success');
          (window as any).showToast?.({
            type: 'success',
            title: '🗑️ Task deleted!',
            description: 'Task has been permanently removed.',
            duration: 2000
          });

          // Refresh the task list
          await refetch();
          break;
        } catch (error) {
          if (error instanceof Error && error.message.includes('Auth session missing') && retryCount < maxRetries) {
            await signIn();
            retryCount++;
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      soundManager.play('error');
      (window as any).showToast?.({
        type: 'error',
        title: 'Failed to delete task',
        description: 'Please try again in a moment.',
        duration: 3000
      });
      throw error;
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    // Prevent multiple simultaneous updates to the same task
    if (isUpdating === taskId) return;
    
    try {
      setIsUpdating(taskId);
      
      // Add visual celebration effects for completion
      if (completed) {
        setCompletingTasks(prev => new Set([...prev, taskId]));
        
        // Get the task element for effects
        const taskElement = taskRefs.current[taskId];
        if (taskElement) {
          // Add celebration animation to the task
          taskElement.classList.add(animations.taskCompletion.celebrate);
          
          // Add glow effect
          addGlowEffect(taskElement, 1200);
          
          // Create confetti effect
          setTimeout(() => {
            createConfettiEffect(taskElement);
          }, 200);
          
          // Create sparkle effects
          const rect = taskElement.getBoundingClientRect();
          setTimeout(() => {
            createSparkleEffect(rect.left + rect.width * 0.3, rect.top + rect.height / 2);
          }, 400);
          setTimeout(() => {
            createSparkleEffect(rect.right - rect.width * 0.3, rect.top + rect.height / 2);
          }, 600);
        }
      }
      
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          const accessToken = await getAccessToken();
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-task-status`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                task_id: taskId,
                completed_at: completed ? new Date().toISOString() : null,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401 && retryCount < maxRetries) {
              await signIn();
              retryCount++;
              continue;
            }
            throw new Error(errorData.error || "Failed to update task");
          }

          // Play appropriate sound based on task completion status
          if (completed) {
            soundManager.play('taskComplete');
            // Enhanced success toast with celebration
            (window as any).showToast?.({
              type: 'success',
              title: '🎉 Task completed!',
              description: 'Amazing work! You\'re crushing it today.',
              duration: 3000
            });
          } else {
            soundManager.play('taskIncomplete');
            // Show info toast
            (window as any).showToast?.({
              type: 'info',
              title: 'Task reopened',
              description: 'Task moved back to your active list.',
              duration: 2000
            });
          }

          // Success - refetch tasks and exit the loop
          await refetch();
          break;
        } catch (error) {
          if (error instanceof Error && error.message.includes('Auth session missing') && retryCount < maxRetries) {
            await signIn();
            retryCount++;
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      soundManager.play('error');
      // Show error toast
      (window as any).showToast?.({
        type: 'error',
        title: 'Failed to update task',
        description: 'Please try again in a moment.',
        duration: 3000
      });
      throw error;
    } finally {
      setIsUpdating(null);
      // Remove completing state after animation
      setTimeout(() => {
        setCompletingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
        
        // Clean up animation classes
        const taskElement = taskRefs.current[taskId];
        if (taskElement) {
          taskElement.classList.remove(animations.taskCompletion.celebrate);
        }
      }, 600);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (draggedTask) {
      const draggedIndex = filteredTasks.findIndex(task => task.id === draggedTask);
      // Adjust the drop index if dragging from above
      const adjustedIndex = draggedIndex < index ? index - 1 : index;
      setDragOverIndex(adjustedIndex);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData("text/plain");
    
    if (!draggedTaskId) return;

    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const draggedIndex = newTasks.findIndex(task => task.id === draggedTaskId);
      
      if (draggedIndex === -1) return prevTasks;
      
      // Remove the dragged task
      const [draggedTask] = newTasks.splice(draggedIndex, 1);
      
      // Calculate the correct insertion index
      let insertIndex = dropIndex;
      if (draggedIndex < dropIndex) {
        insertIndex = dropIndex - 1;
      }
      
      // Insert at the new position
      newTasks.splice(insertIndex, 0, draggedTask);
      
      return newTasks;
    });

    setDraggedTask(null);
    setDragOverIndex(null);
    
    // Play reorder sound feedback
    soundManager.play('reorder');
    
    // Show reorder success toast
    (window as any).showToast?.({
      type: 'success',
      title: 'Tasks reordered',
      description: 'Your task priority has been updated.',
      duration: 1500
    });
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (isTasksLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="h-4 w-4 bg-muted rounded-sm mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-5 w-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-muted-foreground mb-2">
              Unable to load tasks
            </div>
            <div className="text-sm text-muted-foreground">
              {error.message}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              Tasks Overview
              <Sparkles className="h-4 w-4 text-primary opacity-60" />
              {filteredTasks.length !== tasks?.length && (
                <Badge variant="secondary" className="text-xs">
                  {filteredTasks.length} of {tasks?.length}
                </Badge>
              )}
            </span>
            <div className="flex items-center gap-2">
              {tasks && tasks.length > 1 && (
                <span className="text-xs text-muted-foreground font-normal hidden sm:block">
                  Drag to reorder
                </span>
              )}
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Task
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          {tasks && tasks.length > 0 && (
            <TaskSearchFilter
              filters={filters}
              onFiltersChange={setFilters}
              taskCounts={taskCounts}
            />
          )}

          {!tasks || tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-3">
                No tasks yet
              </div>
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Create your first task
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-3">
                No tasks match your filters
              </div>
              <button
                onClick={() => setFilters({ search: "", urgency: [], status: [], overdue: false })}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task: Task, index: number) => {
                const isCompleted = !!task.completed_at;
                const isCompleting = completingTasks.has(task.id);
                const isBeingUpdated = isUpdating === task.id;
                const hasDueDate = task.due_date && !isCompleted;
                const taskIsOverdue = hasDueDate && isOverdue(task.due_date!);
                
                return (
                  <div key={task.id}>
                    {/* Drop zone above each item */}
                    {draggedTask && draggedTask !== task.id && (
                      <div
                        className={`h-2 transition-all duration-200 ${
                          dragOverIndex === index ? 'bg-primary/20 border-2 border-primary border-dashed rounded' : ''
                        }`}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                      />
                    )}
                    
                    {/* Task item */}
                    <div 
                      ref={setTaskRef(task.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg transition-all duration-300 relative overflow-hidden group",
                        draggedTask === task.id ? 'opacity-50 scale-95' : 'hover:bg-muted/50',
                        isCompleted && 'bg-green-50/50 dark:bg-green-900/10',
                        isCompleting && 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20',
                        isBeingUpdated && animations.pulse.success,
                        taskIsOverdue && 'bg-red-50/30 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30'
                      )}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Celebration sparkle overlay */}
                      {isCompleting && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-2 left-8 text-yellow-400 animate-sparkle">✨</div>
                          <div className="absolute top-3 right-8 text-blue-400 animate-sparkle delay-200">⭐</div>
                          <div className="absolute bottom-2 left-12 text-green-400 animate-sparkle delay-400">💫</div>
                        </div>
                      )}
                      
                      <div className="flex items-center h-6 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </div>
                      
                      <div className={cn(
                        "flex items-center h-6 transition-transform duration-200", 
                        isCompleting && animations.taskCompletion.bounce
                      )}>
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={(checked) =>
                            handleTaskComplete(task.id, checked as boolean).catch((error) => {
                              console.error("Failed to update task:", error);
                            })
                          }
                          disabled={isBeingUpdated}
                          className={cn(
                            "transition-all duration-200",
                            isCompleting && "animate-pulse-success"
                          )}
                        />
                      </div>
                      
                      <div 
                        className="flex-1 min-w-0 relative cursor-pointer"
                        onClick={() => handleTaskEdit(task)}
                      >
                        <div className={cn(
                          "font-medium leading-6 relative transition-all duration-300",
                          isCompleted && "text-muted-foreground"
                        )}>
                          {task.title}
                          {/* Animated strikethrough effect */}
                          {isCompleted && (
                            <div className={cn(
                              "absolute top-1/2 left-0 h-0.5 bg-green-500 transition-all duration-400",
                              isCompleting ? "w-full" : "w-full"
                            )} />
                          )}
                        </div>
                        {task.description && (
                          <div className={cn(
                            "text-sm text-muted-foreground mt-1 transition-opacity duration-300",
                            isCompleted && "opacity-60"
                          )}>
                            {task.description}
                          </div>
                        )}
                        {/* Due Date */}
                        {hasDueDate && (
                          <div className={cn(
                            "flex items-center gap-1 mt-2 text-xs",
                            taskIsOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                          )}>
                            <Calendar className="h-3 w-3" />
                            <span className={taskIsOverdue ? "font-medium" : ""}>
                              Due {formatDueDate(task.due_date!)}
                              {taskIsOverdue && " (Overdue)"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Edit button - shown on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskEdit(task);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-muted"
                        title="Edit task"
                      >
                        <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      
                      <div className="flex items-center h-6">
                        <Badge
                          variant={
                            task.urgency === "High"
                              ? "destructive"
                              : task.urgency === "Medium"
                              ? "default"
                              : "secondary"
                          }
                          className={cn(
                            "transition-all duration-200",
                            isCompleted && "opacity-50 scale-90",
                            isCompleting && animations.taskCompletion.bounce
                          )}
                        >
                          {task.urgency}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Drop zone below the last item */}
                    {index === filteredTasks.length - 1 && draggedTask && draggedTask !== task.id && (
                      <div
                        className={`h-2 mt-2 transition-all duration-200 ${
                          dragOverIndex === filteredTasks.length ? 'bg-primary/20 border-2 border-primary border-dashed rounded' : ''
                        }`}
                        onDragOver={(e) => handleDragOver(e, filteredTasks.length)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, filteredTasks.length)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Add Button - only show when there are tasks */}
      {tasks && tasks.length > 0 && (
        <PlusButton onClick={() => setIsCreateDialogOpen(true)} />
      )}

      {/* Task Creation Dialog */}
      <TaskCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreate={handleTaskCreate}
      />

      {/* Task Edit Dialog */}
      <TaskEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={editingTask}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
      />
    </>
  );
}); 