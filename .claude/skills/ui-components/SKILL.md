---
name: ui-components
description: Build UI with shadcn/ui components, Tailwind CSS 4, and project design patterns. Use when creating user interfaces, styling components, or following design conventions.
---

# UI Components

## Methodology - ALWAYS FOLLOW

Before implementing any UI changes:

### Step 1: Ask Clarifying Questions
- What existing components can be reused?
- Is this for a specific page or reusable component?
- Does this need dark mode support?
- What loading/error states are needed?
- Are there accessibility requirements?

### Step 2: Enter Plan Mode
Use `EnterPlanMode` to create a detailed implementation plan:
- Review existing similar components
- Check shadcn/ui for available components
- Plan component hierarchy
- Consider responsive design
- Document interaction states

### Step 3: Deep Analysis (Extended Thinking)
Think deeply about:
- Component composition patterns
- State management approach
- Performance (memoization needs)
- Accessibility (ARIA, keyboard nav)
- Dark mode compatibility

### Step 4: Get User Approval
Present the plan and wait for explicit approval before any implementation.

---

## Key Files

| Component | Location |
|-----------|----------|
| shadcn/ui | `src/components/ui/` |
| Rich Text Editor | `src/components/rich-text-editor/` |
| Uploader | `src/components/uploader/` |
| User Menu | `src/components/user-menu/` |
| Step Progress | `src/components/step-progress/` |
| Styles | `src/styles/index.css` |
| Utils | `src/lib/utils.ts` |

---

## ALWAYS Use shadcn/ui Components

### Available Components (30+)

**Layout**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`
- `Separator`, `Sidebar`

**Forms**
- `Input`, `Textarea`, `Label`, `Checkbox`, `Select`
- `Calendar` (date picker)
- `Toggle`, `ToggleGroup`

**Feedback**
- `Badge` (variants: default, secondary, outline, destructive)
- `Button` (variants: default, secondary, outline, ghost, destructive)
- `StatefulButton` (loading/success states)
- `Skeleton` (loading)
- `Sonner` (toast notifications)

**Overlays**
- `Dialog`, `Sheet`, `Drawer`
- `DropdownMenu`, `Tooltip`, `Popover`

**Navigation**
- `Tabs`, `Breadcrumb`
- `Collapsible`

**Display**
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Table`
- `Kbd`, `KbdGroup`

---

## Usage Patterns

### Card Section (GOOD)
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

<Card className="rounded-3xl shadow-lg">
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge variant="secondary">Tag</Badge>
  </CardContent>
</Card>
```

### Card Section (BAD - Don't do this)
```tsx
// DON'T build from scratch
<div className="border rounded-3xl shadow-lg">
  <div className="px-6 py-4 border-b">
    <h2>Section Title</h2>
  </div>
</div>
```

---

## Color Palette

### ALWAYS Use Semantic Colors

```tsx
// GOOD - Use CSS variables via Tailwind
<div className="bg-background text-foreground">
<div className="bg-card border-border">
<button className="bg-primary text-primary-foreground">
<span className="text-muted-foreground">
<div className="bg-primary/10 text-primary">  // With opacity

// BAD - Hardcoded colors
<div className="bg-white text-black">
<button className="bg-purple-600 text-white">
```

### Available Semantic Colors
| Variable | Usage |
|----------|-------|
| `--background` / `--foreground` | Page background and text |
| `--card` / `--card-foreground` | Card surfaces |
| `--primary` / `--primary-foreground` | Primary actions, links |
| `--secondary` / `--secondary-foreground` | Secondary elements |
| `--muted` / `--muted-foreground` | Subtle backgrounds, secondary text |
| `--accent` / `--accent-foreground` | Highlighted elements |
| `--destructive` / `--destructive-foreground` | Errors, delete actions |
| `--border` | Borders and dividers |
| `--input` | Form input borders |
| `--ring` | Focus rings |
| `--chart-1` to `--chart-5` | Data visualization |

---

## Custom Components

### Rich Text Editor (TipTap)
```tsx
import Editor from "@/components/rich-text-editor/Editor";
import type { JSONContent } from "@tiptap/react";

// Editable
<Editor
  content={initialContent}
  value={value}
  onChange={(json: JSONContent) => setValue(json)}
/>

// Read-only
<Editor
  content={savedContent}
  value={savedContent}
  readOnly
/>
```

### File Uploader
```tsx
import { Uploader } from "@/components/uploader";

<Uploader
  accept="image/*"
  maxSize={10 * 1024 * 1024}
  onUpload={(file) => handleUpload(file)}
/>
```

### Step Progress
```tsx
import { StepProgress } from "@/components/step-progress";

<StepProgress
  steps={["Details", "Images", "Invites", "Review"]}
  currentStep={2}
/>
```

---

## Utilities

### cn() for Conditional Classes
```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" ? "primary-styles" : "secondary-styles"
)} />
```

### Toast Notifications
```tsx
import { toast } from "sonner";

// Success
toast.success("Event created successfully!");

// Error
toast.error("Failed to save changes");

// Loading
toast.loading("Saving...");
```

---

## Dark Mode

### Implementation
- Uses `next-themes` library
- Toggle via `.dark` class on `<html>`
- All semantic colors have dark variants

### Testing
Always test both light and dark modes when building UI.

---

## Tailwind CSS 4

### Key Features
- Config generated from `src/styles/index.css`
- CSS-first configuration
- Native cascade layers

### Common Patterns
```tsx
// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hover states
<button className="hover:bg-primary/90">

// Focus states
<input className="focus:ring-2 focus:ring-ring">

// Transitions
<div className="transition-colors duration-200">
```

---

## Accessibility Checklist

- [ ] Use semantic HTML elements
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Test with screen readers
- [ ] Maintain sufficient color contrast
- [ ] Provide focus indicators
- [ ] Handle loading/error states

---

## Performance Tips

- Use `React.memo()` for expensive renders
- Lazy load heavy components
- Use `Skeleton` for loading states
- Avoid inline function definitions in JSX
- React Compiler handles most optimizations automatically
