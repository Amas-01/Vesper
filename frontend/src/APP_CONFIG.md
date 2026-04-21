# App Configuration

Main application entry point with routing and global setup.

## App.tsx

Complete application setup including:

### Features
- **React.lazy() Code Splitting**: Pages are dynamically imported for better performance
  - Home, Dashboard, CreateStream,StreamDetail
  - Placeholder pages: Payroll, Governance, Analytics
  
- **BrowserRouter**: Client-side routing setup
  - React Router v6 configuration
  - Nested routes using Layout wrapper
  
- **Layout Wrapper**: All routes wrapped in Layout component
  - Ensures header/footer/layout consistent across pages
  - Centralized navigation
  
- **Suspense Fallback**: Loading screen during page transitions
  - Shows spinner and "Loading Vesper..." message
  - Smooth user experience

### Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Landing page |
| `/dashboard` | Dashboard | View all streams |
| `/create` | CreateStream | Create new stream |
| `/stream/:id` | StreamDetail | View stream details |
| `/payroll` | Payroll | Future feature placeholder |
| `/governance` | Governance | Future feature placeholder |
| `/analytics` | Analytics | Future feature placeholder |

### Dark Mode
- Dark mode applied globally on app load
- Dark mode CSS classes: `dark:` prefix in Tailwind

### Integration Points
- Works with `@stacks/connect` for wallet connection
- Environment-aware: respects VITE_NETWORK setting
- Uses Zustand stores for state management
