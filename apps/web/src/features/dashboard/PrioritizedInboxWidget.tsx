import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockInboxClusters } from "./mocks";
import { FocusWrapper } from "../../components/FocusWrapper";
import { Fade } from "@/components/ui/fade-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

export default function PrioritizedInboxWidget() {
  const [isLoading, setIsLoading] = useState(true);
  const [clusters] = useState(mockInboxClusters);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <FocusWrapper widgetId="prioritized-inbox" className="col-span-2">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Prioritized Inbox</CardTitle>
          <CardDescription>AI-powered triage for your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <Fade show={isLoading} duration="normal">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-8" />
                </div>
              ))}
            </div>
          </Fade>

          <Fade show={!isLoading} duration="normal">
            <ul className="space-y-4">
              {clusters.map((cluster) => (
                <li
                  key={cluster.id}
                  className="flex items-center justify-between"
                  aria-label={`${cluster.name}: ${cluster.unread} unread emails`}
                >
                  <span className="font-medium">{cluster.name}</span>
                  <Badge variant="secondary">{cluster.unread}</Badge>
                </li>
              ))}
            </ul>
          </Fade>
        </CardContent>
      </Card>
    </FocusWrapper>
  );
} 