# GitHub, Versioning, and Release

Repo known from prior context: `Sourrna/nova-brand-ai`; verify actual remote/branch/commit.

## Before coding
- Check branch and working tree.
- Backup/commit existing work.
- Do not mix unrelated changes.
- Check that build-kit content is appropriate for version control.

## Suggested commit cadence
1. `docs: add Brand OS implementation specification`
2. `fix: enforce publication approval and privacy rules`
3. `feat: manage projects and evidence`
4. `feat: add portable memory import and export`
5. `test: complete MVP acceptance coverage`

These are proposed commit messages, not claims that commits exist.

## Before push
Review diff/status; check `.env`, tokens, private client data and exports; run actual tests/build; do not force-push. An agent must not push without explicit approval.

## Status words
`local only`, `committed locally`, `pushed to GitHub`, `deployed` are different states. Use only when the operation is confirmed.

Deployment is not first-phase scope. Before deployment, verify storage, environment variables, migrations, auth/authorization, CORS and production build.
