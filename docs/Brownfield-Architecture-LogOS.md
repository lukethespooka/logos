# LogOS Brownfield Architecture Document

## Introduction
This document captures the CURRENT STATE of the LogOS codebase, based on the `LogOS-blueprint.md`. It is intended to serve as a reference for AI agents and developers working on the project.

### Document Scope
Comprehensive documentation of the entire system as described in the project blueprint.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| [Current Date] | 1.0 | Initial brownfield analysis from blueprint | Analyst |

## 1. Vision & Goals
- **Personal Productivity Co-Pilot:** Unify schedule, email, tasks, and knowledge into a single AI-powered workspace.
- **ADHD-friendly by design:** Short, focused interactions, minimal context-switching, and positive reinforcement.
- **Vibe-Coding Empowerment:** Make building extensions and automations feel playful and low-friction for non-engineers.

## 2. High Level Architecture

### Technical Summary
The architecture is a modern, serverless-first web application stack designed for rapid development and scalability. It leverages React for the frontend, Supabase for backend services, and a sophisticated, multi-layered AI system for its core functionality.

### Actual Tech Stack
| Category | Tech Choice | Rationale / Notes |
|----------|------------|-----------|
| **Frontend** | React + Vite + Tailwind + shadcn/ui + VitePWA | Rapid prototyping, offline support |
| **State Mgmt** | TanStack Query + Zustand | Cache syncing & minimal boilerplate |
| **Data Access** | Data-Permissions Matrix wrapper | Enforces private / workspace / org visibility |
| **Backend** | Supabase Edge Functions (Deno) | Serverless pricing, zero-idle cost, Postgres built-in |
| **AI Runtime** | LangChain + OpenAI Functions | Streamed execution, deterministic schemas |
| **Auth** | Supabase Auth (OAuth, magic link) | Quick setup, RBAC |
| **Real-time** | Supabase Realtime Channels | Push updates to dashboard |
| **RTC / Conferencing**| LiveKit Cloud (WebRTC) | Low-latency video & audio sessions |
| **Vector DB** | Supabase (pgvector) | Tight locality with application data |

### Repository Structure Reality Check
- **Type**: Monorepo (inferred from `apps/`, `packages/` structure).
- **Package Manager**: pnpm (from `pnpm-lock.yaml`).
- **File/folder pattern**: Each React feature in `/features/<name>/`, mirrored by Supabase functions in `/functions/<feature>/index.ts`.

### Core UI/UX Patterns
- **Design System & Principles:** All UI/UX development must adhere to the standards defined in the [**LogOS UX-Core-Prompt.md**](./UX-Core-Prompt.md).
- **⌘K Master Command Palette:** A Spotlight-style overlay for navigation, quick actions, and agent commands. This is the primary interaction model.
- **Context Ribbon:** A slim, auto-hiding bar that provides real-time "Next Best Actions" to the user, driven by AI suggestions.

## 3. AI & BMAD Integration

### AI-Across-All Overlay
A persistent, context-aware AI layer that sits above all modules to provide orchestration and personalization.
- **Implementation**: A central controller wrapping LangChain calls, exposed via a global `window.logOS.ask()` helper.
- **Core Layers**: User Context, Orchestration, Personalization, Agent Framework, GUI Bridge, Core OS Layers.

### BMAD (Breakthrough Method for Agile AI-Driven Development)
- **Purpose**: Provides modular Agents, Checklists, Templates, and Workflows to assist in development within the Cursor IDE.
- **Integration**: The `.bmad-core` directory contains these assets. The system uses a `dev-knowledge-graph` to ground agent outputs in repository facts.

### Proposed Runtime Micro-Agents
| Agent | Primary Job |
|-------|-------------|
| **BriefBot** | Compose Daily Brief & focus suggestions |
| **MailBot** | Cluster & triage inbox, draft replies |
| **TaskBot** | Extract tasks from emails/meetings, set deadlines |
| **FocusCoach**| Guide Pomodoro sessions, track streaks |
| **WorkspaceGenie**| Spin up new project spaces from templates |
| *(and many more listed in the blueprint)* | |

## 4. Data Models and APIs

### Data Models
- **Primary Store**: Supabase Postgres.
- **Key Tables**:
  - `documents_kg`: For the RAG knowledge graph, using `pgvector`.
  - `code_kg`: For the dev-knowledge graph, using `pgvector`.
  - `agent_activity`: Logs for agent prompts, decisions, and diffs.
  - `config_audit`: Audit trail for runtime parameter changes.
- **Data Reliability**: Point-in-time recovery + weekly encrypted S3 snapshots.

### API Specifications
- **Gateway**: A Model Control Protocol (MCP) Gateway is proposed for Phase 2 to centralize auth, rate limiting, and observability. For MVP, UI hits Supabase/LangChain functions directly.
- **AI Endpoints**: The `mcp-crawl4ai-rag` sidecar will expose endpoints like `smart_crawl_url`, `perform_rag_query`, etc.
- **Provider Connectors**: A unified layer is planned to connect to Google, Apple, and O365.

## 5. Technical Debt and Known Issues
*(This section is a placeholder to be filled as the project develops. The blueprint is a greenfield document, so no technical debt is listed yet.)*

- No critical technical debt identified from the blueprint.
- No workarounds or gotchas documented yet.

## 6. Code Quality & Conventions
- **Max Lines**: 250 lines per file, enforced by ESLint.
- **Pre-commit Hooks**: Husky and `lint-staged` run `eslint --max-warnings=0`.
- **CI Checks**: GitHub Workflow runs `pnpm run lint && pnpm test`.
- **Refactoring**: `@agent architect split-file` command is available for files over 200 lines.
- **File Structure**: Feature-based folders in `apps/web/src/features` and `supabase/functions`.

## 7. Observability and Monitoring
- **Logging**: Grafana Loki, accessible via `pnpm run dev:logs`.
- **Tracing**: Grafana Tempo.
- **Metrics**: PostHog for user analytics, Grafana for system health.
- **Cost Control**: A `token_budget.ts` middleware tracks all AI model costs, logs them, and auto-downgrades models if the daily cap (AU $5/day) is approached.
- **Alerting**: Grafana fires Slack/Discord/email webhooks on error spikes or budget breaches.

## 8. Development Roadmap Summary
The project is planned in four main phases to ensure iterative delivery of value.
| Phase | Duration | Key Deliverables |
|-------|----------|--------------|
| **1** | Week 2-4 | MVP Dashboard with core UI widgets and initial BriefBot integration. |
| **2** | Week 5-6 | Full agent mesh, integrating MailBot and TaskBot with real data sync. |
| **3** | Week 7-8 | Responsive mobile design, push notifications, and quality assurance. |
| **4** | Week 9   | Beta launch to an invite list, establishing a feedback loop. | 