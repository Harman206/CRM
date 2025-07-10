# ClientFlow - AI-Powered Client Management System

## Overview

ClientFlow is a modern web application designed for sales professionals and relationship managers to streamline client communication through AI-powered message generation. The system supports multi-channel outreach (email and LinkedIn) with intelligent follow-up scheduling and template management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with structured error handling

### Authentication & Session Management
- Session-based authentication using connect-pg-simple
- PostgreSQL session storage for scalability
- User management with email/username login

## Key Components

### Database Schema
The application uses a relational database with the following core entities:

1. **Users**: Authentication and profile management
2. **Clients**: Contact information and communication preferences
3. **Templates**: Reusable message templates with variable substitution
4. **Follow-ups**: Scheduled communications with priority levels
5. **Messages**: Communication history and tracking

### AI Integration
- **Provider**: OpenAI GPT-4o for message generation
- **Features**: 
  - Context-aware message generation
  - Multi-tone support (professional, formal, casual)
  - Channel-specific optimization (email vs LinkedIn)
  - Template-based generation with custom variables

### Communication Channels
- **Email**: SMTP integration with multiple provider support
- **LinkedIn**: Message composition and optimization
- **Unified Interface**: Single workflow for multi-channel outreach

### UI/UX Design
- **Design System**: Custom brand colors with neutral base palette
- **Components**: Comprehensive component library based on Radix UI
- **Responsive**: Mobile-first design with adaptive layouts
- **Accessibility**: WCAG-compliant components with proper ARIA labels

## Data Flow

### Client Management Flow
1. User creates/imports client profiles
2. System stores contact preferences and history
3. Dashboard provides overview of client relationships
4. Follow-up scheduling based on interaction patterns

### AI Message Generation Flow
1. User selects client and message type
2. AI analyzes context and client information
3. System generates personalized message content
4. User reviews, edits, and approves message
5. Message sent through preferred channel
6. Communication history updated

### Template Management Flow
1. Users create reusable templates by category
2. Templates support variable substitution
3. AI can use templates as starting points
4. Template analytics track usage and effectiveness

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **OpenAI API**: AI message generation capabilities
- **Email Services**: SMTP providers (Gmail, custom SMTP)

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **Replit Integration**: Development environment optimization
- **Vite Plugins**: Development experience enhancements

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon system
- **TailwindCSS**: Utility-first styling
- **React Hook Form**: Form validation and management

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency

### Environment Configuration
- Database connection via `DATABASE_URL`
- OpenAI API integration via `OPENAI_API_KEY`
- Email service configuration via SMTP environment variables
- Production vs development mode switching

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database access
- Environment variable support
- Static file serving capability

The application is designed for easy deployment on platforms like Replit, Vercel, or traditional VPS hosting with minimal configuration requirements.