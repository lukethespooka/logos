# Dashboard Widgets UX Specifications

## Common Widget Properties

### Frame Spec
| Property | Value | Notes |
|----------|-------|-------|
| Width | `w-full` | Fills grid cell width |
| Max Width | `max-w-[360px]` | Per UX Core requirements |
| Padding | `p-6` | Following 8px grid (48px) |
| Corner Radius | `rounded-2xl` | Per design system |
| Shadow | `shadow-md` | Card-level elevation |
| Background | `bg-white` | Base card background |
| Border | `border border-slate-200` | Subtle definition |

### Interaction States
| State | Visual Change | Notes |
|-------|--------------|-------|
| Hover | `hover:shadow-lg` | Subtle elevation increase |
| Focus | `ring-2 ring-primary ring-offset-2` | Keyboard focus indicator |
| Loading | Apply skeleton animation | Use shadcn/ui skeleton |
| Error | Red border + error message | Use `rose-500` for error states |

### Typography Scale
| Element | Class | Notes |
|---------|-------|-------|
| Card Title | `text-lg font-semibold text-slate-900` | Widget header |
| Card Description | `text-sm text-slate-500` | Subheader text |
| Body Text | `text-base text-slate-700` | Main content |
| Metadata | `text-sm text-slate-400` | Secondary info |

## DailyBriefWidget

### Frame Spec
| Element | Tailwind Classes | Notes |
|---------|-----------------|-------|
| Header Area | `space-y-1.5 mb-4` | Vertical stack |
| Brief Text | `prose prose-slate max-w-none` | Rich text formatting |
| Refresh Button | `w-full mt-4` | Full-width action |

### Accessibility
- Role: `region`
- Aria-label: "Daily Brief and AI Insights"
- Live Region: Updates should be announced
- Button labels: "Refresh Daily Brief"

### States
- Loading: Show skeleton for brief text
- Error: Display retry button
- Empty: Show placeholder message
- Success: Animate brief text in

## PrioritizedInboxWidget

### Frame Spec
| Element | Tailwind Classes | Notes |
|---------|-----------------|-------|
| Cluster List | `space-y-3` | Vertical stack |
| Cluster Item | `flex justify-between items-center` | Row layout |
| Badge | `px-2 py-1 rounded-full text-xs` | Count indicator |

### Accessibility
- Role: `list`
- Aria-label: "Email Clusters"
- Item roles: `listitem`
- Live Region: Badge updates

### States
- Unread: Bold cluster name
- Hover: Highlight row
- Empty: Show "All caught up" message

## UpcomingScheduleWidget

### Frame Spec
| Element | Tailwind Classes | Notes |
|---------|-----------------|-------|
| Event List | `space-y-4` | Vertical stack |
| Event Item | `flex items-start gap-3` | Row with icon |
| Time Range | `text-sm text-slate-500` | Secondary text |
| Status Dot | `w-2 h-2 rounded-full mt-2` | Color indicator |

### Accessibility
- Role: `list`
- Aria-label: "Upcoming Schedule"
- Time format: Use `time` element
- Status: Color + text label

### States
- Past events: Reduced opacity
- Current event: Highlighted
- Conflict: Warning indicator
- Empty: Show "Schedule clear" message

## SmartTaskOverviewWidget

### Frame Spec
| Element | Tailwind Classes | Notes |
|---------|-----------------|-------|
| Task List | `space-y-3` | Vertical stack |
| Task Item | `flex items-center gap-3` | Row layout |
| Checkbox | `h-5 w-5` | Touch target size |
| Urgency Badge | `px-2 py-0.5 text-xs rounded-full` | Label style |

### Accessibility
- Role: `list`
- Aria-label: "Task Overview"
- Checkbox labels: Include task text
- Urgency: Color + text label

### States
- Completed: Strikethrough + reduced opacity
- Hover: Highlight row
- Empty: Show "No tasks" message
- Loading: Checkbox skeleton

## Animation Guidelines

### Micro-interactions
- Checkbox: Spring animation on check
- Badge: Pulse on count change
- Loading: Smooth skeleton pulse
- Updates: Fade transition

### Focus Mode
- Non-focused: `opacity-20 transition-opacity`
- Focused: `opacity-100`
- Transition: `duration-300 ease-in-out`

## Responsive Behavior

### Grid Layout
| Breakpoint | Columns | Gap | Notes |
|------------|---------|-----|-------|
| Default | 1 | `gap-4` | Mobile first |
| md | 2 | `gap-6` | Tablet/small desktop |
| lg | 3 | `gap-6` | Large desktop |

### Widget Adaptations
- Stack all content vertically on mobile
- Maintain touch target sizes (min 44px)
- Preserve widget max-width
- Allow horizontal scroll for long content 