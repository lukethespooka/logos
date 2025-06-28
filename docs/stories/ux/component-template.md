# Component Template

This template demonstrates how to structure new components following LogOS UX standards.

## Basic Component Structure

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface IComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title displayed in the component header */
  title: string;
  /** Optional description text */
  description?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error;
}

/**
 * Component description and usage guidelines.
 * 
 * @example
 * ```tsx
 * <Component title="My Component" description="Optional description">
 *   Content goes here
 * </Component>
 * ```
 */
const Component = React.forwardRef<HTMLDivElement, IComponentProps>(({
  title,
  description,
  isLoading,
  error,
  className,
  children,
  ...props
}, ref) => {
  // State management
  const [isHovered, setIsHovered] = React.useState(false);

  // Event handlers
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Render loading state
  if (isLoading) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-6 shadow-md",
          className
        )}
        {...props}
      >
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-rose-500 bg-rose-50 p-6",
          className
        )}
        role="alert"
        {...props}
      >
        <p className="text-sm font-medium text-rose-700">
          {error.message}
        </p>
      </div>
    );
  }

  // Main render
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-md",
        "transition-all duration-300 ease-in-out",
        isHovered && "shadow-lg",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Header */}
      <div className="space-y-1.5 mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
});

Component.displayName = "Component";

export default Component;
```

## Usage Example

```tsx
import Component from "./Component";

export default function MyPage() {
  return (
    <Component
      title="My Component"
      description="This is an example component"
      className="max-w-[360px]"
    >
      <p className="text-base text-slate-700">
        Content goes here
      </p>
    </Component>
  );
}
```

## Key Features

1. **Proper TypeScript Types**
   - Extends HTML attributes
   - Documents props with JSDoc
   - Uses strict types

2. **Accessibility**
   - Semantic HTML structure
   - ARIA roles where needed
   - Error announcements
   - Keyboard interaction

3. **Loading States**
   - Skeleton loading UI
   - Maintains layout structure
   - Smooth animations

4. **Error Handling**
   - Visual error states
   - Accessible error messages
   - Clear user feedback

5. **Styling**
   - Follows design system
   - Consistent spacing
   - Proper animation
   - Responsive design

6. **Best Practices**
   - Forward refs
   - Display name
   - Props spreading
   - className merging

## Testing Template

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Component from "./Component";

describe("Component", () => {
  it("renders successfully", () => {
    render(
      <Component title="Test Title">
        Content
      </Component>
    );
    
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <Component
        title="Test Title"
        isLoading
      >
        Content
      </Component>
    );
    
    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    // Check for skeleton UI
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(
      <Component
        title="Test Title"
        error={new Error("Test error")}
      >
        Content
      </Component>
    );
    
    expect(screen.getByText("Test error")).toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });
});
``` 