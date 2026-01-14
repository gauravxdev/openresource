---
description: How to set up and start the project locally
---

# Onboarding Workflow

Welcome to Openresource! This guide will help you get the project running on your local machine.

## 1. Prerequisites
Ensure you have the following installed:
- **Node.js**: Version 18 or higher.
- **PostgreSQL**: A running instance (local or remote).
- **Package Manager**: `npm` or `bun`.

## 2. Setting Up Environment Variables
Copy the example environment file:
```powershell
cp .env.example .env
```
Edit `.env` and provide your credentials:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: A random string for auth security.
- `BETTER_AUTH_URL`: `http://localhost:3000` (for local development).

## 3. Install Dependencies
```powershell
npm install
```

## 4. Initialize Database
Generate the Prisma client and push the schema to your database:
```powershell
npm run db:generate
npm run db:push
```

## 5. Launch Development Server
```powershell
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 6. Project Architecture Overview
- **`src/app`**: Next.js App Router (pages and layouts).
- **`src/server/api`**: tRPC backend logic and routers.
- **`src/components`**: React components (UI/UX).
- **`prisma/schema.prisma`**: Database schema definition.
- **`src/lib/auth.ts`**: Better Auth configuration.
