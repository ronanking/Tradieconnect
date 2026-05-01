# TradieConnect - Marketplace Platform

## Overview

TradieConnect is a full-stack web application that connects customers with tradespeople (tradies) for various home improvement and maintenance services. The platform serves as a marketplace where customers can post jobs, browse tradie profiles, and receive quotes, while tradies can showcase their work, bid on jobs, and manage their business profiles.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: PostgreSQL-backed sessions (connect-pg-simple)
- **API Design**: RESTful API with JSON responses

### Build and Development
- **Development**: Hot module replacement via Vite dev server
- **Production**: Static client build served by Express with API routes
- **Type Safety**: Shared TypeScript schemas between client and server
- **Code Quality**: ESLint and TypeScript strict mode

## Key Components

### Database Schema (Drizzle)
- **Users**: Core user accounts with role-based access (customer/tradie)
- **Tradie Profiles**: Extended profiles for tradespeople with ratings, experience, services
- **Jobs**: Customer job postings with categories, budgets, and requirements
- **Job Quotes**: Tradie responses to job postings
- **Reviews**: Customer feedback system for completed work
- **Work Photos**: Portfolio images for tradies to showcase their work
- **Messages**: Communication system between customers and tradies
- **Payments**: Transaction management (Stripe integration ready)

### User Interface Components
- **Navigation**: Responsive header with mobile menu support
- **Job Management**: Job posting modal with form validation and image upload
- **Tradie Discovery**: Browse and filter tradespeople by category and location
- **Profile Systems**: Detailed tradie profiles with portfolios and reviews
- **Search and Filtering**: Location-based and category-based filtering

### API Layer
- **User Management**: Registration, authentication, and profile management
- **Job System**: CRUD operations for job postings and quotes
- **Search and Discovery**: Filtered queries for tradies and jobs
- **Review System**: Rating and feedback mechanisms
- **Media Handling**: Image upload and storage for work portfolios

## Data Flow

### Customer Journey
1. Browse available tradies by category or location
2. Post job requirements with budget and timeline
3. Receive and evaluate quotes from interested tradies
4. Select tradie and manage project communication
5. Complete payment and leave reviews

### Tradie Journey
1. Create detailed profile with portfolio and services
2. Browse available jobs in their trade categories
3. Submit competitive quotes for relevant projects
4. Communicate with customers through integrated messaging
5. Complete work and receive payments and reviews

### Data Persistence
- All user data stored in PostgreSQL with proper relationships
- Session data persisted for authentication state
- File uploads handled via URL references (ready for cloud storage)
- Real-time updates through polling mechanisms

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon system
- **shadcn/ui**: Pre-built component library

### Development Tools
- **Vite**: Build tool with HMR and optimization
- **TypeScript**: Type safety across the stack
- **Zod**: Runtime type validation and schema generation
- **React Hook Form**: Form state management
- **TanStack Query**: Server state synchronization

### Backend Services
- **Neon**: Serverless PostgreSQL hosting
- **Drizzle**: Type-safe ORM with migrations
- **Express**: Web server framework
- **Stripe**: Payment processing (configured but not implemented)

## Deployment Strategy

### Development Environment
- Local development with Vite dev server proxy
- Hot module replacement for instant feedback
- Environment-based configuration
- Database migrations via Drizzle Kit

### Production Deployment
- Static client build served by Express
- Single-process deployment model
- Environment variable configuration
- Database migrations on deployment

### Scalability Considerations
- Stateless server design for horizontal scaling
- Database connection pooling ready
- CDN-ready static asset structure
- API rate limiting preparation

## Recent Changes
- July 16, 2025: Consolidated navigation to single responsive hotbar:
  - Unified multiple navigation sections into one responsive hotbar
  - Eliminated duplicate navigation bars across different screen sizes
  - Improved responsive design with adaptive icon display
  - Enhanced user experience with consistent navigation interface

- January 11, 2025: Transitioned from commission-based to subscription-based business model:
  - Removed 1.5% platform fees from all payment processing (checkout, contracts, banking)  
  - Updated pricing page to show subscription plans for tradies
  - Modified contract terms to reflect no additional transaction fees
  - Updated banking setup and join tradie pages to emphasize no commission fees
  - Enhanced value proposition with subscription model - tradies keep 100% of earnings

- January 11, 2025: Enhanced contract terms and conditions system:
  - Created comprehensive contract templates for different trade categories
  - Added detailed terms covering scope, materials, safety, compliance, warranties, and payment
  - Expanded customer and tradie contracts with professional legal frameworks
  - Included specific provisions for plumbing, electrical, building, and general maintenance
  - Added Australian Standards compliance requirements and licensing obligations
  - Enhanced dispute resolution, liability limitations, and force majeure clauses
  - Created contract template system for customizable terms based on job category

