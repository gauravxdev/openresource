---
description: How to make changes and contribute to the project
---

# Development Workflow

Follow these steps to add features or modify existing code in Openresource.

## 1. Modifying the Database Schema
If you need to add new tables or fields:
1. Update `prisma/schema.prisma`.
2. Push changes: `npm run db:push`.
3. Generate updated client: `npm run db:generate`.

## 2. Adding Backend Logic (tRPC)
1. Add new procedures in `src/server/api/routers/`.
2. Export the router in `src/server/api/root.ts` if creating a new file.
3. Access the API on the client:
   ```typescript
   import { api } from "@/trpc/react";
   const data = api.post.hello.useQuery({ text: "world" });
   ```

## 3. Creating UI Components
- Use **Tailwind CSS** for styling.
- Use **Radix UI** primitives for accessible components (located in `src/components/ui`).
- Place feature-specific components in `src/components/`.

## 4. Quality Checks
Before submitting changes, run the quality suite:
```powershell
# Run linting and type checking
npm run check

# Format code
npm run format:write
```

## 5. Adding New Resources
Data for resources like Android apps is currently located in `src/lib/android-apps-data.ts`. Update this file to add or modify items in the directory.
