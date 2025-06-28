# LogOS Project Blueprint

## 1   Vision & Goals
- **Personal Productivity Co‑Pilot** – unify schedule, email, calendar, tasks, and knowledge into a single AI‑powered workspace.
- **ADHD‑friendly by design** – short, focused interactions, minimal context‑switching, and positive reinforcement.
- **Vibe‑Coding Empowerment** – make building extensions and automations feel playful and low‑friction for non‑engineers.

---

## 2   Primary User Persona
| Trait | Description |
|-------|-------------|
| Name  | **Alex** (our reference persona) |
| Age   | 35+ |
| Background | A busy freelance consultant juggling multiple clients, projects, and deadlines. Tech-savvy but not a programmer. |
| Pain Points | Constant context-switching, information overload from various sources (email, Slack, notes), difficulty tracking project progress, and finding relevant information quickly. |
| Goals | A unified dashboard that provides a clear "at-a-glance" view of the day, proactive alerts for risks and deadlines, and a seamless way to capture and organize information without friction. |

---

## 3   Feature Catalog
### 3.1  Dashboard Widgets *(wireframe reference)*
| Widget | Purpose | Notes |
|--------|---------|-------|
| **Daily Brief & AI Insights** | Morning snapshot + prioritized focus recommendations | Regenerate button for fresh advice |
| **Upcoming Schedule** | Aggregated calendar view with conflict detection | Link to full Calendar |
| **Prioritized Inbox** | AI‑clustered emails (High Priority, Marketing, etc.) | Swipe / triage actions |
| **Smart Task Overview** | Auto‑generated & manual tasks with urgency labels | Quick‑complete & snooze |
| **Recent Workspaces & Forms** | Jump‑back to active collaboration spaces | Status tags (Draft, Active, Completed) |
| **Daily Activity Trends** | Simple line chart of productivity metrics | Toggle between day / week / month |
| **System Health Bar** | Live status of errors & token spend (green/yellow/red) | Links to Logs dashboard |

### 3.2  Navigation & Orientation *(sidebar‑less)*
- **⌘K (Command+K) Master Command Palette / Search** – Spotlight‑style overlay (keyboard shortcut, top‑right button, or voice alias) for fuzzy navigation, quick actions, and agent commands. Recent items and agent‑suggested queries bubble to the top.
- **Context Ribbon** – A slim, auto‑hiding bar beneath the header that surfaces *Next Best Actions* in real time (e.g., "Review Inbox", "Plan My Day", "Start Focus Timer"). It learns from user successes/failures so suggestions improve over time.

> **Core Modules (called via Palette):** Calendar, Mail, Tasks, Maps, VoIP, Notes, Contacts, Workspaces, Templates, Settings

### 3.3  Cross‑Cutting Capabilities
- 🔍 **Global Search**
- 🛎️ **Notification Center**
- 💡 **Contextual AI Suggestions**
- ➕ **Universal Quick‑Add Modal**
- 🔄 **Real‑time Sync (desktop & mobile)**
- ⌘K **Universal Command Palette / Search**
- 🎯 **Context Ribbon (next best actions)**

### 3.4  Telephony & VoIP UI *(LiveKit + Twilio)*
| Component | Purpose | Notes |
|-----------|---------|-------|
| **Softphone Dialer** | Make outbound PSTN/WebRTC calls from any page | Pops as right‑side drawer (⌘⇧P shortcut or `call:` command). |
| **Incoming Call Overlay** | Slide‑in banner with answer/decline + quick actions ("Send to Voicemail", "Schedule Callback") | Uses LiveKit `Room` events; fallback Twilio widget on PSTN. |
| **Call HUD** | Floating window during call: timer, mute, hold, transfer, record toggle, network quality bar | Whisper transcription live captions; AI auto‑labels action items. |
| **Voicemail & Call Log** | List of past calls with Whisper‑generated summaries, sentiment tag, and "Create Task" button | Searchable via Global Search; unread badge in Context Ribbon. |
| **Settings → Telephony** | Default provider Twilio; ringtone, voicemail greeting, recording consent toggle | Lives in the Monitoring & Parameter Mgmt dashboard. |

