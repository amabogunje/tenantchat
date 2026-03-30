# TenantChat

TenantChat is an MVP multi-tenant SaaS platform for small businesses that want grounded AI customer support on WhatsApp. It combines onboarding, business-content ingestion, draft knowledge review, publish controls, Twilio WhatsApp sandbox routing, retrieval-based answers, and human escalation in a single Next.js application.

## MVP architecture

TenantChat is split into a few simple layers:

- Control plane: authenticated admin pages under `/app` for onboarding, channel setup, sources, knowledge review, conversations, escalations, and analytics.
- Execution plane: route handlers under `/app/api` for tenant config, ingestion, publishing, analytics, and Twilio inbound webhooks.
- Domain model: Prisma models for tenants, members, sources, extracted artifacts, published knowledge, channels, customers, conversations, messages, and escalations.
- LLM services: a small OpenAI Responses API wrapper in `lib/llm/service.ts` for structured extraction, intent classification, answer generation, and escalation summaries.
- Messaging adapters: Twilio WhatsApp helper in `lib/messaging/twilio.ts`, designed so Meta Cloud API can be added later behind the same abstraction.

## What the MVP supports

- Multi-tenant onboarding with email/password auth
- Industry pack selection for restaurant, barber, and mechanic businesses
- Tenant-scoped WhatsApp sandbox channel configuration
- Website URL intake and manual text/PDF/image transcript ingestion
- Draft extraction into profile, offerings, FAQs, policies, and retrieval chunks
- Review-and-publish workflow where runtime only uses published knowledge
- Inbound customer message handling with intent classification and grounded retrieval
- Human handoff with escalation summaries and dashboard visibility
- Seed data for three example tenants

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
5. Seed example tenants:
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
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_WHATSAPP_FROM`: sandbox WhatsApp sender, e.g. `whatsapp:+14155238886`
- `ENCRYPTION_KEY`: 32-character key for encrypting channel secrets at rest
- `APP_BASE_URL`: public base URL used to display webhook setup instructions

## Supabase/Postgres setup

1. Create a Postgres database in Supabase or locally.
2. Copy the connection string into `DATABASE_URL`.
3. Run `npm.cmd run db:push`.
4. If you want file storage later, wire Supabase Storage or S3 into `SourceDocument.storagePath` and replace the manual text ingestion shortcut used in this MVP.

## Twilio WhatsApp sandbox setup

1. Open the Twilio Console and enable the WhatsApp sandbox.
2. In TenantChat, open `/app/channel` and save the sandbox sender, account SID, and auth token.
3. Copy the inbound webhook URL shown on that page.
4. Paste it into the Twilio sandbox field for incoming messages.
5. Join the sandbox from a test phone and send a message.

## OpenAI setup

1. Add your `OPENAI_API_KEY` to `.env`.
2. Optionally set `OPENAI_MODEL`.
3. If the API key is missing, TenantChat still runs with fallback heuristic logic, but extraction quality and response grounding will be limited.

## Test accounts after seeding

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
- The messaging and industry layers are structured for future Meta Cloud API support and additional industry packs.
- Billing, advanced RBAC, bookings, and richer observability are intentionally left out of MVP scope.