- January 11, 2025: Fixed Trust & Safety section icon display:
  - Replaced missing FontAwesome icons with reliable Lucide React icons
  - Updated Shield, FileCheck, and Lock icons for better consistency
  - Fixed icon imports to resolve display issues on home page
  - Maintained Trust & Safety section functionality with proper icon rendering

- January 10, 2025: Implemented comprehensive cybersecurity framework:
  - Added multi-layer rate limiting (API: 100/15min, Auth: 5/15min, Admin: 10/5min)
  - Built input sanitization middleware preventing XSS, SQL injection, and code injection
  - Implemented security headers (CSP, HSTS, X-Frame-Options, etc.)
  - Added AES-256 data encryption for sensitive information
  - Created password security with bcrypt (12 salt rounds)
  - Enhanced admin access security with IP whitelisting capability
  - Built real-time security monitoring and threat detection
  - Added comprehensive validation middleware for all user inputs
  - Implemented secure session management with automatic expiration
  - Created file upload security with type/size restrictions
  - Added security logging for failed attempts and suspicious activity
  - Built error handling that prevents information disclosure

## Recent Changes
- January 10, 2025: Implemented real-time job count system:
  - Created new API endpoint `/api/jobs/counts-by-category` to fetch active job counts by trade category
  - Built `useJobCounts` custom hook with 5-minute caching for efficient data fetching
  - Updated all category displays across home page, customer dashboard, and tradie dashboard
  - Replaced hardcoded "tradie counts" with dynamic "active jobs" data from database
  - Enhanced data accuracy by showing real job market demand instead of static numbers
  - Improved user experience with live data that reflects actual marketplace activity

- January 08, 2025: Implemented comprehensive performance optimizations:
  - Added React.memo to TradieCard and JobCard components for reduced re-renders
  - Implemented lazy loading for all non-critical pages with Suspense
  - Optimized React Query configuration with smart caching (5min stale, 10min GC)
  - Added lazy loading for FontAwesome icons to improve initial load time
  - Created LazyImage component with intersection observer for image optimization
  - Built virtual list hook for handling large data sets efficiently
  - Added HTTP caching headers for static assets (1 hour) and API responses (5 minutes)
  - Implemented proper error boundaries and retry logic for network requests
  - Created Terms of Service and Privacy Policy pages with proper routing

- January 08, 2025: Completed comprehensive contract system implementation:
  - Built complete database schema for contracts with digital signatures and expiration tracking
  - Created contract storage system with memory-based data management
  - Developed contract API routes for creating, viewing, signing, and managing contracts
  - Built interactive contract modal with HTML5 canvas digital signature capture
  - Created contracts page with filtering, status tracking, and dual contract types
  - Added contracts navigation link to main menu system
  - Implemented contract status management (pending, signed, expired)
  - Added IP address logging and comprehensive contract terms display
  - Enhanced blue color scheme to be more vibrant and less faded
  - Fixed navigation component nested anchor tag warnings

- January 07, 2025: Enhanced landing page with professional interactive elements:
  - Added announcement bar with promotional messaging
  - Integrated interactive search functionality with service and location inputs
  - Added comprehensive statistics section (15,000+ jobs, 8,500+ tradies, 4.8/5 rating)
  - Implemented customer testimonials with 5-star ratings and authentic reviews
  - Created trust & safety section highlighting verification, licensing, and security
  - Added final call-to-action section with gradient design
  - Enhanced hero section with benefit highlights (free posting, no upfront costs)
  - Improved FontAwesome icon integration and CSS import structure
  - Repositioned "How It Works" section for better user flow
  - Removed 24/7 support claims and optimized trust section layout
  - Created comprehensive feature roadmap for business viability (FEATURE_ROADMAP.md)

- January 07, 2025: Completed comprehensive messaging system and tradie category navigation:
  - Replaced announcement banner with 6 interactive tradie category icons
  - Added Messages icon to navigation header with notification badge (showing unread count)
  - Built complete messaging interface with real-time chat functionality
  - Implemented category-based filtering for Browse Tradies page
  - Created responsive icon grid with hover effects and tradie counts
  - Fixed naming conflicts between Lucide React icons and component names
  - Enhanced user flow from home page category selection to filtered tradie browsing
  - Added job context integration within messaging conversations

## Changelog
- July 03, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.