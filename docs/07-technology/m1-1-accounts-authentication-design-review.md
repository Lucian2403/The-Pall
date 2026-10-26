# M1.1 — Accounts & Authentication: design review (PROPOSED)

**Date:** 2026-10-26. **Status: PROPOSED / NOT APPROVED FOR IMPLEMENTATION.** This is the next functional gate after M0. No auth provider, identity policy, or numeric limit is approved by creating this document.

## Purpose

A player securely creates/accesses **one account** that can own **characters**, selects their own active character, and safely resumes that character's server-owned state. This must precede hooking the Millhand workshop into production character state. The approved character-creation mechanics, six backgrounds and +3 skill bonuses remain unchanged; see [Character creation](../01-player/character-creation.md) and [Shared onboarding](../05-gameplay/onboarding/shared-structure.md).

## Proposed account journey

1. Game landing page: `Sign in` / `Create account`.
2. Create and verify account identity using a selected provider/method (decision pending).
3. Secure authenticated session; access **only** owned characters.
4. Character selection. If no characters exist, go to character creation.
5. Create a character from approved fields: name, Male/Female, one of the six backgrounds. Provision starting attributes, origin Major Skill +3, common starter kit + 20 coins **exactly once** in an atomic DB operation.
6. Return to character list. Choose character to enter approved background-specific intro and location.
7. Sign out; revocation / expiry blocks protected APIs.

**Important separation:** M1.1 implements account identity and session protection, *not* character creation UI, intro text, or gameplay. Steps 4–6 establish the interfaces that M1.2 and M1.3 will implement.

## Decisions needing approval before implementation

| Decision | Default suggestion (NOT locked) | Reason / trade-off |
| --- | --- | --- |
| Authentication entry method | Email + password; email confirmation and reset flow; assess passkeys as later feature | Familiar login, but entails delivery, support, abuse control and password handling |
| Authentication provider | Evaluate managed auth vs vetted library before commitment | Avoid inventing custom password/session cryptography or binding to a paid service blindly |
| Display/character identities | Account identity private; character display name separate | Supports multiple characters and in-world aliases |
| Character slot count | **Open**; select before M1.2 | Impacts schema, monetization, UX and risk of throwaway character exploits |
| Character naming rules | **Open**; select before M1.2 | Impacts moderation, uniqueness and look-alike names |
| Character deletion/recovery | **Open**; no deletion endpoint until decided | Avoid accidental permanent loss |
| Multiple login sessions | **Open**; recommend support for revocation | Account security and recovery implications |
| Account recovery / email changes | **Open**; require secure design | Risk of account takeover and customer support |
| Age/access, moderation and privacy | To be addressed before public launch | Legal and operations obligations vary by jurisdiction |

## Recommended technical candidate (review pending, 2026-10-26)

**My proposal: self-hosted Better Auth**, wired into the current **Fastify API**, **SvelteKit client** and **existing PostgreSQL**. This is a candidate, **not an approved dependency or implementation commitment**. The library has official integration documentation for Fastify (https://better-auth.com/docs/integrations/fastify), SvelteKit (https://better-auth.com/docs/integrations/svelte-kit), and PostgreSQL using the `pg` Pool (https://better-auth.com/docs/adapters/postgresql). It supports email/password, session management, verification and recovery features; verify exact version, cookie/CORS and migration behaviour during implementation.

**Why this candidate:** minimum new infrastructure; accounts remain in our own Postgres database; compatible with existing TypeScript stack; no per-active-user identity SaaS bill. The cost is that **we own security patching, outbound transactional email, abuse controls, rate limiting, privacy and uptime**. A managed identity provider (e.g. Supabase Auth) reduces some operational burden but adds hosted integration, billing, availability and provider-specific concerns; it remains a valid alternative.

**Suggested first sign-in experience (requires owner approval):** email + password; email verification and password reset; no mandatory Google/Steam/Discord account. Public release must have a reliable email sender, rate limiting and email-verified access policy; for local tests, an isolated mail catcher may be used to observe verification messages without sending actual mail.

**No implementation of account or auth code is authorized by this proposed design document** until the owner approves the user-facing sign-in method and platform choice. Other decisions (character slot count, naming, deletion and intro) remain open until their respective design gates.

## Technical contracts to establish now

- PostgreSQL `account`, provider-linked identity and `session` boundaries; character records later point to an immutable, server-owned `account_id`. Do not make character names a foreign key.
- **Authorization on every protected API call**: authentication is not proof that an arbitrary `character_id` belongs to the caller. Query only within the current account or enforce ownership before command execution.
- Web sessions via secure, HttpOnly, same-site cookies (deployment environment and cross-origin policy must be decided); CSRF protection where needed; request rate limiting and abuse monitoring before public exposure.
- Never store reusable passwords in plaintext, log credentials, expose tokens to the browser bundle or trust client-side storage as identity truth.
- Use cryptographic and password-reset functionality from a mature, supported identity stack. Do not implement authentication primitives from scratch.
- Server transaction creates exactly one character, awards the approved origin +3 only once, and instantiates starter assets only once. An idempotency receipt and unique constraints protect retries. **This belongs in M1.2**, after the account boundary is established.
- Local technical fixture from M0 remains clearly development-only and cannot grant access to real player data.

## M1.1 acceptance / QA

1. Unauthenticated requests for account-owned data or protected commands are rejected.
2. A valid session succeeds; logout invalidates access; expired or revoked sessions fail.
3. Account A cannot list, read, select or modify Account B's characters even with a known UUID.
4. Replay and concurrent requests cannot create a second identity, gain unauthorized access or duplicate data.
5. No secrets, session tokens or password-reset credentials appear in commits, UI logs or client bundles.
6. CSRF, session fixation/rotation, expired recovery tokens, enumeration and brute-force protections are verified against the selected auth stack.
7. Auth endpoints and sessions survive API restart in PostgreSQL or selected identity service.
8. Tested against clean install, Node 24, Docker PostgreSQL; preserve all M0 regression checks.

## Sequence after approval

- **M1.1a:** confirm provider/login and session policies; diagram endpoints and account schema.
- **M1.1b:** implement session/login/logout in an independent account module; no Millhand content yet.
- **M1.1c:** test account isolation, sessions, recovery and restart persistence.
- **M1.2:** character list and creation. This uses existing approved six-origin rules and twelve portrait directions.
- **M1.3:** intro/world/background narration authored, reviewed and approved.
- **M1.4:** connect Gate 02 Guther workshop Stage 1–2 to authenticated character commands.

**Change control:** This proposal neither approves a provider nor assumes final character slots, lore, account policy or graphics. Any undecided items must be decided explicitly, not introduced by code defaults.
