---
story_id: FEAT-001
epic: MVP Dashboard
title: "Implement Daily Brief & AI Insights Widget"
state: "Ready for Dev"
owner: "@dev (James)"
reviewers:
  - "@po (Sarah)"
  - "@ux-expert (Evelyn)"
---

### User Story
As **Luke**, our primary user, I want to see a **Daily Brief & AI Insights** widget on my dashboard so that I can get a morning snapshot and prioritized focus recommendations at a glance.

### Narrative
This widget is the first thing Luke should see in the morning. It's the heart of the "one-glance clarity" principle. It needs to present a concise, AI-generated summary of the day ahead and offer clear, actionable suggestions. For the MVP, this will be powered by a simple backend function, but the front-end structure must be robust enough for future enhancements.

### Acceptance Criteria

#### Functional
1.  **[x] Data Display:** The widget must fetch and display a message from the `/functions/v1/briefbot-hello` endpoint.
2.  **[x] Loading State:** While fetching, the widget must display a "Loading…" or equivalent skeleton state.
3.  **[x] Error State:** If the API call fails, the widget must display a user-friendly error message (e.g., "Could not load brief.").
4.  **[x] Regenerate Button:** The widget must include a "Regenerate" button. For the MVP, clicking this button should re-fetch the data from the same endpoint.

#### UX & Design (from UX-Core-Prompt.md)
5.  **[x] Layout:** The widget must be implemented as a **Dashboard Card**.
    -   Max width: `360px`.
    -   It should fit within a 4-column desktop grid and a 1-column mobile grid.
6.  **[x] Typography:**
    -   Widget Title ("Daily Brief"): `text-lg` (or as specified by UX), Inter 700.
    -   Body Text: `text-base`, Inter 400, line-height 1.5.
7.  **[x] Styling:**
    -   The card must have a `rounded-2xl` border radius.
    -   It must have a subtle `shadow-md`.
    -   Whitespace must be generous, following the 8px multiple rule.
8.  **[x] Regenerate Button Styling:**
    -   The button must be a `shadcn/ui` Button component.
    -   It should use the `primary` color (Indigo 600) as a CTA.

#### Technical
9.  **[x] Component Structure:** The widget must be created as a new React component in `apps/web/src/features/dashboard/DailyBriefWidget.tsx`.
10. **[x] Data Fetching:** Use `TanStack Query` for the data fetching, caching, and state management (loading, error).
11. **[x] Code Quality:** The component file must not exceed 250 lines and must pass all ESLint checks.
12. **[x] Accessibility:** The "Regenerate" button must be keyboard-accessible (Tab) and have a descriptive `aria-label`.

### Definition of Done
-   All acceptance criteria are met and checked off.
-   Code is committed and pushed to a feature branch (`feat/FEAT-001-daily-brief`).
-   A Pull Request is opened, and all CI checks are passing.
-   The PR has been approved by the listed reviewers. 