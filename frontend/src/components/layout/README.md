# Layout Components

Core layout components for application structure and navigation.

## Header.tsx
Navigation header with:
- Vesper logo/brand
- Navigation links (Dashboard, Create Stream)
- WalletStatus on the right side
- Responsive mobile menu (if implemented)
- Fixed height for consistent spacing

## Footer.tsx
Application footer with:
- Copyright information
- Links to documentation
- Social media links (if applicable)
- Centered content

## Layout.tsx
Wrapper component providing:
- Header at the top
- Main content area (children)
- Footer at the bottom
- Consistent styling and spacing
- Responsive design for mobile/tablet/desktop
- Error boundary wrapper

All layout components use Tailwind CSS for styling and integrate with React Router for navigation.
