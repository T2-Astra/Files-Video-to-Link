# MediaCraft File Sharing Application
cdccsdfddfvd
## Overview

MediaCraft is a full-stack file sharing application built with a React frontend and Express.js backend. The application allows users to upload, preview, share, and download files with support for various media types including images, videos, and documents. It features a modern UI built with shadcn/ui components and Tailwind CSS, providing an intuitive drag-and-drop upload experience and shareable file links.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Build System**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing with support for file sharing URLs
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for consistent theming and responsive design
- **File Upload**: React Dropzone for drag-and-drop file upload functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **File Storage**: Local filesystem storage with multer for multipart form handling
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Processing**: Built-in support for file archiving using the archiver library

### Data Storage Solutions
- **Database**: PostgreSQL as the primary database, configured through Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL) for cloud hosting
- **File Storage**: Local filesystem storage in an uploads directory
- **Schema Management**: Drizzle Kit for database migrations and schema management

### API Design
- **File Management**: RESTful endpoints for uploading, retrieving, and deleting files
- **File Sharing**: Public sharing endpoints with unique share IDs for secure file access
- **Bulk Operations**: Support for downloading all files as a compressed archive
- **File Preview**: Direct file serving for media preview capabilities

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **File Access**: Public access through share IDs without user accounts
- **Security**: File access controlled through unique, non-guessable share identifiers

### Development and Build Pipeline
- **Development**: Vite dev server with hot module replacement and error overlay
- **Production Build**: Vite build for frontend, esbuild for backend bundling
- **Type Checking**: TypeScript compilation across shared schemas and types
- **Path Aliases**: Configured aliases for clean imports (@/, @shared/, @assets/)

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL provider for cloud database hosting
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL operations
- **Drizzle Kit**: Database migration and schema management tools

### UI and Component Libraries
- **Radix UI**: Headless UI primitives for accessible component foundations
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form handling with validation support
- **React Dropzone**: File upload with drag-and-drop functionality

### Development Tools
- **Vite**: Build tool and development server with HMR support
- **esbuild**: Fast JavaScript bundler for production builds
- **Tailwind CSS**: Utility-first CSS framework for styling
- **TypeScript**: Static type checking and modern JavaScript features

### File Processing Libraries
- **Multer**: Middleware for handling multipart/form-data file uploads
- **Archiver**: Library for creating compressed file archives
- **Mime Types**: MIME type detection and file type handling

### Replit Integration
- **Vite Plugins**: Replit-specific plugins for error handling, development banner, and cartographer integration
- **Runtime Error Modal**: Development error overlay for better debugging experience
