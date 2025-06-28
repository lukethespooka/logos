import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface SubtaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentTask: {
    id: string;
    title: string;
  } | null;
  onSubtaskCreate: (subtaskData: {
    title: string;
    description: string;
    parent_task_id: string;
  }) => Promise<void>;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title.trim() || !parentTask) return;

    try {
      setIsSubmitting(true);
      
      await onSubtaskCreate({
        title: title.trim(),
        description: description.trim() || "",
        parent_task_id: parentTask.id
      });

      // Reset form
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create subtask:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Subtask
          </DialogTitle>
          <DialogDescription>
            Create a subtask under "{parentTask?.title}". Subtasks inherit the parent's priority level.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subtask Title */}
          <div className="space-y-2">
            <Label htmlFor="subtask-title">Subtask Title *</Label>
            <Input
              id="subtask-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="text-base"
              autoFocus
            />
          </div>

          {/* Subtask Description */}
          <div className="space-y-2">
            <Label htmlFor="subtask-description">Description</Label>
            <Textarea
              id="subtask-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details... (optional)"
              className="min-h-[60px] resize-none"
            />
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
              disabled={!title.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Subtask"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 