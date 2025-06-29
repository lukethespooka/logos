import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Tag, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: {
    title: string;
    description: string;
    urgency: "High" | "Medium" | "Low";
    due_date?: string;
  }) => Promise<void>;
}

interface FormErrors {
  title?: string;
  description?: string;
  urgency?: string;
  due_date?: string;
}

export function TaskCreateDialog({ open, onOpenChange, onTaskCreate }: TaskCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"High" | "Medium" | "Low">("Medium");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  // Validate form whenever inputs change
  useEffect(() => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!urgency) {
      newErrors.urgency = "Urgency is required";
    }

    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        newErrors.due_date = "Invalid date format";
      } else if (dueDateObj < new Date()) {
        newErrors.due_date = "Due date cannot be in the past";
      }
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [title, description, urgency, dueDate]);

  // Handle escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onOpenChange]);

  const urgencyOptions: Array<{ value: "High" | "Medium" | "Low"; label: string; icon: string }> = [
    { value: "High", label: "High Priority", icon: "🔥" },
    { value: "Medium", label: "Medium Priority", icon: "⚡" },
    { value: "Low", label: "Low Priority", icon: "🌙" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onTaskCreate({
        title: title.trim(),
        description: description.trim(),
        urgency,
        due_date: dueDate || undefined
      });

      // Reset form
      setTitle("");
      setDescription("");
      setUrgency("Medium");
      setDueDate("");
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      toast({
        type: 'error',
        title: "Error creating task",
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsSubmitting(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new task. Set priority and due date to help organize your work.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className={cn(errors.title && "border-destructive")}
              autoFocus
              disabled={isSubmitting}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details... (optional)"
              className={cn(errors.description && "border-destructive")}
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {errors.description}
              </p>
            )}
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
                className={cn(errors.due_date && "border-destructive")}
                disabled={isSubmitting}
                aria-invalid={!!errors.due_date}
                aria-describedby={errors.due_date ? "due-date-error" : undefined}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDate(getTomorrowDate())}
                  className="text-xs"
                  disabled={isSubmitting}
                >
                  Tomorrow
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDate(getNextWeekDate())}
                  className="text-xs"
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {errors.due_date && (
              <p id="due-date-error" className="text-sm text-destructive">
                {errors.due_date}
              </p>
            )}
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
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 