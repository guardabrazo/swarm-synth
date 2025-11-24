# GUARDABRAZO Style Guide
**Version 1.0**

A general-purpose design and architecture style guide for creative interactive applications. Use this guide to maintain consistency across projects while adapting to specific needs.

---

## Table of Contents

1. [Visual Design Language](#visual-design-language)
2. [UI Patterns](#ui-patterns)
3. [Architecture Principles](#architecture-principles)
4. [Technical Standards](#technical-standards)

---

## Visual Design Language

### Color Philosophy

Use a **monochromatic black-and-white aesthetic** with subtle grays for depth and hierarchy.

#### Core Palette
```scss
:root {
  --bg-color: #050505;           // Nearly black background
  --bg-subtle: #1a1a1a;          // Subtle backgrounds
  --border-dark: #333;           // Dark borders/dividers
  --border-light: #666;          // Lighter borders/hover states
  --text-primary: #fff;          // Primary text/accents
  --text-secondary: #eee;        // Secondary text
  --text-muted: #888;            // Tertiary/muted text
}
```

#### Usage Guidelines
- **Backgrounds**: Start with near-black (`#050505`)
- **Primary Elements**: White (`#fff`) for emphasis
- **Hierarchy**: Use grayscale progression for visual weight
- **Active States**: Invert (white bg + black text)
- **Borders**: `#333` for subtle, `#666` for interactive

### Typography

#### Font Selection
Choose **strict sans-serif fonts** for clean, technical aesthetics:
- Primary: Helvetica Neue, Arial, system sans-serif
- Avoid decorative or serif fonts unless conceptually required

#### Text Treatment
- **Case**: ALL UPPERCASE for UI elements
- **Spacing**: Base letter-spacing of `1px`, scale up for headers (`2px-4px`)
- **Weight**: Prefer normal/regular weight; use bold sparingly
- **Scale**: Progressive sizing from `0.5rem` (badges) to `0.9rem` (headers)

### Visual Details

#### Crosshair Cursor
Apply globally for technical, precision-focused feel:
```scss
body, button, input { cursor: crosshair; }
```

#### Subtle Grid Background
Add depth with minimal visual noise:
```scss
background: 
  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
background-size: 20px 20px;
```

#### Corner Brackets
Frame key containers with decorative corner elements using pseudo-elements

#### Gradient Dividers
Use for separation without harsh lines:
```scss
background: linear-gradient(90deg, transparent, #333, transparent);
```

### Interactive Elements

#### Buttons
- **Default**: Transparent bg, white border, white text
- **Hover**: White bg, black text
- **Active**: Same as hover
- **Transition**: Fast and subtle (`0.2s`)

#### Form Controls
- **Range Sliders**: 2px track, 8px white thumb
- **Select Dropdowns**: Black bg, uppercase text, border `#333`
- **Labels**: Small, uppercase, muted opacity

### Layout Principles

#### Structure
- **Header**: Logo/icon left, badge/version right
- **Footer**: Credits left, metadata right
- **Controls**: Group by function with labeled sections
- **Spacing**: Consistent gaps (`0.5rem` base, `1rem` - `2rem` sections)

#### Animation
- **Transitions**: Keep fast (`0.1s - 0.2s`)
- **Hover Effects**: Subtle scale (`1.1`), border color shifts
- **Avoid**: Transitions on frequently updating elements

### Responsive Design

#### Strategy
- Single breakpoint at `768px` (mobile vs desktop)
- Mobile: Vertical stacking, full-width controls, reduced padding
- Wide content: Horizontal scroll with custom scrollbar styling
- Priority: Maintain density and technical feel on all screens

---

## UI Patterns

### Interaction Principles

#### Direct Manipulation
- Immediate feedback on all interactions
- No confirmation dialogs unless destructive
- Click/drag for continuous actions

#### Keyboard Support
- Space bar for primary action (play/pause)
- Prevent default behaviors that interfere with UX
- Consider power users with shortcuts

### Component Organization

#### Sectioned Controls
Group related controls under labeled sections with visual separation (underline, spacing)

#### Labeled Parameters
Display current values alongside sliders/inputs for clarity

#### State Visualization
- **Current/Active**: White border, scale transform, z-index boost
- **Selected**: White bg, black text
- **Disabled/Muted**: Reduced opacity (`0.4 - 0.5`)
- **Hover**: Lighter borders, subtle highlights

### Icon Strategy

Use **Lucide React** (or similar minimal icon set):
- Consistent size (`14px` standard)
- Stroke-based for uniform weight
- White fill for clarity on dark backgrounds

---

## Architecture Principles

### State Management

#### Global State (Zustand)
- Single store for app-wide state
- Flat structure (avoid deep nesting)
- Co-locate actions with state
- TypeScript interfaces for type safety

```typescript
interface AppState {
  // State properties
  data: DataType;
  settings: SettingsType;
  
  // Actions
  updateData: (data: DataType) => void;
  updateSetting: (key: string, value: any) => void;
}
```

#### Principles
- Immutable updates (return new objects)
- Clear action naming
- Minimal, focused state shape

### Component Architecture

#### File Organization
```
src/
├── components/        // UI components
├── utils/            // Pure functions, helpers
├── App.tsx           // Main composition
├── store.ts          // Global state
└── index.scss        // Global styles
```

#### Component Structure
1. Imports (external → internal → types → styles)
2. Interface/Props definition
3. Hooks (store, state, effects)
4. Event handlers
5. Render logic

#### Best Practices
- Small, focused components
- Typed props (TypeScript interfaces)
- Extract complex logic to utilities
- Colocate related functionality

### Utility Functions

#### Characteristics
- **Pure**: No side effects, predictable output
- **Typed**: Clear input/output types
- **Testable**: Easy to unit test
- **Focused**: Single responsibility

#### Pattern
```typescript
export const createMatrix = (rows: number, cols: number): T[][] => {
  // Implementation
};
```

### External Systems Integration

For audio engines, graphics libraries, external APIs:

#### Approach
1. **Dedicated module**: Separate file (e.g., `audioEngine.ts`)
2. **Module-level instances**: Singletons at top level
3. **Async init**: User-triggered initialization
4. **Store sync**: Read from store with `getState()`, avoid writing to it

#### Pattern
```typescript
// External system instance
const engine = new ExternalSystem();

// Init function
export const init = async () => {
  await engine.start();
};

// Sync loop
engine.onTick(() => {
  const state = useStore.getState();
  engine.updateFromState(state);
});
```

---

## Technical Standards

### TypeScript

#### Strict Mode
Enable all strict checks for type safety:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

#### Type Everything
- Component props (interfaces)
- Function parameters and returns
- Store state shape
- Custom types and enums

### Naming Conventions

#### Files
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Styles: `camelCase.scss`

#### Code
- Booleans: `is`, `has`, `should` prefix
- Handlers: `handle` prefix
- Arrays: Plural nouns
- Constants: `UPPER_SNAKE_CASE`

### Code Quality

#### React Best Practices
- Hooks at top level
- Include all dependencies in arrays
- Extract complex logic to custom hooks
- Use `React.memo` for expensive renders
- `useCallback` for stable function references

#### Performance
- Avoid inline functions in loops
- Minimize re-renders with proper dependencies
- Disable transitions on high-frequency updates
- Optimize large lists with virtualization if needed

### Project Stack

#### Recommended Technologies
- **Framework**: Vite + React + TypeScript
- **Styling**: SCSS with CSS variables
- **State**: Zustand
- **Icons**: Lucide React
- **Build**: TypeScript compilation + Vite bundling
- **Deploy**: GitHub Pages (or similar static hosting)

#### Configuration
- TypeScript strict mode enabled
- ESM module system
- Mobile responsive (768px breakpoint)
- Organized folder structure

---

## Design Philosophy

### Visual Identity
- **Minimalist**: Black/white with subtle grays
- **Technical**: Precision aesthetic (crosshairs, grids, brackets)
- **Utilitarian**: Function first, refined details second
- **Consistent**: Uniform spacing, sizing, interactions

### Interaction Philosophy
- **Direct**: Immediate feedback, no unnecessary steps
- **Responsive**: Smooth, subtle animations
- **Accessible**: Keyboard support, clear states
- **Intuitive**: Progressive disclosure, grouped controls

### Code Philosophy
- **Type Safe**: Full TypeScript coverage
- **Pure Logic**: Testable utility functions
- **Clear Separation**: UI / Logic / External systems
- **Performance**: Optimized for smooth interactions (60fps target)

### Aesthetic Goals
- Premium, state-of-the-art feel
- Visual excellence and "wow factor"
- Dynamic, alive interfaces
- Smooth micro-animations for polish
- Avoid generic MVP aesthetics

---

## Quick Start Checklist

Starting a new project? Ensure:

**Visual**
- [ ] Black background (`#050505`), white accents
- [ ] Sans-serif font (Helvetica Neue)
- [ ] Uppercase text, `1px` letter-spacing
- [ ] Crosshair cursor
- [ ] Grid background on main container
- [ ] Corner bracket decorations
- [ ] Minimal button style (transparent, white border)

**Technical**
- [ ] Vite + React + TypeScript
- [ ] Zustand for state
- [ ] TypeScript strict mode
- [ ] Lucide React icons (`14px`)
- [ ] SCSS with CSS variables
- [ ] Organized folders (`components/`, `utils/`)
- [ ] Mobile responsive (`768px` breakpoint)

---

**Last Updated**: 2025-11-23  
**Version**: 1.0

