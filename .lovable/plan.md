# NOVA OS — SOURENA: Phase 0 Architecture Proposal

Core principle: **Nova is the brain. The Memory Core is the source of truth. Lovable (NOVA OS) is the control and execution layer.** GitHub is proof of work. LinkedIn is public narrative. Portfolio is the full story.

---

## A. Current project analysis

The project is a fresh, empty template: one placeholder home page, default theme, an error page, and a routing test. No backend, no data, no accounts, no AI, no design system.

## B. What exists

- App skeleton (pages, routing, styling setup, error handling)
- Placeholder home page
- Default site title "Lovable App"

## C. Keep

- The app skeleton, error handling and routing test as-is.

## D. Remove or postpone

- Remove later: placeholder home page and default site title (replaced in Phase 1).
- Postpone: GitHub/LinkedIn connections, publishing, AI calls, analytics, automation, portfolio site, design polish.

---

## E. Minimal Phase 1 architecture

```text
 Nova GPT (ChatGPT, custom GPT)          Future AI providers
        |  paste / import / export             (Ollama, gateway, etc.)
        v                                         |
 +----------------------------------------------------------+
 |                  NOVA MEMORY CORE                         |
 |  structured records + state + visibility + versions       |
 +----------------------------------------------------------+
        ^                                         ^
        |                                         |
 NOVA OS (Lovable app): view, edit, verify, export, approve
```

Phase 1 contains only the Memory Core and a way to read, edit, verify and exchange it. No AI, no integrations.

## F. Conceptual data model

Every fact is a **Memory Record**, not a free-text blob.

Memory Record fields:
- domain (identity, education, skill, project, experience, research, goal, brand, content_pillar, writing_style, visual_identity, evidence, achievement, decision, rule, preference, priority, pending_question, rejected_suggestion, account_state)
- key, title, value (structured JSON)
- **truth state**: VERIFIED, USER_PROVIDED, INFERRED, NEEDS_VERIFICATION
- **visibility**: PUBLIC, INTERNAL_STRATEGY, PRIVATE, SENSITIVE
- source (user, nova_gpt, github, linkedin, system) and source reference
- evidence links (record to evidence)
- created/updated time, version

Supporting entities:
- **Evidence**: URL, file, commit, certificate reference; what it proves.
- **Relations**: project uses skill, evidence supports achievement, content derived from project.
- **Snapshots**: versioned full export of the Memory Core (JSON + Markdown).
- **Change Log / Sync History**: who changed what, from which source, when.
- **Proposals**: changes suggested by Nova awaiting approval (accepted / rejected, with reason). Rejected ones are kept so Nova never re-suggests them.
- Later: Accounts, Content Items, Analytics Events, Opportunities.

Rules:
- Nothing becomes VERIFIED without evidence or explicit user confirmation.
- INFERRED records are never shown or exported as fact in public outputs.
- PRIVATE and SENSITIVE records are never included in public-facing generation.

## G. Page / module structure

Phase 1 (minimal):
1. **Memory** — browse records by domain, filter by state and visibility, edit, mark verified.
2. **Import / Export** — paste or upload a Nova context file; export snapshot as JSON and Markdown.
3. **Review queue** — accept or reject proposed changes from imports.

Later modules: Brand, Profile, Projects, Evidence, Content, GitHub, LinkedIn, Analytics, Accounts & Connections, Nova (in-app reasoning).

## H. Nova, Memory Core, Lovable relationship

- **Nova GPT** reasons. It never writes directly to the app. It produces a structured "Nova Context Packet" (JSON or Markdown with a fixed schema) containing proposed record changes plus reasoning.
- **Memory Core** stores the canonical state. It is independent of ChatGPT, GitHub, LinkedIn and Lovable — always exportable as plain files.
- **NOVA OS** imports packets as proposals, shows a diff, the user approves, the Memory Core updates and logs the change. NOVA OS exports a snapshot that the user gives back to Nova GPT (upload to the GPT or its knowledge files).

Synchronization (no access to ChatGPT private memory assumed):
```text
NOVA OS export snapshot (vN) -> Nova GPT reads it -> Nova returns packet based on vN
-> NOVA OS imports, detects conflicts if Memory is now > vN -> user resolves -> vN+1
```
Each packet carries schema version, base snapshot version and source, so stale or conflicting updates are detected rather than silently overwriting.

