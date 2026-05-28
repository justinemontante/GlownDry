# GLOWNDRY

A premium laundry management platform with a customer mobile app, admin web dashboard, and shared REST API backend.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifacts/api-server, port 8080, served at /api)
- DB: PostgreSQL + Drizzle ORM (lib/db)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at lib/api-spec/openapi.yaml)
- Build: esbuild (CJS bundle)
- Web Admin: React + Vite (artifacts/glowndry, served at /)
- Mobile: Expo React Native (artifacts/mobile, served at /mobile)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all endpoints)
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (do not edit)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (do not edit)
- `lib/db/src/schema/` — Drizzle ORM table definitions
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/glowndry/src/` — Admin web app (React + Vite)
- `artifacts/mobile/app/` — Customer mobile app (Expo Router)
- `artifacts/mobile/context/AuthContext.tsx` — auth state management
- `artifacts/mobile/constants/colors.ts` — GLOWNDRY teal design tokens

## Architecture decisions

- **Contract-first API**: OpenAPI spec defined first, then Orval generates Zod validators and React Query hooks. Server uses `@workspace/api-zod` schemas for request validation; mobile client uses `@workspace/api-client-react` hooks.
- **Token-based auth**: Customers get a random 32-byte hex token stored in `customers.auth_token` on login. Mobile stores it in AsyncStorage via `setAuthTokenGetter`. Admin uses an in-memory Set for session tokens.
- **Password hashing**: Node.js built-in `crypto.pbkdf2Sync` (no extra dependencies). Salt stored alongside hash in the DB.
- **Status-driven notifications**: When booking status changes, a notification is automatically inserted for the customer.
- **Services seeded on startup**: Default laundry services (Regular Wash, Dry Clean, Express Wash, Delicate Care) are inserted automatically when the API starts with an empty services table.

## Product

- **Customer Mobile App**: Register/login, browse laundry services, book with date/time slot and weight, track order status through a 5-step progress tracker, receive notifications on status changes, manage profile.
- **Admin Web App**: Login with hardcoded credentials (admin@glowndry.com / glowndry2024), manage bookings/services/customers/payments/inventory/reports.
- **API**: Full REST CRUD for all entities + dashboard stats endpoint for the admin.

## User preferences

- GLOWNDRY teal palette: primary #18967f, background #f7fafa, tealDark #106b5c
- Philippine Peso (₱) currency formatting
- Admin credentials: admin@glowndry.com / glowndry2024

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `lib/api-spec/openapi.yaml`
- Do NOT change `info.title` in openapi.yaml — it controls generated file names
- DB push only works in dev: `pnpm --filter @workspace/db run push`
- Mobile's `setBaseUrl` is called at module level in `app/_layout.tsx` (outside component) using `EXPO_PUBLIC_DOMAIN`
- Zod schema naming convention: Orval generates `<OperationIdPascal>Body` for request bodies (e.g., `registerCustomer` → `RegisterCustomerBody`)
- The `sql` template tag from drizzle-orm is needed for arithmetic updates (e.g., `totalOrders + 1`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
