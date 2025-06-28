# Sprint 1 Plan: MVP Dashboard Foundation (Updated)

**Sprint Goal:** To build the core visual components of the LogOS dashboard, populate them with mock data, and establish the foundational UI structure. This sprint focuses on frontend development and prepares the ground for backend integration in the next sprint.

**Timeline:** Week 2 - Week 4

**Status Update:** Significant progress was already made ahead of this plan. Stories 1, 2, and 3 have been developed and are pending review.

---

## User Stories

### Story 1: As Alex, I want to see a Daily Brief widget so I can get a prioritized snapshot of my day.

**Acceptance Criteria:**
- A `DailyBriefWidget` component is created in `/apps/web/src/features/dashboard/`.
- The widget displays a title, a greeting, and a paragraph of AI-generated insights.
- The component is visually styled according to the shadcn/ui theme.

**Tasks:**
- **`@dev`**: Create `DailyBriefWidget.tsx` component. **(✅ COMPLETE)**
- **`@dev`**: Populate with mock data. **(✅ COMPLETE - Note: Exceeded goal, component fetches live data from Supabase Function `briefbot-hello`)**
- **`@qa`**: Review component for visual consistency and adherence to coding standards.

### Story 2: As Alex, I want a prioritized inbox widget so I can quickly see what needs my attention.

**Acceptance Criteria:**
- A `PrioritizedInboxWidget` component is created.
- The widget displays a list of email clusters (e.g., "High Priority", "Newsletters").
- Each cluster shows a count of unread emails using a `Badge` component.
- The widget uses the `mockInboxClusters` data from `mocks.ts`.

**Tasks:**
- **`@dev`**: Create `PrioritizedInboxWidget.tsx` component. **(✅ COMPLETE)**
- **`@dev`**: Populate component with mock data from `mocks.ts`. **(✅ COMPLETE)**
- **`@qa`**: Review component styling and data mapping.

### Story 3: As Alex, I want an upcoming schedule widget so I can see my appointments at a glance.

**Acceptance Criteria:**
- An `UpcomingScheduleWidget` component is created.
- The widget displays a list of upcoming calendar events.
- Each event shows a title, time, and a color-coded indicator.
- The widget uses the `mockSchedule` data from `mocks.ts`.

**Tasks:**
- **`@dev`**: Create `UpcomingScheduleWidget.tsx` component. **(✅ COMPLETE)**
- **`@dev`**: Populate component with mock data from `mocks.ts`. **(✅ COMPLETE)**
- **`@qa`**: Review component styling and data mapping.

### Story 4: As Alex, I want a smart task overview widget so I can see my most important to-dos.

**Acceptance Criteria:**
- A `SmartTaskOverviewWidget` component is created.
- The widget displays a list of tasks.
- Each task has a checkbox, a description, and an urgency label (e.g., "High", "Medium").

**Tasks:**
- **`@architect`**: Design the data model for tasks in `mocks.ts`. **(✅ COMPLETE)**
- **`@dev`**: Create `SmartTaskOverviewWidget.tsx` component. **(✅ COMPLETE)**
- **`@dev`**: Populate the component with mock data based on the architect's design. **(✅ COMPLETE)**
- **`@qa`**: Review the new component.

### Story 5: As a developer, I want to assemble the dashboard so all widgets are visible on the main page.

**Acceptance Criteria:**
- The `App.tsx` file is updated to import and render the dashboard widgets.
- The widgets are arranged in a responsive grid layout.
- The main page has a clear title, "Welcome, Alex".

**Tasks:**
- **`@dev`**: Update `App.tsx` to create a dashboard layout. **(✅ COMPLETE)**
- **`@dev`**: Add `DailyBriefWidget`, `PrioritizedInboxWidget`, and `UpcomingScheduleWidget` to the layout. **(✅ COMPLETE)**
- **`@qa`**: Review the overall dashboard page for layout and responsiveness.

---

## Sprint Review Goals
- All five user stories are complete and meet acceptance criteria.
- The dashboard displays the three core widgets with mock data.
- The codebase is clean, follows the defined standards, and is ready for the next sprint where we will integrate real data and the `BriefBot` agent. 