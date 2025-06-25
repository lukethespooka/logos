# LogOS Project Blueprint

## 1   Vision & Goals
- **Personal Productivity Co‑Pilot** – unify schedule, email, tasks, and knowledge into a single AI‑powered workspace.
- **ADHD‑friendly by design** – short, focused interactions, minimal context‑switching, and positive reinforcement.
- **Vibe‑Coding Empowerment** – make building extensions and automations feel playful and low‑friction for non‑engineers.

---

## 2   Primary User Persona
| Trait | Description |
|-------|-------------|
| Name  | **Sam** (our reference persona) |
| Age   | 50+ |
| Background | Tech‑savvy "vibe coder" who juggles multiple projects, battles ADHD, and values rapid feedback |
| Pain Points | Overwhelm, missed deadlines, scattered data |
| Goals | Streamlined daily brief, smart suggestions, quick automations |

---

## 3   Feature Catalog
### 3.1  Dashboard Widgets *(wireframe reference)*
| Widget | Purpose | Notes |
|--------|---------|-------|
| **Daily Brief & AI Insights** | Morning snapshot + prioritized focus recommendations | Regenerate button for fresh advice |
| **Upcoming Schedule** | Aggregated calendar view with conflict detection | Link to full Calendar |
| **Prioritized Inbox** | AI‑clustered emails (High Priority, Marketing, etc.) | Swipe / triage actions |
| **Smart Task Overview** | Auto‑generated & manual tasks with urgency labels | Quick‑complete & snooze |
| **Recent Workspaces & Forms** | Jump‑back to active collaboration spaces | Status tags (Draft, Active, Completed) |
| **Daily Activity Trends** | Simple line chart of productivity metrics | Toggle between day / week / month |
| **System Health Bar** | Live status of errors & token spend (green/yellow/red) | Links to Logs dashboard |

### 3.2  Navigation & Orientation *(sidebar‑less)*
- **⌘K Master Command Palette / Search** – Spotlight‑style overlay (keyboard shortcut, top‑right button, or voice alias) for fuzzy navigation, quick actions, and agent commands. Recent items and agent‑suggested queries bubble to the top.
- **Context Ribbon** – A slim, auto‑hiding bar beneath the header that surfaces *Next Best Actions* in real time (e.g., “Review Inbox”, “Plan My Day”, “Start Focus Timer”). It learns from user successes/failures so suggestions improve over time.

> **Core Modules (called via Palette):** Calendar, Mail, Tasks, Maps, VoIP, Notes, Contacts, Workspaces, Templates, Settings

### 3.3  Cross‑Cutting Capabilities
- 🔍 **Global Search**
- 🛎️ **Notification Center**
- 💡 **Contextual AI Suggestions**
- ➕ **Universal Quick‑Add Modal**
- 🔄 **Real‑time Sync (desktop & mobile)**
- ⌘K **Universal Command Palette / Search**
- 🎯 **Context Ribbon (next best actions)**

### 3.4  Telephony & VoIP UI *(LiveKit + Twilio)*
| Component | Purpose | Notes |
|-----------|---------|-------|
| **Softphone Dialer** | Make outbound PSTN/WebRTC calls from any page | Pops as right‑side drawer (⌘⇧P shortcut or `call:` command). |
| **Incoming Call Overlay** | Slide‑in banner with answer/decline + quick actions ("Send to Voicemail", "Schedule Callback") | Uses LiveKit `Room` events; fallback Twilio widget on PSTN. |
| **Call HUD** | Floating window during call: timer, mute, hold, transfer, record toggle, network quality bar | Whisper transcription live captions; AI auto‑labels action items. |
| **Voicemail & Call Log** | List of past calls with Whisper‑generated summaries, sentiment tag, and “Create Task” button | Searchable via Global Search; unread badge in Context Ribbon. |
| **Settings → Telephony** | Default provider Twilio; ringtone, voicemail greeting, recording consent toggle | Lives in the Monitoring & Parameter Mgmt dashboard. |

