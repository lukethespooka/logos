export const mockSchedule = [
  {
    id: 1,
    title: "Project Standup",
    time: "9:00 AM - 9:30 AM",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Design Review",
    time: "11:00 AM - 12:00 PM",
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "Doctor's Appointment",
    time: "4:00 PM - 4:30 PM",
    color: "bg-indigo-500",
  },
];

export const mockInboxClusters = [
  { id: 1, name: "High Priority", unread: 3 },
  { id: 2, name: "Newsletters", unread: 12 },
  { id: 3, name: "Marketing", unread: 8 },
];

export type Urgency = "High" | "Medium" | "Low";

export const mockTasks: {
  id: number;
  title: string;
  completed: boolean;
  urgency: Urgency;
}[] = [
  { id: 1, title: "Draft proposal for Q3 budget", completed: false, urgency: "High" },
  { id: 2, title: "Follow up with the design team", completed: false, urgency: "Medium" },
  { id: 3, title: "Book flight for conference", completed: true, urgency: "Low" },
  { id: 4, title: "Review latest user feedback", completed: false, urgency: "High" },
]; 