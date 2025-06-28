import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { FocusWrapper } from "../../components/FocusWrapper";
import { Fade } from "@/components/ui/fade-transition";
import { Skeleton } from "@/components/ui/skeleton";

interface BriefData {
  message: string;
}

const DailyBriefWidget = () => {
  const {
    data: brief,
    error,
    isLoading,
  } = useQuery<BriefData, Error>({
    queryKey: ["dailyBrief"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "briefbot-hello",
        {
          body: { name: "Luke" },
        }
      );
      if (error) throw error;
      return data;
    },
  });

  return (
    <FocusWrapper widgetId="daily-brief">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Daily Brief</CardTitle>
          <CardDescription>
            Your AI-powered summary for the day ahead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Fade show={isLoading} duration="normal">
            <div className="space-y-3">
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
          </Fade>
          
          <Fade show={!!error} duration="normal">
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              {error?.message}
            </div>
          </Fade>
          
          <Fade 
            show={!isLoading && !error && !!brief} 
            duration="normal"
            className="prose prose-sm max-w-none"
          >
            {brief?.message}
          </Fade>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            aria-label="Refresh Daily Brief"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </CardFooter>
      </Card>
    </FocusWrapper>
  );
};

export default DailyBriefWidget; 