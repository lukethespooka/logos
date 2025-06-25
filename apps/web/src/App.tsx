import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function App() {
  const [message, setMessage] = useState("Loading…");

  useEffect(() => {
    fetch("/functions/v1/briefbot-hello")
      .then((r) => r.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Failed to reach API"));
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-blue-600">{message}</h1>
      <Button variant="outline">System Health: OK</Button>
    </div>
  );
} 