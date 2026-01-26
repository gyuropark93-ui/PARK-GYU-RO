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
- **Supabase**: Used for the `projects` table with fields: id (uuid), year, title, thumbnail_url, video_url (optional), description, created_at

### Authentication & Storage
- **Supabase Auth**: Email/password authentication for admin access
- **Supabase Storage**: File storage for project thumbnails

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous/public key

## Recent Changes

### January 26, 2026
- Added interactive subway platform year navigation with video transitions
- Implemented year-based project browsing (click year indicator to view projects)
- Added Admin CMS at /admin route for managing projects
- Supabase integration for projects table, authentication, and storage
- Forward/backward transition videos with alpha transparency support
- Year switches at midpoint of transition videos (45% for forward, 50% for backward)

### Key NPM Packages
- `@supabase/supabase-js`: Supabase client for auth, database, and storage
- `drizzle-orm` + `drizzle-kit`: Database ORM and migration tooling
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Headless UI primitives for accessible components
- `wouter`: Lightweight client-side routing