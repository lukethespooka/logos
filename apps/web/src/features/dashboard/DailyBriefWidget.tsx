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

const fetchBrief = async () => {
  const res = await fetch("/functions/v1/briefbot-hello");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const DailyBriefWidget = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["dailyBrief"],
    queryFn: fetchBrief,
  });

  return (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Daily Brief</CardTitle>
        <CardDescription>Your AI-powered morning snapshot.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-rose-500">Sorry, the brief couldn't be loaded. Please try again.</p>}
        {data && <p>{data.message}</p>}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => refetch()}
          aria-label="Regenerate daily brief"
        >
          Regenerate
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyBriefWidget; 