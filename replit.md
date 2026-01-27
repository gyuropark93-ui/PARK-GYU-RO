# Replit.md

## Overview

This is a React-based portfolio/showcase application featuring a cinematic subway platform theme. The application allows visitors to browse projects organized by year (2023-2026) through an interactive SPA experience. It includes a public-facing project gallery and an admin CMS for managing project content. The backend uses Express with PostgreSQL via Drizzle ORM, while Supabase provides additional database, authentication, and storage capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Server**: Express.js running on Node.js
- **API Pattern**: REST API with typed route definitions in `shared/routes.ts`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod for runtime type validation, drizzle-zod for schema-to-validation bridge

### Data Storage
- **Primary Database**: PostgreSQL (accessed via DATABASE_URL environment variable)
- **Secondary/External**: Supabase for projects table, authentication, and file storage
- **Schema Location**: `shared/schema.ts` contains Drizzle table definitions

### Authentication
- **Admin Authentication**: Supabase Auth with email/password
- **Public Access**: No authentication required for viewing projects
- **RLS Pattern**: Supabase Row Level Security - public SELECT allowed, authenticated users can INSERT/UPDATE/DELETE

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including shadcn/ui
    hooks/        # Custom React hooks
    lib/          # Utilities and client configs
    pages/        # Page components (Home, Admin, NotFound)
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route registration
  storage.ts      # Database storage layer
  db.ts           # Drizzle database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle table definitions
  routes.ts       # Typed API route definitions
```

### Build & Development
- **Development**: `npm run dev` runs tsx for server with Vite middleware for HMR
- **Production Build**: Custom build script using esbuild for server, Vite for client
- **Database Migrations**: `npm run db:push` uses drizzle-kit push command

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Supabase**: Used for project data with two tables:
  - `projects`: id (uuid), year (int), title (text), cover_url (text), created_at (timestamp)
  - `project_blocks`: id (uuid), project_id (uuid FK), sort_order (int), type (text: image|text|video|grid), data (jsonb), created_at (timestamp)

### Authentication & Storage
- **Supabase Auth**: Email/password authentication for admin access
- **Supabase Storage**: File storage for project thumbnails

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous/public key

## Recent Changes

### January 27, 2026 (Latest)
- **Safari transition video support** - Browser-specific video formats
  - Safari (desktop/iOS): MP4 files with HEVC/H.265 codec
  - Chrome/Edge/Firefox: WebM VP9 with alpha channel
  - Browser detection excludes iOS Chrome/Edge/Firefox (CriOS/EdgiOS/FxiOS)
- **Preloader with progress bar** - Initial asset loading screen
  - Full-screen overlay at z-100 with dark zinc-950 background
  - Progress bar showing percentage (0-100%)
  - Preloads: both transition videos + all year background images
  - Minimum 400ms display time, then fades out
- **Asset preloading** - Smoother first interaction
  - Transition videos (forward + back) preloaded before main content
  - Year images (/assets/idle_2023-2026.png) preloaded
- **Editor dropdown flicker fix** - Stable hover state while menus open
  - TipTapEditor tracks open menu state via onMenuOpenChange callback
  - BlockWrapper ignores onMouseLeave when editor menu is open

### January 26, 2026
- **Rich Text Editor Upgrade** - Behance-style toolbar with full formatting options
  - Heading dropdown (Paragraph, H1, H2, H3)
  - Font family dropdown (Helvetica, Inter, Pretendard)
  - Font size dropdown (12-48px)
  - Bold, Italic, Underline with keyboard shortcuts (Ctrl+B/I/U)
  - Text alignment (left, center, right)
  - Bullet list, Numbered list
  - Link insert/edit popover
  - Clear formatting button
  - Stores TipTap JSON in data.json, renders correctly on public pages
- **Immediate UI updates** - Uploads and embeds now appear instantly without refresh
  - Image block: uploaded images show immediately after upload completes
  - Grid block: added images appear instantly
  - Video block: pasting URL instantly updates input, embedUrl, and preview
  - Local state is now the single source of truth, synced to DB on Save
- **Improved Video blocks** - YouTube/Vimeo URL auto-conversion, lazy preview, secure iframe sandbox
  - Paste any YouTube/Vimeo URL (watch, shorts, youtu.be, embed) and it's auto-converted
  - Lazy preview with "Load Preview" button for performance
  - Aspect ratio selector (16:9, 4:3, 1:1)
  - Secure iframe with proper sandbox attributes
- **Removed Draft/Published status** - Projects save immediately and are always visible on public site
- **Fixed block action buttons** - Actions now show on hover OR selection (desktop), selection only (mobile)
- **Improved click-outside-to-deselect** - Safe document-level handler that respects blocks, inspector panel, and bottom sheet
- **Simplified grid blocks** - Uniform grid only with columnsDesktop, columnsMobile, gap settings
- **Mobile scrolling** - Native feed-like scrolling with 100dvh, overflow-y-auto, overscroll-contain

### January 26, 2026 (Earlier)
- Added interactive subway platform year navigation with video transitions
- Central "CLICK HERE" button opens project overlay for current year (year indicator is display-only)
- Behance-style Admin CMS with project builder:
  - /admin - Project list grouped by year
  - /admin/projects/new - Create new project
  - /admin/projects/:id - Project builder with content blocks
- Content blocks: Image, Text, Video, Grid, Divider, Spacer with reordering
- Supabase integration for projects and project_blocks tables
- Forward/backward transition videos with alpha transparency support
- Year switches at midpoint of transition videos (45% for forward, 50% for backward)

### Key NPM Packages
- `@supabase/supabase-js`: Supabase client for auth, database, and storage
- `drizzle-orm` + `drizzle-kit`: Database ORM and migration tooling
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Headless UI primitives for accessible components
- `wouter`: Lightweight client-side routing