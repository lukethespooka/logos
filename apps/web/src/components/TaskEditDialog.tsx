import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Tag, Edit3, Trash2, AlertTriangle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubtaskCreateDialog } from "@/components/SubtaskCreateDialog";

interface Task {
  id: string;
  title: string;
  description: string | null;
  urgency: "High" | "Medium" | "Low";
  completed_at: string | null;
  due_date?: string | null;
  sort_order?: number;
  parent_task_id?: string | null;
  level: number;
  subtasks?: Task[];
}

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskUpdate: (taskId: string, updates: {
    title: string;
    description: string;
    urgency: "High" | "Medium" | "Low";
    due_date?: string;
  }) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onSubtaskCreate?: (subtaskData: {
    title: string;
    description: string;
    parent_task_id: string;
  }) => Promise<void>;
}

export function TaskEditDialog({ 
  open, 
  onOpenChange, 
  task, 
  onTaskUpdate, 
  onTaskDelete,
  onSubtaskCreate 
}: TaskEditDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"High" | "Medium" | "Low">("Medium");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSubtaskDialog, setShowSubtaskDialog] = useState(false);

  const urgencyOptions: Array<{ value: "High" | "Medium" | "Low"; label: string; icon: string }> = [
    { value: "High", label: "High Priority", icon: "🔥" },
    { value: "Medium", label: "Medium Priority", icon: "⚡" },
    { value: "Low", label: "Low Priority", icon: "🌙" }
  ];

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setUrgency(task.urgency);
      setDueDate(task.due_date ? task.due_date.split('T')[0] : "");
      setShowDeleteConfirm(false);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title.trim() || !task) return;

    try {
      setIsSubmitting(true);
      
      await onTaskUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || "",
        urgency,
        due_date: dueDate || undefined
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    try {
      setIsDeleting(true);
      await onTaskDelete(task.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddSubtask = () => {
    if (task && task.level === 0) {
      setShowSubtaskDialog(true);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            Edit Task
          </DialogTitle>
          <DialogDescription>
            Update the task details below. You can modify the title, description, priority level, and due date.
          </DialogDescription>
        </DialogHeader>
        
        {!showDeleteConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Task Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="text-base"
                autoFocus
              />
            </div>

            {/* Task Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details... (optional)"
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Priority Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Priority Level
              </Label>
              <div className="flex gap-2">
                {urgencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setUrgency(option.value)}
                    className={cn(
                      "flex-1 p-3 rounded-lg border transition-all duration-200",
                      "hover:bg-muted/50 text-sm font-medium",
                      urgency === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background"
                    )}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div>{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Due Date (optional)
              </Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDueDate(getTomorrowDate())}
                    className="text-xs"
                  >
                    Tomorrow
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDueDate(getNextWeekDate())}
                    className="text-xs"
                  >
                    Next Week
                  </Button>
                  {dueDate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDueDate("")}
                      className="text-xs text-muted-foreground"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              {/* Add Subtask Button - only for parent tasks */}
              {task && task.level === 0 && onSubtaskCreate && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddSubtask}
                  className="px-3"
                  disabled={isSubmitting}
                  title="Add subtask"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3"
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          /* Delete Confirmation */
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <h4 className="font-medium text-destructive">Delete Task</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Are you sure you want to delete "{task.title}"? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? "Deleting..." : "Delete Task"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
      
      {/* Subtask Creation Dialog */}
      {task && (
        <SubtaskCreateDialog
          open={showSubtaskDialog}
          onOpenChange={setShowSubtaskDialog}
          parentTask={{ id: task.id, title: task.title }}
          onSubtaskCreate={async (subtaskData) => {
            if (onSubtaskCreate) {
              await onSubtaskCreate(subtaskData);
              setShowSubtaskDialog(false);
            }
          }}
        />
      )}
    </Dialog>
  );
} 