# Bell Track - Agent Guidelines

## Project Purpose
This project is designed to learn and practice:
- **Full-stack development** - Complete application architecture from database to UI
- **Next.js** - App Router, Server Components, API routes, and modern React patterns
- **tRPC** - End-to-end type safety, API design, and client-server communication

## Commands
- **Dev server**: `npm run dev` (Next.js with Turbopack on port 8080)
- **Build**: `npm run build` (Next.js with Turbopack)
- **Lint**: `npm run lint` (Biome check)
- **Format**: `npm run format` (Biome format --write)
- **Database**: `npm run db:studio` (Prisma Studio), `npm run db:seed` (seed database)

## Code Style
- **Formatting**: Biome (2 spaces, organize imports enabled)
- **TypeScript**: Strict mode, target ES2017, path aliases `@/*` for `./src/*`
- **Naming**: kebab-case filenames, camelCase variables/functions
- **Exports**: Named exports preferred over default exports
- **Types**: Use `type` over `interface`, const objects with `as const` instead of enums
- **Imports**: Group by external libraries, then internal (@/*), then relative
- **Components**: Named functions, arrow functions for internal handlers
- **UI Components**: Use shadcn/ui components from `src/components/ui/` instead of vanilla HTML elements (e.g., `<Button>` instead of `<button>`, `<Input>` instead of `<input>`)
- **Validation**: Zod schemas for API inputs and forms
- **Forms**: React Hook Form with proper error handling
- **API**: tRPC procedures with React Query integration
- **Error handling**: Basic error checks in API functions, form validation
- **Database**: Prisma ORM with proper schema relationships