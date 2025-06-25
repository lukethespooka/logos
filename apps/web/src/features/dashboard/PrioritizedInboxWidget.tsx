import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockInboxClusters } from "./mocks";

const PrioritizedInboxWidget = () => {
  return (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Prioritized Inbox</CardTitle>
        <CardDescription>AI-powered triage for your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {mockInboxClusters.map((cluster) => (
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
      </CardContent>
    </Card>
  );
};

export default PrioritizedInboxWidget; 