# Dystopian UI Design Rules

When implementing a dystopian UI, follow these specific design patterns:

## 1. Typography
- Use `font-mono` for all text elements
- Apply `uppercase` to labels and headers
- Use `tracking-wider` or `tracking-tight` for dramatic spacing
- Implement hierarchical sizing with dramatic contrasts

## 2. Color Scheme
- Muted, desaturated colors with `/80`, `/60`, `/40` opacity modifiers
- Heavy use of `text-foreground/80` for primary text
- `text-muted-foreground` for secondary information
- Strategic use of `text-primary` for emphasis (sparingly)

## 3. Text Formatting
- Use `::` separator pattern for labels (e.g., `TOKEN::PREVIEW`, `CREATOR::IDENTITY`, `IDENTITY::WARNING`)
- Square brackets for unknown/hidden values: `[UNNAMED]`, `[REDACTED]`, `[???]`
- All caps for status messages: `AWAITING::INPUT`, `VERIFIED::HUMAN`, `IDENTITY::HIDDEN`
- Underscore separator for multi-word status: `FILL_FORM_TO_PREVIEW`

## 4. Visual Elements
- Dark icons like `<Logo />` for empty states and warnings
- Glowing/blur effects: `bg-primary/20 blur-xl` for atmospheric lighting
- Border styling: `border-2`, `border-dashed` or similar
- Backdrop blur: `backdrop-blur-sm` on cards

## 5. Card Design
```tsx
<Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
  <CardHeader className="pb-4 border-b">
    <CardTitle className="text-lg font-mono uppercase tracking-wider">SECTION::TITLE</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## 6. Interactive Elements
- Hover effects with glow: `group-hover:opacity-100` on blur overlays
- Transition effects: `transition-colors`, `transition-opacity`
- Destructive variants for warnings
- Muted borders and backgrounds

## 7. Layout Patterns
- Heavy use of borders: `border-t`, `border-b` for section separation
- Generous spacing with `space-y-6`, `gap-4`
- Nested relative/absolute positioning for overlay effects

## 8. Common Components

### Empty State
```tsx
<div className="text-center py-8">
  <Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
  <p className="font-mono text-sm uppercase text-muted-foreground">
    AWAITING::INPUT
  </p>
  <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
    INSTRUCTION_MESSAGE_HERE
  </p>
</div>
```

### Identity Display
```tsx
<div className="pt-4 border-t">
  <p className="text-xs font-mono text-muted-foreground mb-3 uppercase">SECTION::LABEL</p>
  <div className="flex items-center gap-3">
    {/* Avatar with glow effect */}
    <div className="relative">
      <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      {/* Avatar content */}
    </div>
    <div>
      <p className="font-mono text-sm uppercase">{value || "[UNKNOWN]"}</p>
      <p className="font-mono text-xs uppercase text-muted-foreground">STATUS::MESSAGE</p>
    </div>
  </div>
</div>
```

### Warning/Alert
```tsx
<Alert variant="destructive">
  <Logo className="h-4 w-4" />
  <AlertTitle className="font-mono uppercase">CATEGORY::WARNING</AlertTitle>
  <AlertDescription className="font-mono text-xs uppercase">
    WARNING MESSAGE IN ALL CAPS.
  </AlertDescription>
</Alert>
```

## 9. Key Principles
- Favor monospace typography throughout
- Use uppercase extensively but purposefully
- Create visual hierarchy through opacity, not just size
- Implement subtle glow/blur effects for depth
- Maintain consistent `::` notation for categorization
- Use brackets `[]` for placeholder/unknown values
- Keep color palette muted and industrial

## 10. Example Implementation

### Page Header
```tsx
<h1 className="text-4xl font-bold font-mono uppercase tracking-wider text-foreground/80">
  SECTION::TITLE
</h1>
```

### Data Display with Glow
```tsx
<div className="relative">
  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
  <img
    src={imageUrl}
    alt="Token"
    className="relative w-20 h-20 rounded-lg object-cover border-2"
  />
</div>
```

### Status Text
```tsx
<p className="font-mono text-xs uppercase text-muted-foreground">
  VERIFIED::HUMAN
</p>
```

This creates a cohesive dystopian aesthetic that feels like a terminal interface from a cyberpunk future, with clear information hierarchy despite the stylistic constraints.