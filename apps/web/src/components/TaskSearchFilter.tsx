import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, CheckCircle, Circle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskFilters {
  search: string;
  urgency: ("High" | "Medium" | "Low")[];
  status: ("active" | "completed")[];
  overdue: boolean;
}

interface TaskSearchFilterProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  taskCounts?: {
    total: number;
    completed: number;
    high: number;
    medium: number;
    low: number;
    overdue: number;
  };
}

export function TaskSearchFilter({ filters, onFiltersChange, taskCounts }: TaskSearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (updates: Partial<TaskFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleUrgency = (urgency: "High" | "Medium" | "Low") => {
    const newUrgency = filters.urgency.includes(urgency)
      ? filters.urgency.filter(u => u !== urgency)
      : [...filters.urgency, urgency];
    updateFilters({ urgency: newUrgency });
  };

  const toggleStatus = (status: "active" | "completed") => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatus });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      urgency: [],
      status: [],
      overdue: false
    });
    setShowFilters(false);
  };

  const hasActiveFilters = filters.search || 
    filters.urgency.length > 0 || 
    filters.status.length > 0 || 
    filters.overdue;

  const urgencyOptions = [
    { value: "High" as const, label: "High Priority", color: "destructive", icon: "🔥", count: taskCounts?.high },
    { value: "Medium" as const, label: "Medium Priority", color: "default", icon: "⚡", count: taskCounts?.medium },
    { value: "Low" as const, label: "Low Priority", color: "secondary", icon: "🌙", count: taskCounts?.low }
  ];

  const statusOptions = [
    { value: "active" as const, label: "Active", icon: Circle, count: taskCounts ? taskCounts.total - taskCounts.completed : undefined },
    { value: "completed" as const, label: "Completed", icon: CheckCircle, count: taskCounts?.completed }
  ];

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-9 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-7 px-2 text-xs",
              (showFilters || hasActiveFilters) && "bg-primary/10 text-primary"
            )}
          >
            <Filter className="h-3 w-3 mr-1" />
            Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {[
                  filters.search && "text",
                  filters.urgency.length && "priority",
                  filters.status.length && "status", 
                  filters.overdue && "overdue"
                ].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          {/* Priority Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex flex-wrap gap-2">
              {urgencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleUrgency(option.value)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                    "border hover:bg-muted/50",
                    filters.urgency.includes(option.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background"
                  )}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
                      {option.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleStatus(option.value)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                      "border hover:bg-muted/50",
                      filters.status.includes(option.value)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
                        {option.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Special</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilters({ overdue: !filters.overdue })}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                  "border hover:bg-muted/50",
                  filters.overdue
                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : "border-border bg-background"
                )}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Overdue</span>
                {taskCounts?.overdue !== undefined && (
                  <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
                    {taskCounts.overdue}
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {taskCounts && (
                <>Showing filtered results from {taskCounts.total} total tasks</>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className="h-7 px-3 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="h-7 px-3 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Summary */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              "{filters.search}"
              <button
                onClick={() => updateFilters({ search: "" })}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          {filters.urgency.map(urgency => (
            <Badge key={urgency} variant="secondary" className="text-xs">
              {urgency} Priority
              <button
                onClick={() => toggleUrgency(urgency)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="text-xs">
              {status === "active" ? "Active" : "Completed"}
              <button
                onClick={() => toggleStatus(status)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
          {filters.overdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
              <button
                onClick={() => updateFilters({ overdue: false })}
                className="ml-1 hover:bg-red-700 rounded-full"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 