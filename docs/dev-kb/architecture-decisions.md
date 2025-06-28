# Architecture Decisions

This document records the key architectural decisions made for the LogOS project. It serves as the source of truth for `@architect` and all other development agents to ensure consistency.

## Core Architecture
- **Decision (2025-01-01):** Adopted a serverless-first approach using Supabase Edge Functions.
- **Rationale:** Minimizes idle infrastructure costs, provides built-in Postgres, and offers excellent scalability for the MVP phase.
- **Alternatives Considered:** Monolithic Node.js/Fastify backend. Rejected for MVP due to higher operational overhead.

## Frontend State Management
- **Decision (2025-01-01):** Use TanStack Query for server state and Zustand for global UI state.
- **Rationale:** TanStack Query provides robust caching and data synchronization. Zustand is a minimal, boilerplate-free solution for global state.
- **Alternatives Considered:** Redux Toolkit. Rejected for being overly verbose for the initial feature set.

## RAG Implementation
- **Decision (2025-01-01):** Use a native Supabase approach with the `pgvector` extension.
- **Rationale:** Leverages existing infrastructure, avoids new dependencies, and is a proven, stable technology for the MVP.
- **Alternatives Considered:** `mcp-crawl4ai-rag`. Rejected due to unproven stability for a production environment.

## RAG (Retrieval-Augmented Generation)
- **Decision (2025-01-01):** Adopted a phased approach for RAG, starting with a simple, Supabase-native vector store using pgvector.
- **Rationale:** De-risks the MVP by avoiding bleeding-edge dependencies (`mcp-crawl4ai-rag`). The Supabase-native approach is battle-tested, uses our existing infrastructure, and can be implemented quickly.
- **Alternatives Considered:** `mcp-crawl4ai-rag`. Deferred to a later phase due to stability concerns.

## Future Architectural Enhancements

This section documents architectural concepts that are planned for future versions of LogOS. They are not to be implemented in the initial MVP but should be considered in all ongoing design work.

### V4.1: Task Hierarchy (Sub-tasks)
- **Concept:** Introduce a self-referencing `parent_task_id` on the `tasks` table to allow for nested sub-tasks.
- **Benefit:** Enables users to break down large, complex goals into smaller, manageable steps, which is a core requirement for our ADHD-friendly design principles.

### V4.2: Soft Deletes
- **Concept:** Add a `deleted_at` timestamp column to all major tables (`tasks`, `projects`, `tags`). Instead of destructively deleting rows, this timestamp will be set.
- **Benefit:** Creates a "trash can" functionality, allowing users to restore accidentally deleted items and preserving data integrity for analytics.

### V4.3: Task Activity & Audit Trail
- **Concept:** Create a `task_activity` table to log all significant events related to a task (e.g., creation, completion, comments, due date changes).
- **Benefit:** Provides a foundation for collaboration, version history, and the "AI Project Manager" pillar, enabling features that can summarize progress and identify blockers.

### V4.4: Performance at Scale
- **Concept:** Proactively add indexes to all foreign key columns and frequently queried columns. Implement Postgres's full-text search capabilities for text-heavy fields like `task.description`.
- **Benefit:** Ensures the application remains fast and responsive as the volume of data grows.

### V4.5: Customizable Dashboard Layout
- **Concept:** Integrate a library like `react-grid-layout` to allow users to drag, drop, and resize the dashboard widgets.
- **Benefit:** Provides a deeply personalized experience, allowing users to arrange their workspace to perfectly match their mental model and workflow, which is a significant win for user empowerment and ADHD-friendly design. 