> *Voice commands:* say “Hey LogOS, call Alex” to open the dialer pre‑filled.

---

## 4   AI Agents & BMAD‑METHOD Integration
BMAD (Breakthrough Method for Agile AI‑Driven Development) provides modular **Agents**, **Checklists**, **Templates**, **Utils**, and **Workflows** that plug straight into Cursor IDE’s custom‑agent system ([github.com](https://github.com/bmadcode/BMAD-METHOD?utm_source=chatgpt.com)).

### 4.1  Proposed Agent Roles
| Agent | Primary Job | BMAD Artifact |
|-------|-------------|---------------|
| **BriefBot** | Compose Daily Brief & focus suggestions | `checklists/brief.md`, `utils/summarize.ts` |
| **MailBot** | Cluster & triage inbox, draft replies | `workflows/inbox‑zero.yml` |
| **TaskBot** | Extract tasks from emails/meetings, set deadlines | `templates/task.md` |
| **FocusCoach** | Guide Pomodoro sessions, track streaks | `utils/timer.ts` |
| **WorkspaceGenie** | Spin up new project spaces from templates | `templates/workspace.json` |

### 4.2  Integration Steps
1. **Install BMAD CLI:** `npx bmad-method install` — auto‑creates `.bmad-code` folder with sample agents ([github.com](https://github.com/bmadcode/BMAD-METHOD?utm_source=chatgpt.com)).
2. **Enable Cursor Modes:** Add agents to `.cursor/modes.json` so you can invoke with `@agent` commands.
3. **Wire into LogOS Frontend:** Expose backend endpoints (`/agent/<name>/act`) the UI components can hit.
4. **Persist State:** Store agent outputs (tasks, notes, decisions) in Supabase Postgres for easy querying.

---

## 5   Technical Architecture
| Layer | Tech Choice | Rationale |
|-------|------------|-----------|
| **Frontend** | React + Vite + Tailwind + shadcn/ui + VitePWA | Rapid prototyping, offline support |
| **State Mgmt** | TanStack Query + Zustand | Cache syncing & minimal boilerplate |
| **Data Access** | Data‑Permissions Matrix wrapper | Enforces private / workspace / org visibility |
| **Backend** | Supabase Edge Functions (Deno) | *Chosen for Phase 1* — zero‑idle cost, Postgres built‑in (Fastify micro‑service optional in Phase 2) | Serverless pricing, Postgres built‑in |
| **AI Runtime** | LangChain + OpenAI Functions | Streamed execution, deterministic schemas |
| **Auth** | Supabase Auth (OAuth, magic link) | Quick setup, RBAC |
| **Real‑time** | Supabase Realtime Channels | Push updates to dashboard |
| **RTC / Conferencing** | LiveKit Cloud (WebRTC) | Low‑latency video & audio sessions; React SDK + serverless TURN |

---

### 5.1  AI‑Across‑All Overlay (Cosmos‑Style)
- **Purpose:** Provide a persistent, context‑aware AI layer that sits above every LogOS module (frontend components, backend services, and even external apps) to deliver orchestration, personalization, and dynamic agent routing—mirroring the yellow "AI" stack you shared.
- **Core Layers (top‑down):**
  1. **User Context** – real‑time profile, goals, preferences, ADHD focus state.
  2. **Orchestration** – BMAD‑style dynamic agent selection and task decomposition.
  3. **Personalization** – learns habits to tweak prompts, priority order, and UI emphasis.
  4. **Agent Framework** – spins up *Micro‑Agents* (BriefBot, MailBot, etc.) on demand.
  5. **Dynamic GUI Bridge** – exposes agent actions as UI widgets, slash‑commands, or voice responses.
  6. **Core OS Layers** – Supabase Edge Functions / Node services that manipulate persistent data.
- **Implementation Notes:**
  - Wrap LangChain calls in a central **Controller** that any React component or Supabase Function can import.
  - Expose a global `window.logOS.ask()` helper so new modules can invoke the overlay with one line of code.
  - Persist conversation + action history for reversible operations and re‑planning.
- **Voice Interaction:** Lives inside layer 5, powered by **Whisper STT** (OpenAI) for high‑accuracy transcription; falls back to browser Web Speech API for quick commands and Twilio IVR for phone calls. Offline mode can optionally run `whisper.cpp` on‑device.
- **BMAD Runtime vs. App Runtime:** BMAD agents help *build* the system inside Cursor. The **AI‑Across‑All overlay** is what *runs* inside LogOS for end‑users. The overlay can still reuse BMAD checklists as internal prompts.

## 5.2  Function Pillars & How They Might Manifest
| Pillar | What It **Does** | Likely Micro‑Agents (runtime) | UI Surface |
|--------|------------------|------------------------------|------------|
| **AI Task Planner** | Breaks large goals into bite‑sized, deadline‑aware tasks; auto‑prioritises daily queue. | `TaskBot`, `FocusCoach`, `DeadlineSentry` | Smart Task Overview widget + “Plan My Day” button |
| **AI Project Manager** | Tracks project health, Gantt‑style timelines, prompts for blockers, auto‑updates status. | `PMBot`, `RiskRadar`, `StandUpSummariser` | Kanban board overlay + weekly digest |
| **AI Calendar & Scheduling** | Finds optimal meeting slots, resolves conflicts, inserts focus blocks. | `CalendarGenie`, `ConflictResolver` | Modal picker embedded in Upcoming Schedule |
| **AI Meeting Notetaker** | Records & transcribes calls, summarises action items, pushes them to tasks & inbox. | `TranscribeBot`, `ActionExtractor` | Inline transcript viewer + “Send to Tasks” chips |
| **AI Docs & Notes** | Structured note templates, backlinks, embeds tasks, auto‑tags for search. | `DocsAI`, `Tagger`, `LinkWeaver` | Notion‑style editor pane |
| **AI Writer & Editor** | Drafts emails, briefs, social posts; rewrites tone; grammar & clarity passes. | `WriteAssist`, `ToneShifter`, `Proofreader` | Composer sidebar & inline edit pop‑over |
| **AI Workflows Generator** | “Build me a process for onboarding interns” ⇒ auto‑spins checklist, forms, reminders. | `WorkflowSmith`, `FormBuilder` | Gallery of templates + wizard |
| **AI Search & Ask** | Natural‑language search across all data silos; combines RAG with agent actions. | `SearchCore`, `RAGFusion`, `AnswerCraft` | Slash‑command bar & voice |
| **AI Vision & OCR** | Extract text & action items from screenshots, scanned PDFs, whiteboards. Feeds RAG and TaskBot. | `VisionBot`, `OCRAgent`, `ImageAnalyzer` | Drop‑zone uploader, screenshot hotkey, and auto‑suggest tasks |
| **AI Agent Assistants** | Meta‑layer that suggests which specialised agent to invoke; one‑click “do it for me.” | `Orchestrator`, `SuggestionDaemon` | Contextual hover cards & Command‑K menu |
| **AI Onboarding Wizard** | 5‑question setup (primary goal, calendar source, email source, preferred voice style, preferred work rhythm) that personalises agents and logs successes/failures so models adapt over time| `Onboarder`, `ProfileLearner` | First‑run modal & settings page |

> 🔈 *Voice layer*: every pillar exposes a `say:` alias so users can invoke functions conversationally.

### 5.3  Model Control Protocol (MCP) Gateway Option – *Phase‑1 Pilot limited to RAG*
| Concern | Direct Calls (No MCP) | MCP Gateway (Model Control Protocol) |
|---------|----------------------|--------------------------------------|
| **API Fan‑out** | UI hits Supabase/LangChain functions individually. | All requests funnel through MCP, which routes to appropriate micro‑agent or service. |
| **Auth & Rate Limits** | Each service handles its own. | Centralised token management, quotas, and fallback routing. |
| **Real‑time Events** | Supabase Channels per service. | MCP multiplexes a single event stream to clients. |
| **Observability** | Logs scattered across multiple functions. | Unified tracing & metrics (OpenTelemetry) at MCP layer. |
| **Complexity vs. Scale** | Simpler for MVP; can get messy as agents grow. | Slight setup cost, but cleaner long‑term scaling & monitoring. |

> **Recommendation:** Skip MCP for the very first MVP. Introduce it once >3 micro‑services/agents need central coordination.

---

### 5.4  Unified Provider Connectors (Google ↔ Apple ↔ O365)
[CONTENT UNCHANGED]
---

### 5.5  Knowledge Graph & RAG Guardrails *(mcp-crawl4ai-rag)*
- **Goal:** Minimise hallucinations by grounding all AI answers in an up‑to‑date knowledge graph built from crawled web pages, docs, emails, and screenshots.
- **Engine:** Deploy `mcp-crawl4ai-rag` as a sidecar container (or Supabase Edge Function) behind the existing MCP gateway.
  - Endpoints used: `smart_crawl_url`, `crawl_single_page`, `perform_rag_query`, `get_available_sources`.
  - Vectors stored in Supabase `documents_kg` table (pgvector) for tight locality.
- **Pipeline:**
  1. Connectors (5.4) ingest raw files/text.
  2. `CrawlerAgent` feeds content → MCP → embedding + chunking (OpenAI `text-embedding-3-small`).
  3. `KGIngestor` writes graph edges (source→entity, entity→topic) enabling concept joins.
- **Query Flow:**
  - `RAGFusion` agent passes user question → `perform_rag_query` → top‑k chunks + entity sub‑graph.
  - Claude Sonnet or GPT‑4o synthesises answer **with inline citations**; fallback to “I don’t know” if relevance <0.2.
- **UI Hooks:**
  - In ⌘K palette: `⌘K > crawl https://url` starts a crawl job.
  - Search results show a “🔗 cite” pill; click opens source preview.
- **Observability:** Store `rag_score`, `source_count`, `latency_ms` in `kg_query_logs` for cost & quality tracking.
- **Risk Controls:**
  - **Token & Cost Tracking:** wrap all OpenAI/Llama calls with a `token_budget.ts` middleware that logs `model`, `tokens_in`, `tokens_out`, and `$cost`; daily roll‑ups feed a Cost Dashboard widget **and automatically down‑shifts model routing (GPT‑4o → 4o‑mini → Llama‑3) once spend nears the `DAILY_TOKEN_CAP` (AU $5/day).**
- **Agent Audit Trails & Prompt Library:** each micro‑agent logs the prompt file version, its decision summary, and the diff to `agent_activity` table—making replay & prompt iteration painless.
- **Privacy‑First Retention**: keep raw bodies 7 days, metadata 30 days. Apply regex redaction for emails/phones before storage.
- **Alerting**: Grafana Alerts fire Slack pings if error‑rate >1% in 5 minutes **or** token spend >AU $5/day (~US $3.30).
- **Local DX**: `pnpm run dev:logs` spins up Loki + Grafana via Docker; tail everything with `pnpm logs:tail`.

---

### 6.5  Logging & Observability Strategy
*(See 5.5 Token & Cost Tracking for details)*

### 6.6  Data Reliability & Intelligence (Phase‑1 Commit)
- **Data Import / Migration Assistant:** Runs Google, iCloud, and O365 connectors in background with progress bar & retry queue.
- **Backup & Disaster Recovery:** Supabase point‑in‑time recovery plus weekly encrypted S3 snapshots; documented RTO 24 h / RPO 1 h.
- **Analytics & Success Metrics** — Track `focus_block_completed`, `tasks_completed`, and token spend via PostHog dashboards; feed streaks into gamified badges
- **AI Model Versioning & Rollback:** Log `model_hash`, temperature, and enable blue‑green rollouts behind feature flags.

### 6.7  Monitoring & Parameter Management
- **Self‑Serve API Key Vault:** Secure UI to add, rotate, and revoke provider keys (OpenAI, Anthropic, Google, Twilio). Keys stored in Supabase’s encrypted **Secrets Manager** table with row‑level security.
- **Runtime Parameter Dashboard:** Toggle model routing (GPT‑4o vs Claude), tweak max‑token limits, adjust alert thresholds—all without redeploying.
- **Health & Metrics Panel:** Real‑time graphs (p99 latency, error rate, token usage) pulled from Grafana Loki + Tempo.
- **Alert Webhooks Manager:** Configure Slack, Discord, or email destinations for critical alerts (error spike, budget breach).
- **Changelog & Audit Log:** Every parameter change writes to `config_audit` table with user, diff, and rollback link.
- **Edge Function `config.ts`:** Reads cached config on cold start; hot‑reloads via Supabase Realtime when settings change.

### 6.8  **Dev‑Knowledge Graph for BMAD Agents** *(Hallucination Guardrail)*
- **Source Feed:** Auto‑crawl the codebase (`/apps`, `/packages`), ADRs, API docs, and this Blueprint using `mcp-crawl4ai-rag` on every commit.
- **Vector Store:** Write embeddings to a local pgvector table `code_kg` in the **Dev Supabase** project.
- **Agent Integration:** Cursor agents (`@agent architect`, `@agent analyst`) call `perform_rag_query` before drafting code/comments to ground their output in repo facts.
- **IDE UX:**
  - Right‑click → “Ask Code KG” in Cursor highlights opens inline RAG answer with citations to files.
  - Failed unit tests trigger a *“Search KG for similar patterns?”* suggestion.
- **CI Check:** A pre‑commit hook runs `rag_guard lint` to flag agent‑generated PRs that cite *zero* sources or low‑relevance ones (<0.15).
- **Benefit:** Reduces hallucinated API usage, keeps vibe‑coding grounded in actual project structure.
---

### 6.9  Code Quality & Modular Structure
- **ESLint `max-lines` rule: "max-lines": ["error", 250] in `.eslintrc` (applies to `src/**`; **exemptions:** config files, generated types, Storybook stories, test fixtures).
- **Husky + lint‑staged:** `npx husky-init && npm i -D lint-staged` → run `eslint --max-warnings=0` before every commit.
- **File/folder pattern: Each React feature lives in `/features/<name>/` with `index.tsx`, `hooks.ts`, etc. Supabase Edge Functions mirror this as `/functions/<feature>/index.ts`. Keep individual files bite‑sized.
- **Cursor Agent Helper:** Use `@agent architect split-file` command on any file >200 lines; agent suggests a refactor into smaller modules.
- **CI Gate:** GitHub Workflow `pnpm run lint && pnpm test` must pass; `max-lines` enforcement is non‑negotiable.
- **VS Code & Cursor Warning:** Recommend the ESLint & Lightbulb extensions so over‑length files highlight in real‑time.

---

## 7   ADHD‑Friendly Practices
- **Pomodoro‑first UI:** Built‑in 25‑min focus timer visible in navbar.
- **Focus Mode Toggle with Learning:** One‑click hides distractions *and* records widget usage patterns to auto‑prompt Focus Mode in similar contexts.
- **Checklists Everywhere:** Each modal / wizard surfaces a 3‑step checklist.
- **Low‑Noise Defaults:** Disable badges & sounds until the user enters “Focus Break” mode.
- **Progress Dopamine Hits:** Celebrate completed streaks with subtle confetti.

---

## 8   Roadmap & Milestones
| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **0 – Setup** | Week 0‑1 | Repo, CI, Design Tokens, Supabase project |
| **1 – MVP Dashboard** | Week 2‑4 | Core UI widgets, dummy data, BriefBot integration |
| **2 – Full Agent Mesh** | Week 5‑6 | MailBot, TaskBot, real data sync |
| **3 – Mobile & Polish** | Week 7‑8 | Responsive design, push notifications, QA |
| **4 – Beta Launch** | Week 9 | Invite list, feature flagging, feedback loop |

---

## 9  Future Enhancements (V2)
- **Pricing / Monetisation** — Stripe metered billing, agent unlocks, usage caps.
- **Accessibility & Inclusivity** — WCAG 2.2 audit, keyboard nav, screen‑reader labels.
- **Internationalisation (i18n)** — `react-i18next`, locale‑aware dates, multi‑voice TTS.
- **Community / Plugin Ecosystem** — manifest.json, iframe sandbox, marketplace.
- **Mobile‑first Design Details** — gestures, bottom sheets, offline cache limits.
- **Security Compliance (AU & EU)** — GDPR, Australian Privacy Principles, SOC 2 roadmap.
- **Support & Feedback Loop** — in‑app feedback form, Sentry crash reporter.
- **Testing Strategy** — e2e Playwright harness + agent simulation.

---

## 10   Immediate Next Steps for Sam
1. **Review & tweak** this blueprint – mark any must‑have / nice‑to‑have features.
2. **Pick backend** (Supabase vs. custom Fastify) for the MVP.
3. **Run `npx bmad-method install`** inside your project root.
4. **Commit** the generated `.bmad-code` folder and push to GitHub.
5. **Schedule a 30‑min focus session** to stub the first React components.

> *Remember: tiny, rewarding steps keep the dopamine flowing. Let’s vibe‑code this thing!*


---

## 11   Appendix A — Budget Cheat‑Sheet (Solo Dev)
| Cost Bucket | Bootstrap (early dev) | Active Dev / MVP Pilot | Notes |
|-------------|----------------------|------------------------|-------|
| **Supabase** | **Free** (0.5 GB DB, 500 MB storage, 2 M edge calls) | **US $25 ≈ AU $38** for 8 GB DB, 8 M edge calls | Supabase pricing, Jun 2025 |
| **OpenAI LLMs**<br>(GPT‑4o + 4o‑mini) | ~0.4 M in / 0.1 M out tokens → **US $3** | ~2 M in / 0.6 M out → **US $15** | GPT‑4o $2.50 / M in, $10 / M out; 4o‑mini $0.50 / M in, $2 / M out |
| **Anthropic Claude Sonnet** | 0.1 M in / 0.02 M out → **US $0.6** | 0.5 M in / 0.1 M out → **US $3** | $3 / M in, $15 / M out |
| **Embeddings** (`text-embedding-3-small`) | 2 M tokens → **US $0.04** | 10 M tokens → **US $0.20** | $0.02 / M tokens |
| **Whisper STT** | 300 min audio → **US $1.80** | 1 000 min → **US $6.00** | $0.006 / min |
| **PostHog (analytics)** | Under 1 M events → **Free** | 3 M events → **US $15** | PostHog pricing cap |
| **Domain name + email** | **AU $1** | **AU $1** | Annual ≈ $12 |
| **Optional Vultr VPS** | **US $6** (1 vCPU, 1 GB) | **US $24** (4 vCPU, 8 GB) | Only if self‑hosting Ollama/OCR |
| **Twilio Voice / SMS** (optional) | **US $2–5** | **US $10–15** | AU call rates: $0.013‑0.022/min |
| **Telnyx Voice / SMS** (alt) | **US $1–4** | **US $8–12** | ~20‑30 % cheaper; AU inbound ~$0.010/min, SMS ~$0.045 |
| **Plivo Voice / SMS** (alt) | **US $1.5–4.5** | **US $9–13** | Similar to Telnyx; AU inbound ~$0.012/min, SMS ~$0.046 |

**Monthly Totals (USD)**
- **Bootstrap:** ≈ **$5–7** core → **$13–18** with VPS + Twilio.  
- **Active Dev / MVP Pilot:** ≈ **$60–65** core → **$90–105** with VPS + Twilio.

> *Tip:* Set `DAILY_TOKEN_CAP` env var (default **AU $5/day**) and let `token_budget.ts` auto‑switch to cheaper models if spend exceeds budget.