> *Voice commands:* say "Hey LogOS, call Alex" to open the dialer pre‑filled.

---

## 4   Development Strategy & Runtime Architecture

### 4.1  BMAD-METHOD Integration (Development Strategy)
BMAD (Breakthrough Method for Agile AI-Driven Development) is our **development methodology** - providing specialized agents, templates, and workflows that help us *build* LogOS inside Cursor IDE.

**Development-Time BMAD Agents:**
- `@architect` - Designs system architecture and technical decisions
- `@pm` - Creates PRDs and manages product requirements
- `@analyst` - Conducts market and user research
- `@sm` - Manages agile processes and breaks down work into stories
- `@po` - Owns the product backlog and ensures features deliver value
- `@ux-expert` - Designs user flows and ensures a high-quality user experience
- `@dev` - Implements features and writes code
- `@qa` - Reviews code quality and tests functionality

**BMAD Integration Steps:**
1.  **Phase 1: Planning & Discovery:** Use `@analyst` to research the market, `@pm` to generate the `prd.md`, and `@architect` to create the `architecture.md`. Store these in `/docs`.
2.  **Phase 2: Knowledge Grounding:** Distill key decisions, patterns, and standards from the planning phase into the `/docs/dev-kb/` folder. This becomes the source of truth for all development agents.
3.  **Phase 3: Development Sprints:** Use `@sm` to break down the PRD into user stories. The `@dev` agent implements stories, continuously referencing the Dev KB for guidance. `@qa` reviews all code against the `coding-standards.md`.
4.  **Continuous Improvement:** The process is iterative. As new features are built, the Dev KB is updated, ensuring all agents operate from the most current project context.

### 4.2  LogOS Runtime Agent Architecture (What Users Experience)
These are the AI agents that **run inside LogOS** to help end-users with productivity:

| Runtime Agent | User-Facing Purpose | Implementation |
|---------------|-------------------|----------------|
| **BriefBot** | Generate daily briefs & focus suggestions | Supabase Edge Function + OpenAI |
| **MailBot** | Smart email clustering & reply drafting | Gmail/Outlook API + LangChain |
| **TaskBot** | Extract & manage tasks from various sources | Custom logic + vector embeddings |
| **FocusCoach** | Pomodoro sessions & productivity tracking | Timer utils + habit tracking |
| **WorkspaceGenie** | Create project workspaces from templates | Template engine + file operations |

**Key Architectural Distinction:**
- **BMAD agents help developers build LogOS** (development-time in Cursor IDE)
- **LogOS agents help users be productive** (runtime in the application)

### 4.3  Development-Time Knowledge Base (BMAD Agent Enhancement)
**Purpose:** Enhance BMAD development agents with project-specific context to reduce hallucinations during development.

**Simple Dev KB Approach:**
- **Manual Knowledge Base**: Create `docs/dev-kb/` folder with:
  - `architecture-decisions.md`
  - `api-patterns.md` 
  - `coding-standards.md`
- **BMAD Agent Integration**: Agents read these files directly (no RAG needed)
- **Manual Updates**: Developers update docs as they code
- **IDE Integration**: Simple file-based lookup in Cursor

**Benefit:** Zero external dependencies, always works, developer-controlled

> **Scope:** This is purely for enhancing the development process. End-users never interact with this system.

---

