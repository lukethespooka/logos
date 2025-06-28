# Tailwind Utility Cheat Sheet

## Layout Patterns

### Card Container
```tsx
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
  {/* Card content */}
</div>
```

### Flex Row with Space Between
```tsx
<div className="flex items-center justify-between gap-4">
  {/* Row content */}
</div>
```

### Vertical Stack with Consistent Spacing
```tsx
<div className="space-y-4">
  {/* Stacked items */}
</div>
```

### Grid Layout (Responsive)
```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Grid items */}
</div>
```

## Typography Patterns

### Section Header
```tsx
<div className="space-y-1.5">
  <h2 className="text-lg font-semibold text-slate-900">
    {/* Title */}
  </h2>
  <p className="text-sm text-slate-500">
    {/* Description */}
  </p>
</div>
```

### List Item Text
```tsx
<span className="text-base text-slate-700 line-clamp-2">
  {/* List item content */}
</span>
```

### Metadata Text
```tsx
<span className="text-sm text-slate-400">
  {/* Metadata */}
</span>
```

## Interactive Elements

### Primary Button
```tsx
<button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
  {/* Button text */}
</button>
```

### Secondary Button
```tsx
<button className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
  {/* Button text */}
</button>
```

### Badge
```tsx
<span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
  {/* Badge text */}
</span>
```

### Checkbox Label
```tsx
<label className="flex items-center gap-3 text-base text-slate-700">
  <input type="checkbox" className="h-5 w-5 rounded border-slate-300" />
  {/* Label text */}
</label>
```

## Status Indicators

### Loading Skeleton
```tsx
<div className="animate-pulse rounded bg-slate-200 h-[20px]">
  {/* Skeleton content */}
</div>
```

### Error State
```tsx
<div className="rounded-lg border border-rose-500 bg-rose-50 p-4 text-sm text-rose-700">
  {/* Error message */}
</div>
```

### Success State
```tsx
<div className="rounded-lg border border-emerald-500 bg-emerald-50 p-4 text-sm text-emerald-700">
  {/* Success message */}
</div>
```

## Animation Classes

### Transition Defaults
```tsx
const transitions = {
  base: "transition-all duration-300 ease-in-out",
  fast: "transition-all duration-150 ease-in-out",
  slow: "transition-all duration-500 ease-in-out"
};
```

### Hover Effects
```tsx
const hoverEffects = {
  lift: "hover:-translate-y-1 hover:shadow-lg",
  highlight: "hover:bg-slate-50",
  glow: "hover:ring-2 hover:ring-offset-2 hover:ring-indigo-500"
};
```

### Focus States
```tsx
const focusStates = {
  primary: "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
  secondary: "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
};
```

## Responsive Patterns

### Container Constraints
```tsx
<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Responsive Text
```tsx
<p className="text-sm sm:text-base lg:text-lg">
  {/* Text content */}
</p>
```

### Responsive Spacing
```tsx
<div className="space-y-4 sm:space-y-6 lg:space-y-8">
  {/* Stacked content */}
</div>
```

## Accessibility Helpers

### Screen Reader Only
```tsx
<span className="sr-only">
  {/* Screen reader text */}
</span>
```

### Focus Ring
```tsx
<div className="focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
  {/* Focusable content */}
</div>
```

### Touch Target Size
```tsx
<button className="min-h-[44px] min-w-[44px]">
  {/* Button content */}
</button>
``` 