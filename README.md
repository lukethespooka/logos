# LogOS 🚀

A privacy-first productivity co-pilot with hybrid AI intelligence for ADHD-friendly workflow management.

## 🎯 **Vision**
LogOS transforms scattered productivity tools into a unified AI-powered workspace that reduces context-switching and enhances focus through intelligent automation.

## ✨ **Current Features (Sprints 1-2 Complete)**

### 📋 **Task Management**
- Complete CRUD operations with hierarchical subtasks
- Smart search and filtering with real-time updates
- Visual celebrations and focus-enhancing animations
- Keyboard shortcuts for quick navigation (`⌘K` for quick add, `⌘H` for home)

### 🎨 **Enhanced UX**
- ADHD-friendly design with minimal cognitive load
- Focus Mode integration with configurable inactive notifications
- Responsive 2-column dashboard layout
- Comprehensive navigation (QuickNavDock, breadcrumbs, settings)

### 🏗️ **Solid Foundation**
- Supabase backend with proper CORS and error handling
- Real-time sync and offline capabilities
- Accessibility features and smooth animations
- Modular architecture with strict 250-line file limits

## 🤖 **Sprint 3: Hybrid AI Integration (In Progress)**

### 🔒 **Privacy-First AI Architecture**
- **90% Local Processing**: Email triage, calendar analysis using Ollama (Mistral, LLaMA)
- **10% Cloud Processing**: Creative tasks, complex reasoning using OpenAI
- **Cost Target**: <$1/day per user (vs. typical $5/day cloud-only approach)

### 📧 **Bidirectional Provider Integration**
- **Gmail**: Read emails, send drafts, organize with AI clustering
- **Google Calendar**: Conflict detection, meeting prep, focus block scheduling
- **Google Docs**: Document collaboration and task extraction
- **Apple Integration**: Calendar and limited mail support

### 🧠 **Intelligent Features**
- **AI-Generated Daily Briefs**: Using real email/calendar data for actionable insights
- **Smart Context Suggestions**: Learning from user behavior for proactive assistance
- **Natural Language Search**: Across all data with privacy-preserving local processing
- **Focus Mode AI**: Adapts suggestions based on ADHD-friendly productivity patterns

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Supabase CLI

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd logos

# Install dependencies
pnpm install

# Set up Supabase
supabase start
supabase db reset

# Set up local AI infrastructure (Sprint 3)
./scripts/setup-local-ai.sh

# Start development server
pnpm dev
```

### Local AI Setup (Sprint 3)
```bash
# This script sets up Ollama + Docker with recommended models
./scripts/setup-local-ai.sh

# Models included:
# - mistral:7b-instruct (Email triage - 4.1GB)
# - llama3.1:8b (Calendar analysis - 4.7GB) 
# - phi3:mini (Quick responses - 2.3GB)
# - codellama:7b (Code tasks - 3.8GB)
```

## 📁 **Project Structure**
```
logos/
├── apps/web/                 # React frontend with Vite
│   ├── src/components/       # Reusable UI components
│   ├── src/features/         # Feature-specific components
│   └── src/hooks/           # Custom React hooks
├── supabase/                # Backend infrastructure
│   ├── functions/           # Edge Functions (API endpoints)
│   └── migrations/          # Database schema
├── docs/                    # Documentation and planning
│   ├── sprints/             # Sprint plans and progress
│   └── dev-kb/              # Development knowledge base
├── ai-infrastructure/       # Local AI setup (Sprint 3)
└── scripts/                 # Setup and utility scripts
```

## 🎯 **Development Philosophy**

### ADHD-Friendly Design Principles
- **Short, focused interactions** - No overwhelming interfaces
- **Minimal context-switching** - Everything in one unified workspace  
- **Positive reinforcement** - Celebrations and progress dopamine hits
- **Configurable focus modes** - Adapt to different mental states

### Technical Standards
- **250-line file limit** enforced by ESLint for maintainability
- **Privacy-first architecture** with local processing for sensitive data
- **Cost-conscious AI** with hybrid local/cloud routing
- **Blueprint-driven development** following established patterns

## 📊 **Current Sprint Status**

**Sprint 3 Progress**: 🟡 **PLANNING** - Awaiting team decisions
- ✅ **Foundation complete** (task management, UX, navigation)
- 🟡 **Critical analysis complete** - Identified gaps and realistic timeline
- 🔴 **Prerequisites needed** - Database migrations, environment setup, local AI validation
- ⏳ **Team decision required** - MVP-first vs. full scope approach
- ⏳ **Local AI infrastructure setup**
- ⏳ **OAuth provider integration**  
- ⏳ **Hybrid AI router implementation**
- ⏳ **Real data integration** (email/calendar)

**See**: [Team Communication](docs/team-communication-sprint-3.md) for key decisions needed

## 🔮 **Roadmap**

### Phase 1: AI Foundation (Sprint 3)
- Hybrid local/cloud AI architecture
- Google provider integration (Gmail, Calendar, Docs)
- Real data in all dashboard widgets

### Phase 2: Advanced Intelligence  
- Apple provider integration
- Document collaboration
- Advanced learning algorithms

### Phase 3: Ecosystem
- Mobile app with offline sync
- Plugin architecture
- Community marketplace

## 🤝 **Contributing**

LogOS follows the BMAD (Breakthrough Method for Agile AI-Driven Development) methodology:

1. **Read the blueprints**: Review `docs/LogOS-blueprint.md` for vision and architecture
2. **Check development KB**: Reference `docs/dev-kb/` for patterns and standards
3. **Follow Sprint plans**: Current work defined in `docs/sprints/`
4. **Maintain quality**: All code must pass ESLint with max-lines enforcement

## 📄 **License**

MIT License - see LICENSE file for details.

---

**Built with ❤️ for productivity and focus** 🧠✨
