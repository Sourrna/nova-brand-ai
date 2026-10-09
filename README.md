# Sourena Brand Control Center

Powered by NOVA.

Internal, file-based Personal Brand Operating System for Sourena; not a public portfolio.

- **NOVA (GPT)** — strategic brain: analysis, strategy, decisions, critique.
- **Memory Core** (`context/memory.json`) — canonical, versioned, portable context. Source of truth.
- **NOVA OS (this app)** — control center and execution layer.
- **GitHub** — proof of work. **LinkedIn** — public narrative and distribution.

Brand chain: Foundation → Identity → Positioning → Proof → Profile → Content → Distribution → Audience → Opportunities → Analytics → Optimization.

## Layout
- `brand/` foundation, identity, positioning, strategy
- `context/` memory.json + schema, knowledge states, privacy rules
- `projects/` one file per project (proof of work)
- `content/` ideas → drafts → approved → published
- `github/`, `linkedin/` engine strategy
- `system/` architecture, roadmap, changelog
- `src/` the Control Center app

## Nova sync (manual, $0)
1. Download the Memory snapshot from the Control Center (JSON or Markdown).
2. Give it to Nova GPT.
3. Nova returns proposed changes; you review and commit them to `context/memory.json`.

No secrets live in this repository.

## Current scope and disclosure
Owner profile answers from the 2026-10-09 chat are incorporated in Memory snapshot v2; the named JSON attachment was not available for independent file reconciliation. Self-assessments remain USER_PROVIDED, unresolved fields NEEDS_CONFIRMATION.

Project sync with Sourrna/nova-brand-ai on main is owner-reported, not full GitHub account/API integration. LinkedIn is planning-only and not connected. No paid APIs or external automation.

All public use requires explicit approval. This app bundles private/internal owner context at build time: keep repository private and do not deploy it as a public profile. Session imports and downloaded drafts do not write repository files.
