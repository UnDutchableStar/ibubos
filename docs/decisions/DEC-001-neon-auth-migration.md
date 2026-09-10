# DEC-001: Admin Authentication Migration to Neon Auth

## Status

Complete

## Impact

High

## Driver

@Ace

## Approver

@Ace

## Background

The project started with a single hard-coded admin account stored in environment variables: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `AUTH_SECRET`. This worked for a single user but had no way to add users, no password resets, no audit trail, and required env changes for every credential update.

Neon Auth (managed Better Auth) was already enabled on the production branch, providing a JWKS endpoint, `neon_auth` schema, and user/session tables. The goal was to replace the env-based auth with Neon Auth while keeping the existing `/admin/login` UI and protected admin routes.

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Keep env-based scrypt hash | Simple, no new dependencies | Single user, no management, no password reset, env changes for every update |
| Roll our own users table in `public` | Full control | More code to write, maintain, and secure (sessions, hashing, verification) |
| Use Neon Auth (Better Auth as a service) | Managed sessions, user table, password reset, role support; same Postgres instance | Adds a dependency; required SDK integration and wiring existing admin routes |

## Outcome

Selected Neon Auth.

Implemented:
- Installed `@neondatabase/auth`
- Added `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` to `.env`
- Created `src/lib/auth/server.ts` with `createNeonAuth`, `src/lib/auth/client.ts`, and `src/app/api/auth/[...path]/route.ts`
- Rewrote `src/lib/admin/auth.ts` to use `auth.getSession()` and check `user.role === 'admin'`
- Wired `src/app/admin/login/actions.ts` to `auth.signIn.email`
- Created the first admin user (`maartje@ibubos.nl`) and set role to `admin` via Neon MCP
- Removed old env-based `credentials.ts`, `session.ts`, `scripts/hash-password.ts`, and `auth:hash` package script

Sign-in flow now goes through Neon Auth, and the existing protected admin layout/routes still use `requireAdmin()`.

## Contributors

- Ace (user)
- Devin assistant

## Resources

- <https://neon.com/docs/auth/quick-start/nextjs-api-only>
- <https://neon.com/docs/auth/reference/nextjs-server>
- `src/lib/auth/server.ts`, `src/lib/admin/auth.ts`, `src/app/admin/login/actions.ts`

## Action Items

- Disable public sign-up at the provider level (or guard the app route) before deploying
- Add the production Vercel domain to Neon Auth trusted origins when the domain is known
- Remove legacy `AUTH_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD_HASH` from `.env` after end-to-end verification
