# TenantChat

TenantChat is a multi-tenant SaaS product for small businesses that want a grounded WhatsApp assistant. The current owner-facing experience is restaurant-first: a restaurant owner uploads their website, menu, flyers, and notes, reviews what the system understood, previews how customers can ask questions, and then goes live with lightweight daily updates.

## Product architecture

TenantChat is split into a few simple layers:

- Owner experience: authenticated restaurant pages under `/app/restaurant` for overview, setup, profile, menu, customer questions, conversations, daily updates, analytics, settings, onboarding, and assistant preview.
- System admin surface: authenticated pages under `/admin` for cross-tenant management and tenant-owned Twilio configuration.
- Execution plane: route handlers under `/app/api` for ingestion, publishing, analytics, conversations, and Twilio inbound webhooks.
- Vertical registry: shared registration and lookup in `verticals/shared`, with restaurant implemented as the first modular vertical in `verticals/restaurant`.
- Domain model: Prisma models for users, roles, tenants, members, sources, extracted artifacts, published knowledge, channels, customers, conversations, messages, and escalations.
- LLM services: a small OpenAI Responses API wrapper in `lib/llm/service.ts` for structured extraction, intent classification, answer generation, and escalation summaries.
- Messaging adapters: Twilio WhatsApp helper in `lib/messaging/twilio.ts`, designed so Meta Cloud API can be added later behind the same abstraction.

## Restaurant vertical model

The restaurant module defines:

- profile schema
- menu and service schema
- FAQ categories
- restaurant-specific intents
- restaurant-specific actions
- assistant behavior defaults
- onboarding prompts
- review rules
- preview questions
- daily update types

This keeps restaurant behavior inside `verticals/restaurant` so future verticals can plug in without rewriting the shared app shell.

## Operator model

TenantChat supports two authenticated roles:

- System admin: signs into `/admin`, can see every tenant, manage tenant-owned Twilio credentials, review platform readiness, and operate the shared SaaS.
- Tenant admin: signs into the restaurant owner experience under `/app/restaurant`, where they manage profile, menu, customer questions, conversations, daily updates, analytics, and settings.

Shared platform configuration:

- `OPENAI_API_KEY` remains a platform-level env var shared by all tenants.

Tenant-owned operational configuration:

- Twilio sender
- Twilio Account SID
- Twilio Auth Token
- Twilio webhook secret

Those Twilio values are managed from the system admin surface on a per-tenant basis.

## What the MVP supports

- Multi-tenant onboarding with email/password auth
- Restaurant-first owner experience with guided onboarding and chat-style preview
- Modular vertical registry with restaurant implemented as the first plugin
- Website URL intake and manual text/PDF/image transcript ingestion
- Draft extraction into profile, menu items, catering packages, FAQs, policies, and review items
- Confidence and source transparency in preview, review, and customer question flows
- Inbound customer message handling with intent classification and grounded retrieval
- Human handoff with escalation summaries and dashboard visibility
- Seed data for one system admin and three example tenant admins

## Tech stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth credentials auth
- OpenAI Responses API
- Twilio WhatsApp Sandbox
- Vitest

## Local setup

1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies:
   ```bash
   npm.cmd install
   ```
3. Generate the Prisma client:
   ```bash
   npm.cmd run db:generate
   ```
4. Push the schema to Postgres:
   ```bash
   npm.cmd run db:push
   ```
5. Seed example users and tenants:
   ```bash
   npm.cmd run db:seed
   ```
6. Start the app:
   ```bash
   npm.cmd run dev
   ```

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: local app URL, usually `http://localhost:3000`
- `NEXTAUTH_SECRET`: secret for Auth.js sessions
- `OPENAI_API_KEY`: required for live structured extraction and grounded answers
- `OPENAI_MODEL`: configurable Responses API model name
- `ENCRYPTION_KEY`: 32-character key for encrypting tenant secrets at rest
- `APP_BASE_URL`: public base URL used to display webhook setup instructions

Twilio note:

- Twilio credentials are tenant-specific in this MVP.
- System admins manage them from `/admin/tenants/[tenantId]`.
- Restaurant owners work inside `/app/restaurant/*` and only see business-friendly connection status and assistant settings.
- The platform does not rely on global `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, or `TWILIO_WHATSAPP_FROM` env vars for normal tenant runtime behavior.

## Twilio WhatsApp sandbox setup

1. Open the Twilio Console and enable the WhatsApp sandbox.
2. Sign in as a system admin and open `/admin/tenants/<tenantId>`.
3. Save the tenant's sandbox sender, account SID, and auth token.
4. Copy the inbound webhook URL shown there.
5. Paste it into the Twilio sandbox field for incoming messages.
6. Join the sandbox from a test phone and send a message.

## Seed accounts after seeding

- `platform@example.com` / `password123` for the system admin control plane
- `restaurant@example.com` / `password123`
- `barber@example.com` / `password123`
- `mechanic@example.com` / `password123`

## Tests

Run:

```bash
npm.cmd test
```

Current test coverage includes:

- extraction mapping normalization
- tenant scoping helper behavior
- lexical retrieval ranking

## Notes and extension points

- Runtime retrieval currently prefers published structured facts, then FAQs, then lexical chunk retrieval.
- Image uploads are stored conceptually in the domain model, but image OCR is intentionally lightweight for MVP and should be extended later.
- The vertical registry and shared workflow layers are structured for future barbershop, salon, and other service-business modules.
- Billing, advanced RBAC, bookings, and richer observability are intentionally left out of MVP scope.
