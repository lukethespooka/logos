import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
}

interface SubtaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentTask: Task | null;
  onSubtaskCreate: (subtaskData: {
    title: string;
    description: string;
    parent_task_id: string;
  }) => Promise<void>;
}

interface FormErrors {
  title?: string;
  description?: string;
}

export function SubtaskCreateDialog({
  open,
  onOpenChange,
  parentTask,
  onSubtaskCreate
}: SubtaskCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parentTask || !validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubtaskCreate({
        title: title.trim(),
        description: description.trim(),
        parent_task_id: parentTask.id
      });

      // Reset form
      setTitle("");
      setDescription("");
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      toast({
        type: 'error',
        title: "Error creating subtask",
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subtask to "{parentTask?.title}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(errors.title && "border-destructive")}
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Subtask"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 