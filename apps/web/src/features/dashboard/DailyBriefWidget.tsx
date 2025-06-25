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

const DailyBriefWidget = () => {
  const {
    data: brief,
    error,
    isLoading,
  } = useQuery({
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
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Daily Brief</CardTitle>
        <CardDescription>
          Your AI-powered summary for the day ahead.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Generating your brief...</p>}
        {error && <p className="text-red-500">{error.message}</p>}
        {brief && <p>{brief.message}</p>}
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
  );
};

export default DailyBriefWidget; 