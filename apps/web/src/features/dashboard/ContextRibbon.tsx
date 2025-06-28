import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

const ContextRibbon = () => {
  return (
    <div className="flex w-full max-w-7xl items-center justify-start gap-4 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Next Best Actions</h3>
      </div>
      <div className="h-8 border-l border-gray-200" />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Plan My Day
        </Button>
        <Button variant="outline" size="sm">
          Start Focus Timer
        </Button>
      </div>
    </div>
  );
};

export default ContextRibbon; 