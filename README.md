# volue.prompts

Volue's internal AI Prompt Library - Find prompts for your department.

## Overview

This is Volue's curated collection of AI prompts organized by department. Browse, discover, and use prompts to enhance your productivity with AI tools like Microsoft 365 Copilot.

## Departments

- **Sales** - Prompts for customer outreach, proposals, and sales communication
- **Marketing** - Content creation, campaigns, and brand messaging
- **Engineering** - Code assistance, debugging, documentation, and technical writing
- **Product Management** - Product specs, user stories, roadmaps, and feature planning
- **Customer Support** - Customer responses, troubleshooting guides, and support documentation
- **Human Resources** - Job descriptions, policies, onboarding, and employee communications
- **Finance** - Financial reports, analysis, and business documentation
- **Operations** - Process documentation, workflows, and operational efficiency

## Features

- Browse prompts by department
- Run prompts directly in Microsoft 365 Copilot
- Light and dark mode support
- Search and filter prompts
- Create and share your own prompts

## Getting Started

### Prerequisites

- Node.js 24.x
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:push

# Seed the database with departments
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/prompts"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Icons**: Lordicon animated icons

## License

Internal use only - Volue AS
