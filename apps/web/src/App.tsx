import PrioritizedInboxWidget from "./features/dashboard/PrioritizedInboxWidget";

export default function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <div className="grid grid-cols-1 gap-6">
        <PrioritizedInboxWidget />
      </div>
    </div>
  );
} 