## 5   Technical Architecture
| Layer | Tech Choice | Rationale |
|-------|------------|-----------|
| **Frontend** | React + Vite + Tailwind + shadcn/ui + VitePWA | Rapid prototyping, offline support |
| **State Mgmt** | TanStack Query + Zustand | Cache syncing & minimal boilerplate |
| **Data Access** | Data‑Permissions Matrix wrapper | Enforces private / workspace / org visibility |
| **Backend** | Supabase Edge Functions (Deno) | *Chosen for Phase 1* — zero‑idle cost, Postgres built‑in (Fastify micro‑service optional in Phase 2) | Serverless pricing, Postgres built‑in |
| **AI Runtime** | LangChain + OpenAI Functions | Streamed execution, deterministic schemas |
| **Auth** | Supabase Auth (OAuth, magic link) | Quick setup, RBAC |
| **Real‑time** | Supabase Realtime Channels | Push updates to dashboard |
| **RTC / Conferencing** | LiveKit Cloud (WebRTC) | Low‑latency video & audio sessions; React SDK + serverless TURN |

---

### 5.1  LogOS Runtime AI Overlay (Cosmos‑Style)
- **Purpose:** Provide a persistent, context‑aware AI layer that sits above every LogOS module to deliver orchestration, personalization, and dynamic agent routing for end-users.
- **Core Runtime Layers (top‑down):**
  1. **User Context** – real‑time profile, goals, preferences, ADHD focus state.
  2. **Runtime Orchestration** – intelligent routing between LogOS productivity agents.
  3. **Personalization** – learns habits to tweak prompts, priority order, and UI emphasis.
  4. **Productivity Agent Framework** – spins up *Runtime Agents* (BriefBot, MailBot, etc.) on demand.
  5. **Dynamic GUI Bridge** – exposes agent actions as UI widgets, slash‑commands, or voice responses.
  6. **Core OS Layers** – Supabase Edge Functions / Node services that manipulate persistent data.

- **Implementation Notes:**
  - Wrap LangChain calls in a central **RuntimeController** that serves as the single entry point for all AI-powered actions. It is responsible for routing user intent to the appropriate runtime agents (e.g., BriefBot, MailBot).
  - Expose a global `window.logOS.ask()` helper for universal AI access from any component.
  - Persist user conversation + action history for context and reversible operations.

- **Voice Interaction:** Powered by **Whisper STT** (OpenAI) for high‑accuracy transcription; browser Web Speech API fallback.

> **Key Architectural Note:** This runtime overlay is completely separate from BMAD development agents. BMAD helps us *build* LogOS; this overlay helps *users* be productive.

## 5.2  Function Pillars & How They Might Manifest
| Pillar | What It **Does** | Likely Micro‑Agents (runtime) | UI Surface |
|--------|------------------|------------------------------|------------|
| **AI Task Planner** | Breaks large goals into bite‑sized, deadline‑aware tasks; auto‑prioritises daily queue. | `TaskBot`, `FocusCoach`, `DeadlineSentry` | Smart Task Overview widget + "Plan My Day" button |
| **AI Project Manager** | Tracks project health, Gantt‑style timelines, prompts for blockers, auto‑updates status. | `ProjectTracker`, `RiskRadar`, `ProgressReporter` | Kanban board overlay + weekly digest |
| **AI Calendar & Scheduling** | Finds optimal meeting slots, resolves conflicts, inserts focus blocks. | `CalendarGenie`, `ConflictResolver` | Modal picker embedded in Upcoming Schedule |
| **AI Meeting Notetaker** | Records & transcribes calls, summarises action items, pushes them to tasks & inbox. | `TranscribeBot`, `ActionExtractor` | Inline transcript viewer + "Send to Tasks" chips |
| **AI Docs & Notes** | Structured note templates, backlinks, embeds tasks, auto‑tags for search. | `DocsAI`, `Tagger`, `LinkWeaver` | Notion‑style editor pane |
| **AI Writer & Editor** | Drafts emails, briefs, social posts; rewrites tone; grammar & clarity passes. | `WriteAssist`, `ToneShifter`, `Proofreader` | Composer sidebar & inline edit pop‑over |
| **AI Workflows Generator** | "Build me a process for onboarding interns" ⇒ auto‑spins checklist, forms, reminders. | `WorkflowSmith`, `FormBuilder` | Gallery of templates + wizard |
| **AI Search & Ask** | Natural‑language search across all data silos; combines RAG with agent actions. | `SearchCore`, `RAGFusion`, `AnswerCraft` | Slash‑command bar & voice |
| **AI Vision & OCR** | Extract text & action items from screenshots, scanned PDFs, whiteboards. Feeds RAG and TaskBot. | `VisionBot`, `OCRAgent`, `ImageAnalyzer` | Drop‑zone uploader, screenshot hotkey, and auto‑suggest tasks |
| **AI Agent Assistants** | Meta‑layer that suggests which specialised agent to invoke; one‑click "do it for me." | `Orchestrator`, `SuggestionDaemon` | Contextual hover cards & Command‑K menu |
| **AI Onboarding Wizard** | 5‑question setup (primary goal, calendar source, email source, preferred voice style, preferred work rhythm) that personalises agents and logs successes/failures so models adapt over time| `Onboarder`, `ProfileLearner` | First‑run modal & settings page |

