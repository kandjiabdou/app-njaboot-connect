# replit.md

## Overview

This is a full-stack grocery store management system called "Njaboot Connect" built with React, TypeScript, Express.js, and PostgreSQL. The application serves both store managers and customers with different interfaces and features for each role.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared code:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/ui component library with Tailwind CSS
- **State Management**: React Query for server state, Context API for auth and cart
- **Routing**: Wouter for client-side routing

## Key Components

### Database Layer
- **Drizzle ORM**: Used for database schema definition and queries
- **PostgreSQL**: Primary database with Neon Database serverless support
- **Schema**: Comprehensive schema covering users, stores, products, inventory, orders, sales, and loyalty systems

### Authentication System
- Simple email/password authentication
- Role-based access control (manager vs customer)
- Local storage for session persistence
- Context-based auth state management

### Frontend Architecture
- **React Router**: Wouter for lightweight routing
- **State Management**: 
  - React Query for server state and caching
  - Context API for auth and shopping cart
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Express.js**: RESTful API server
- **Storage Layer**: Abstracted storage interface for database operations
- **Middleware**: JSON parsing, logging, error handling
- **API Routes**: Organized by feature (auth, products, orders, etc.)

## Data Flow

1. **Client Requests**: Frontend makes API calls using React Query
2. **API Layer**: Express.js routes handle requests and validation
3. **Storage Layer**: Abstracted storage interface manages database operations
4. **Database**: PostgreSQL stores and retrieves data via Drizzle ORM
5. **Response**: Data flows back through the same layers to the client
6. **State Management**: React Query caches responses and manages loading states

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React-DOM, React Query)
- UI components from Radix UI primitives
- Form handling with React Hook Form and Zod
- Date manipulation with date-fns
- Chart visualization with Recharts
- Utility libraries (clsx, class-variance-authority)

### Backend Dependencies
- Express.js for server framework
- Drizzle ORM with PostgreSQL support
- Neon Database serverless driver
- Development tools (tsx, esbuild, Vite)

### Build and Development Tools
- Vite for frontend development and building
- TypeScript for type safety
- Tailwind CSS for styling
- ESBuild for server-side bundling
- PostCSS for CSS processing

## Deployment Strategy

- **Development**: Uses Vite dev server with HMR for frontend, tsx for backend development
- **Production Build**: 
  - Frontend: Vite builds optimized static assets
  - Backend: ESBuild bundles server code
- **Deployment Target**: Configured for Replit autoscale deployment
- **Environment**: Node.js 20, PostgreSQL 16 modules
- **Port Configuration**: Server runs on port 5000, exposed on port 80

The application is designed to run in Replit's environment with specific configuration for their platform, including the cartographer plugin for development and runtime error overlays.

## Changelog
- June 23, 2025. Initial setup
- January 3, 2025. Brand color system implemented with design tokens and theme management

## User Preferences

Preferred communication style: Simple, everyday language.

## Brand Identity

### Official Colors
- **Primary**: Jaune (#FBB03B), Vert (#258C42)  
- **Secondary**: Noir (#041B26 ou #000000), Blanc (#FFFFFF), Gris (#E5E5E5)

### Theme System
- **Manager**: Dominant noir/jaune, navigation noir avec accents jaunes
- **Customer**: Dominant jaune/noir, navigation jaune avec accents verts
- Système automatique de thèmes basé sur le rôle utilisateur
- Variables CSS centralisées pour maintenance facile