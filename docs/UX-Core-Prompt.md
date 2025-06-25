# LogOS UX-Core Prompt (v1)

## Product DNA
- **One-glance clarity** — every screen answers "What should I focus on next?"
- **ADHD-friendly** — minimal context switching, quick dopamine hits, no noisy chrome.
- **Vibe-coding spirit** — playful interactions, easter-egg micro-animations, but never at the expense of speed.

## Visual Language
1. **Whitespace first** — generous spacing (≥ 8 px multiples); reduce cognitive load.
2. **Color scale**
   - Primary = Indigo 600 for CTA buttons
   - Accent = Sky 400 for info badges
   - Error = Rose 500
   - Use 90 % neutral greys otherwise to avoid overwhelm.
3. **Typography**
   - Display: Inter 700, `text-3xl` / 32 px
   - Body: Inter 400, `text-base` / 16 px
   - Line-height: 1.5×
4. **Corners & shadows**
   - 2 xl radius (`rounded-2xl`)
   - Subtle drop-shadow `md` on cards, strong `xl` on modals.

## Interaction Heuristics
- **⌘K palette is the primary nav** — user must reach any module in ≤ 2 keys.
- **Context Ribbon** shows max **3** suggestions; auto-hides on scroll.
- **Focus Mode toggle**
  - Fade out non-critical widgets (`opacity-20`) instead of collapse — preserves spatial memory.
  - Auto-prompt after 30 s of idle on Dashboard.

## Components
| Component | UX rules |
|-----------|----------|
| **Dashboard Cards** | Max width 360 px, 4-column grid desktop, 1-column mobile. |
| **Softphone Dialer Drawer** | Slide-in from right, 300 ms ease-out, overlay blur `bg-slate-950/50`. |
| **Call HUD** | Stick bottom-right, draggable, auto-dock at 8 px margin. |
| **Toast / Alert** | Appear top-center, auto-dismiss 5 s, allow swipe to dismiss on mobile. |
| **Confetti** | Use `canvas-confetti` only on completed streaks ≥ 3 days; 1 s duration. |

## Accessibility
- WCAG 2.2 AA: color contrast ≥ 4.5:1
- Keyboard: all interactive elements reachable with Tab + Shift-Tab
- VoiceOver / NVDA: label buttons & inputs with aria-labels

## Deliverables the ux-expert agent should output
1. **Figma-style frame spec** (markdown table) for each new screen.
2. **Tailwind utility cheat-sheet** per component.
3. **UX Story tickets** in `stories/ux/` for the dev agent—include acceptance criteria & pixel-perfect refs.

> When unsure, ask follow-up questions like:  
> "What's the top distraction you want to hide in Focus Mode right now?" 