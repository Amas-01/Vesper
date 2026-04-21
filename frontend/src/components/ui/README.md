# UI Primitives

Reusable UI components for consistent styling and interaction patterns across the application.

## Components

### Button.tsx
Primary button component with:
- Multiple variants: primary, secondary, danger
- Size options: sm, md, lg
- Disabled and loading states
- Icon support with optional icons
- Accessibility attributes

### Input.tsx
Text input component with:
- Label support
- Error state and messages
- Placeholder text
- Disabled state
- Optional icons
- Type support (text, email, number, password, etc.)

### Modal.tsx
Dialog modal component with:
- Overlay background with close on outside click
- Header with title
- Scrollable content area
- Footer actions with buttons
- Keyboard support (Escape to close)

### Badge.tsx
Small label badge component with:
- Multiple variants: primary, success, warning, error, info
- Size options: sm, md, lg
- Icon support

### Spinner.tsx
Loading spinner component with:
- Size options: xs, sm, md, lg
- Color variants
- Smooth rotation animation

### Toast.tsx
Notification toast component with:
- Auto-dismiss after timeout
- Multiple types: info, success, warning, error
- Close button
- Position management (top-right default)

### Skeleton.tsx
Placeholder skeleton loader with:
- Animated shimmer effect
- Width and height customization
- Rounded corners option

### AddressDisplay.tsx
Smart address display component with:
- Full address with copy-to-clipboard button
- Truncated mode (first 6 + last 4 characters)
- Clickable to open explorer link
- Tooltip on hover with full address

All primitives are built with Tailwind CSS and support TypeScript for full type safety.