Later: a private API endpoint so a custom GPT Action can fetch and submit packets automatically (still approval-gated).

Data ownership:
- Memory Core owns: identity, goals, brand, skills, decisions, rules, truth states.
- GitHub owns: code, commits, READMEs (Memory stores references and summaries only).
- LinkedIn owns: published posts and profile (Memory stores mirrored state and drafts).
- Nova GPT owns: nothing permanently; it is stateless reasoning over snapshots.
- NOVA OS owns: workflow state (proposals, approvals, sync logs, account connections).

## AI abstraction (future)

A single internal "Nova Reasoning" interface with tasks (analyze event, propose memory change, draft content, fact-check). Provider adapters plug in behind it: hosted gateway, local Ollama, or manual (copy prompt to ChatGPT, paste reply). The manual adapter is the $0 default. Every AI output enters as a Proposal with state INFERRED, never directly as fact.

Note: a local Ollama on Sourena's computer cannot be reached by the hosted app directly; it would need a small local bridge script or GitHub Actions runner that pulls tasks and pushes results.

## Security

- Single-owner login; all memory locked to the owner by database access rules.
- SENSITIVE records stored separately and excluded from exports by default.
- Account tokens (GitHub, LinkedIn) stored only server-side as encrypted secrets, never in the browser or in exports.
- Least-privilege scopes; read-only first.
- Approval required for public posts, profile edits, deletions, permission changes, disconnects.
- Full change log for every memory edit.

## Cost

Free: app hosting on free tier, Lovable Cloud free tier (database + login), GitHub + GitHub Actions + Pages, GitHub API, manual Nova GPT loop, local Ollama.
Possibly paid / limited: LinkedIn API (posting access is restricted; analytics API largely unavailable to individuals), hosted AI usage beyond free allowance, custom domain.

## I. Risks and architectural mistakes to avoid

- Storing memory as one big text blob: makes verification, privacy and diffs impossible.
- Letting AI write directly to memory without proposals and states.
- Coupling the Memory Core to one AI provider or to ChatGPT.
- Assuming LinkedIn API supports automated posting and analytics for personal accounts; it is heavily restricted. Plan for assisted (copy-and-post) publishing as fallback.
- Building dashboards before the data model is stable.
- Missing snapshot versioning, causing Nova and the app to drift apart.
- Mixing private and public data in the same generation context.
- Expecting the hosted app to reach a local Ollama directly.

## J. Phased roadmap

- **Phase 0** — Architecture (this document). Approve.
- **Phase 1 — Memory Core MVP**: owner login, Memory Records with truth state + visibility, Evidence, Change Log, manual edit page, seed with the current known context (marked USER_PROPOSED/NEEDS_VERIFICATION, nothing invented).
- **Phase 2 — Nova Sync**: packet schema, import with diff + approval, JSON/Markdown snapshot export, version conflict detection, Nova GPT instructions document.
- **Phase 3 — Brand Foundation**: positioning, narrative, content pillars, writing style, derived only from Memory.
- **Phase 4 — GitHub Engine (read-only)**: connect GitHub, pull repos/commits/languages into Evidence, detect significant activity.
- **Phase 5 — AI abstraction**: reasoning interface with manual, hosted and Ollama adapters; event analysis via the 10-question decision model.
- **Phase 6 — Content Engine**: idea, draft, fact-check, approval, assisted publish.
- **Phase 7 — LinkedIn + Portfolio + Resume**: generate from Memory; publish where APIs allow.
- **Phase 8 — Analytics and optimization loop**.

## Recommended Phase 1 scope (smallest useful)

1. Enable Lovable Cloud (free tier) and owner-only login.
2. Memory Records, Evidence and Change Log storage with strict owner-only access.
3. One Memory page: list by domain, filter by state/visibility, add/edit, mark verified.
4. One-click JSON + Markdown export (so Nova GPT can use it immediately).
5. Seed only the context given in this brief, labeled USER_PROVIDED.

Stop after Phase 1 and report.