> 🔈 *Voice layer*: every pillar exposes a `say:` alias so users can invoke functions conversationally.

### 5.3  Model Control Protocol (MCP) Gateway Option – *Phase‑1 Pilot limited to RAG*
| Concern | Direct Calls (No MCP) | MCP Gateway (Model Control Protocol) |
|---------|----------------------|--------------------------------------|
| **API Fan‑out** | UI hits Supabase/LangChain functions individually. | All requests funnel through MCP, which routes to appropriate micro‑agent or service. |
| **Auth & Rate Limits** | Each service handles its own. | Centralised token management, quotas, and fallback routing. |
| **Real‑time Events** | Supabase Channels per service. | MCP multiplexes a single event stream to clients. |
| **Observability** | Logs scattered across multiple functions. | Unified tracing & metrics (OpenTelemetry) at MCP layer. |
| **Complexity vs. Scale** | Simpler for MVP; can get messy as agents grow. | Slight setup cost, but cleaner long‑term scaling & monitoring. |

> **Recommendation:** Skip MCP for the very first MVP. Introduce it once >3 micro‑services/agents need central coordination.

---

### 5.4  Unified Provider Connectors (Google ↔ Apple ↔ O365)
[CONTENT UNCHANGED]
---

### 5.5  Knowledge & Search Strategy *(Phased Approach)*

**Phase 1 MVP: Supabase-Native RAG**
- **Goal:** Minimise hallucinations by grounding AI answers in user's actual data using proven technology.
- **Engine:** Direct Supabase integration with battle-tested tools:
  - **Vector Store**: Supabase `pgvector` extension (existing infrastructure)
  - **Embedding**: OpenAI `text-embedding-3-small` (stable API)
  - **Chunking**: Simple LangChain TextSplitter (proven)
  - **Search**: Direct pgvector similarity search

**MVP Pipeline:**
1. **Manual Document Upload**: Users drag-drop PDFs, docs → simple parsing
2. **Basic Chunking**: LangChain splits into 1000-char chunks with 200-char overlap  
3. **Direct Embedding**: OpenAI API → store in `documents` table
4. **Simple RAG Query**: `SELECT * FROM documents ORDER BY embedding <=> query_embedding LIMIT 5`

