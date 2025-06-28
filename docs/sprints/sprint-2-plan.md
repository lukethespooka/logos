# Sprint 2 Plan: The Interactive Dashboard

**Sprint Goal:** To transform the static MVP dashboard into a dynamic, interactive experience by connecting the UI to a live Supabase backend and implementing key UX enhancements for interactivity and guidance.

**Timeline:** Week 5 - Week 6

---

## User Stories

### Story 1 (Backend): As Alex, I need my tasks to be saved so I can access them anytime.

**Acceptance Criteria:**
- A `tasks` table exists in the Supabase database with columns for `id`, `title`, `completed`, and `urgency`.
- A Supabase Edge Function `get-tasks` is created to list all tasks.
- A Supabase Edge Function `update-task-status` is created to toggle the `completed` status of a task.

**Tasks:**
- **`@architect`**: Design the SQL schema for the `tasks` table.
- **`@dev`**: Create a new Supabase migration file for the `tasks` table.
- **`@dev`**: Implement the `get-tasks` and `update-task-status` Edge Functions.
- **`@qa`**: Test the Edge Functions to ensure they perform CRUD operations correctly.

### Story 2 (UX): As Alex, I want to manage my tasks directly from the dashboard to be more efficient.

**Acceptance Criteria:**
- The `SmartTaskOverviewWidget` fetches its data from the `get-tasks` endpoint.
- Tasks in the widget are automatically sorted by urgency ("High" first).
- Clicking a task's checkbox toggles its `completed` state.
- The UI updates instantly (optimistic update) while the backend request is in flight.
- Completed tasks are visually distinguished (e.g., strikethrough text).

**Tasks:**
- **`@dev`**: Refactor `SmartTaskOverviewWidget` to use `useQuery` to fetch live data.
- **`@dev`**: Implement client-side logic to sort tasks by urgency.
- **`@dev`**: Implement `useMutation` to call the `update-task-status` endpoint.
- **`@dev`**: Add optimistic updates to the mutation for a smooth UX.
- **`@qa`**: Review the full task management flow for functionality and visual feedback.

### Story 3 (Backend): As Alex, I need my schedule to be saved so I don't miss appointments.

**Acceptance Criteria:**
- A `schedule_items` table exists in the Supabase database.
- A Supabase Edge Function `get-schedule` is created to list all schedule items for the next 24 hours.

**Tasks:**
- **`@architect`**: Design the SQL schema for `schedule_items`.
- **`@dev`**: Create a Supabase migration for the `schedule_items` table.
- **`@dev`**: Implement the `get-schedule` Edge Function.
- **`@qa`**: Test the function to ensure it returns the correct data.

### Story 4 (UX): As Alex, I want to see my real schedule and know where to find more details.

**Acceptance Criteria:**
- The `UpcomingScheduleWidget` fetches its data from the `get-schedule` endpoint.
- The widget header is styled to look like a clickable link (e.g., hover effect).

**Tasks:**
- **`@dev`**: Refactor `UpcomingScheduleWidget` to use `useQuery`.
- **`@dev`**: Apply Tailwind CSS classes to the CardHeader to provide a visual cue for navigation.
- **`@qa`**: Review the widget to ensure it displays live data and the header has the correct interactive styling.

### Story 5 (UX): As Alex, I need proactive guidance on what to do next so I can stay focused.

**Acceptance Criteria:**
- A `ContextRibbon` component is created.
- The component is displayed directly below the main "Welcome, Alex" header in `App.tsx`.
- The ribbon contains placeholder buttons for "Plan My Day" and "Start Focus Timer".

**Tasks:**
- **`@dev`**: Create the `ContextRibbon.tsx` component with placeholder buttons.
- **`@dev`**: Add the new component to the main `App.tsx` layout.
- **`@qa`**: Review the placement and appearance of the Context Ribbon.

---

## Sprint Review Goals
- The dashboard is fully interactive, with all widgets pulling data from the live Supabase backend.
- Users can successfully check and uncheck tasks, with changes persisting.
- The UI provides clear visual cues for interactivity and navigation, fulfilling the UX enhancement goals.
- The foundation for the `Context Ribbon` is in place. 