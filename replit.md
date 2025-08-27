# CampusAI - AI-Powered Student Learning Platform

## Overview

CampusAI is a comprehensive AI-powered learning platform designed to enhance student productivity and collaboration. The platform integrates multiple learning tools including AI-driven study planning, quiz generation, peer collaboration, idea sharing, and an intelligent learning assistant. Built with a modern TypeScript stack, it leverages Google's AI services and integrates with Google Classroom for seamless academic workflow management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Authentication**: Firebase Authentication with JWT token verification
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **API Design**: RESTful endpoints with structured error handling and request logging

### Database Layer
- **Database**: PostgreSQL as the primary data store
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Comprehensive schema covering users, study plans, quizzes, study groups, ideas, and notifications
- **Connection**: Neon serverless PostgreSQL for scalable cloud database hosting

### AI Integration
- **AI Provider**: Google Generative AI (Gemini) for content generation
- **Capabilities**: 
  - Automated quiz generation with customizable difficulty and subject matter
  - Intelligent study plan creation based on user preferences and schedules
  - Concept explanation and tutoring through the Learning Buddy feature
  - Study performance analysis and recommendations

### Authentication & Authorization
- **Primary Auth**: Firebase Authentication for secure user management
- **Token Strategy**: JWT-based authentication with Firebase ID tokens
- **Middleware**: Custom authentication middleware for API route protection
- **User Management**: Automatic user creation and profile management linked to Firebase accounts

### External Service Integrations
- **Google Classroom**: OAuth2 integration for importing assignments and course data
- **Firebase Services**: Authentication, potential push notifications, and user management
- **Google Fonts**: Typography integration for consistent visual design

### Development & Deployment
- **Development**: Hot module replacement with Vite dev server
- **Build Process**: Separate client and server builds with esbuild for server bundling
- **Environment**: Environment-based configuration for development and production
- **Code Quality**: TypeScript strict mode with comprehensive type checking

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **TypeScript**: Full TypeScript support across client and server
- **Build Tools**: Vite, esbuild, PostCSS with Tailwind CSS

### UI & Design System
- **Component Library**: Radix UI primitives for accessible components
- **Design System**: shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Icons**: Font Awesome for consistent iconography

### Backend Services
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Admin SDK for server-side auth verification
- **AI Services**: Google Generative AI (Gemini) for content generation
- **Session Storage**: PostgreSQL-backed session management

### Development Tools
- **Type Safety**: Zod for runtime type validation and schema generation
- **Data Fetching**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod resolvers
- **Date Manipulation**: date-fns for date formatting and calculations

### Third-party Integrations
- **Google APIs**: Classroom API for academic data integration
- **Firebase**: Authentication and potential notification services
- **Replit**: Development environment integration with specialized plugins