**MVP Schema:**
```sql
-- Enable pgvector in existing Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Simple documents table  
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Similarity search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
) RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

**MVP UI:**  
- Upload button in settings: "Add Knowledge Documents"
- Simple search: "Search my documents" 
- Basic citations: Show source document name

**Phase 2: Enhanced RAG** *(Evaluate after MVP)*
- Web crawling (technology TBD based on stability)
- Advanced knowledge graphs
- Automated content ingestion
- Complex entity relationships

**What We Skip for MVP:**
- ❌ Web crawling (complex, unreliable)
- ❌ Complex knowledge graphs (over-engineering)  
- ❌ MCP integration (adds complexity)
- ❌ Auto-crawling (can break)

**Benefits of Phased Approach:**
- ✅ Uses existing Supabase infrastructure
- ✅ Zero new external dependencies
- ✅ Proven technology stack
- ✅ Fast implementation (1-2 days)
- ✅ Easy to enhance incrementally

 > **Architecture Decision**: Start simple, scale complexity only after core value is proven.

**Risk Controls & Monitoring:**
- **Token & Cost Tracking:** wrap all OpenAI calls with a `token_budget.ts` middleware that logs `model`, `tokens_in`, `tokens_out`, and `$cost`; daily roll‑ups feed a Cost Dashboard widget **and automatically down‑shifts model routing (GPT‑4o → 4o‑mini) once spend nears the `DAILY_TOKEN_CAP` (AU $5/day).**
- **Agent Audit Trails:** each runtime agent logs the prompt version, decision summary, and user action to `agent_activity` table—making debugging and optimization painless.
- **Privacy‑First Retention**: keep raw content 7 days, metadata 30 days. Apply regex redaction for emails/phones before storage.
- **Simple Alerting**: Basic Supabase monitoring for error‑rate >1% in 5 minutes **or** token spend >AU $5/day.

---

### 5.6  Logging & Observability Strategy
*(See 5.5 Token & Cost Tracking for details)*

### 5.7  Data Reliability & Intelligence (Phase‑1 Commit)
- **Data Import / Migration Assistant:** Runs Google, iCloud, and O365 connectors in background with progress bar & retry queue.
- **Backup & Disaster Recovery:** Supabase point‑in‑time recovery plus weekly encrypted S3 snapshots; documented RTO 24 h / RPO 1 h.
- **Analytics & Success Metrics** — Track `focus_block_completed`, `tasks_completed`, and token spend via PostHog dashboards; feed streaks into gamified badges
- **AI Model Versioning & Rollback:** Log `model_hash`, temperature, and enable blue‑green rollouts behind feature flags.

### 5.8  Monitoring & Parameter Management
- **Self‑Serve API Key Vault:** Secure UI to add, rotate, and revoke provider keys (OpenAI, Anthropic, Google, Twilio). Keys stored in Supabase's encrypted **Secrets Manager** table with row‑level security.
- **Runtime Parameter Dashboard:** Toggle model routing (GPT‑4o vs Claude), tweak max‑token limits, adjust alert thresholds—all without redeploying.
- **Health & Metrics Panel:** Real‑time graphs (p99 latency, error rate, token usage) pulled from Grafana Loki + Tempo.
- **Alert Webhooks Manager:** Configure Slack, Discord, or email destinations for critical alerts (error spike, budget breach).
- **Changelog & Audit Log:** Every parameter change writes to `config_audit` table with user, diff, and rollback link.
- **Edge Function `config.ts`:** Reads cached config on cold start; hot‑reloads via Supabase Realtime when settings change.

### 5.9  **Development Knowledge Base** *(BMAD Agent Enhancement)*
- **Purpose:** Enhance BMAD development agents with project-specific context to reduce hallucinations during development.
- **Simple File-Based Approach:**
  - **Manual Knowledge Base**: Create `docs/dev-kb/` folder with markdown files:
    - `architecture-decisions.md` - Key technical decisions and rationale
    - `api-patterns.md` - Consistent API design patterns  
    - `coding-standards.md` - Project-specific coding conventions
    - `troubleshooting.md` - Common issues and solutions
  - **BMAD Agent Integration**: Agents read these files directly (no complex RAG needed)
  - **Manual Updates**: Developers update docs as they make decisions
  - **IDE Integration**: Simple file-based lookup in Cursor with `@include` commands

- **Benefits:**
  - ✅ Zero external dependencies, always works
  - ✅ Developer-controlled and maintainable  
  - ✅ Human-readable documentation
  - ✅ Fast implementation (30 minutes)
  - ✅ No complex infrastructure needed

- **Usage Examples:**
  - `@architect` reads `architecture-decisions.md` before suggesting changes
  - `@dev` references `api-patterns.md` when implementing endpoints
  - `@qa` checks `coding-standards.md` during code review

> **Scope:** This is purely for enhancing the development process. End-users never interact with this system.
---

### 5.10  Code Quality & Modular Structure
- **ESLint `max-lines` rule: "max-lines": ["error", 250] in `.eslintrc` (applies to `src/**`; **exemptions:** config files, generated types, Storybook stories, test fixtures).
- **Husky + lint‑staged:** `npx husky-init && npm i -D lint-staged` → run `eslint --max-warnings=0` before every commit.
- **File/folder pattern: Each React feature lives in `/features/<name>/` with `index.tsx`, `hooks.ts`, etc. Supabase Edge Functions mirror this as `/functions/<feature>/index.ts`. Keep individual files bite‑sized.
- **Cursor Agent Helper:** Use `@agent architect split-file` command on any file >200 lines; agent suggests a refactor into smaller modules.
- **CI Gate:** GitHub Workflow `pnpm run lint && pnpm test` must pass; `max-lines` enforcement is non‑negotiable.
- **VS Code & Cursor Warning:** Recommend the ESLint & Lightbulb extensions so over‑length files highlight in real‑time.

---

## 6   ADHD‑Friendly Practices
- **Pomodoro‑first UI:** Built‑in 25‑min focus timer visible in navbar.
- **Focus Mode Toggle with Learning:** One‑click hides distractions *and* records widget usage patterns to auto‑prompt Focus Mode in similar contexts.
- **Checklists Everywhere:** Each modal / wizard surfaces a 3‑step checklist.
- **Low‑Noise Defaults:** Disable badges & sounds until the user enters "Focus Break" mode.
- **Progress Dopamine Hits:** Celebrate completed streaks with subtle confetti.

---

## 7   Roadmap & Milestones
| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **0 – Setup** | Week 0‑1 | Repo, CI, Design Tokens, Supabase project |
| **1 – MVP Dashboard** | Week 2‑4 | Core UI widgets, dummy data, BriefBot integration |
| **2 – Full Agent Mesh** | Week 5‑6 | MailBot, TaskBot, real data sync |
| **3 – Mobile & Polish** | Week 7‑8 | Responsive design, push notifications, QA |
| **4 – Beta Launch** | Week 9 | Invite list, feature flagging, feedback loop |

---

## 8   Future Enhancements (V2)
- **Pricing / Monetisation** — Stripe metered billing, agent unlocks, usage caps.
- **Accessibility & Inclusivity** — WCAG 2.2 audit, keyboard nav, screen‑reader labels.
- **Internationalisation (i18n)** — `react-i18next`, locale‑aware dates, multi‑voice TTS.
- **Community / Plugin Ecosystem** — manifest.json, iframe sandbox, marketplace.
- **Mobile‑first Design Details** — gestures, bottom sheets, offline cache limits.
- **Security Compliance (AU & EU)** — GDPR, Australian Privacy Principles, SOC 2 roadmap.
- **Support & Feedback Loop** — in‑app feedback form, Sentry crash reporter.
- **Testing Strategy** — e2e Playwright harness + agent simulation.

---

## 9   Immediate Next Steps for Luke
1. **Review & tweak** this blueprint – mark any must‑have / nice‑to‑have features.
2. **Pick backend** (Supabase vs. custom Fastify) for the MVP.
3. **Run `npx bmad-method install`** inside your project root.
4. **Commit** the generated `.bmad-code` folder and push to GitHub.
5. **Schedule a 30‑min focus session** to stub the first React components.

> *Remember: tiny, rewarding steps keep the dopamine flowing. Let's vibe‑code this thing!*
