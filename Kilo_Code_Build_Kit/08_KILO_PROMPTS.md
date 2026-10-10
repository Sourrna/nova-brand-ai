# Copy-ready prompts for Kilo Code

این promptها را به‌ترتیب اجرا کن. Prompt 1 فقط audit است.

## Prompt 1 — Audit only (Plan mode)
```text
Read every Markdown file in Kilo_Code_Build_Kit. AUDIT ONLY: do not edit/create/delete files, install packages, run destructive commands, commit, push, or deploy.
Inspect the current repository, package scripts, dependencies, routes, persistence, data models, import/export, privacy/publication approval, tests, and Git state.
Map every P0 requirement from 02_REQUIREMENTS.md, 04_DATA_MODEL_AND_PRIVACY.md, and 06_ACCEPTANCE_TESTS.md to exactly one status: implemented, partial, missing, cannot_verify. For each, cite exact file paths and symbols/tests.
Report actual stack, what works with evidence, critical privacy risks, real build/test commands, conflicts with the spec, and a minimal phased plan. Preserve existing architecture. Do not assume LinkedIn posting, cloud sync, AI integration, or deployment exists. Do not make claims without evidence.
```

## Prompt 2 — Plan only
```text
Using your audit, create a minimal implementation plan for P0 only. Prioritize privacy/approval, then persistence and project/evidence flows, then import/export, then dashboard polish. For each phase list exact files, tests, acceptance criteria, and risks. Avoid broad refactors and new dependencies unless justified. Do not edit yet. Identify only decisions or credentials that actually block the next phase.
```

## Prompt 3 — Privacy/approval gate (Code mode)
```text
Implement only the highest-priority privacy and publication-approval fixes confirmed by the audit. PUBLIC is not consent; all records default publicationApproved=false; MVP has no public publishing action; editing content/platform invalidates approval; PRIVATE/SENSITIVE are excluded from public exports; enforce policy in domain/action logic, not only UI. Keep unrelated personal sensitive information out of professional exports. Add regression tests. Run relevant tests and actual build/typecheck scripts. Do not commit/push. Report exact changed files and actual command results. Do not refactor unrelated areas.
```

## Prompt 4 — Projects and evidence
```text
Implement only P0 project registry and evidence links, adapting to the existing architecture. Support name, summary, status, priority, goal, nextAction, blockers, timestamps, privacy metadata, and evidence links. Keep self-rated skills separate from verified proficiency. Do not fabricate claims, revenue, users, skills, or outcomes. Add create/edit/status/persistence/evidence tests. Run relevant tests/build/typecheck. Do not commit/push. Report changed files and incomplete requirements.
```

## Prompt 5 — Memory import/export
```text
Implement P0 portable memory import/export with the existing model. Add versioned JSON export with schemaVersion and readable Markdown export. Validate imports before applying; invalid imports must not damage existing data; report conflicts rather than silently overwriting; exclude PRIVATE/SENSITIVE and unapproved records from public exports; never export secrets. Add round-trip and invalid-import tests. Avoid unnecessary dependencies. Run tests/build/typecheck. Do not commit/push.
```

## Prompt 6 — Final QA
```text
Run final QA against all P0 requirements and 06_ACCEPTANCE_TESTS.md. Do not add features or refactor unrelated code. Run actual build/typecheck/unit tests/lint when available. Inspect diff and search for secrets, public-export leaks, and approval bypasses. Mark each acceptance criterion pass/fail/cannot_verify with evidence. Fix only narrow defects and rerun affected tests. Do not claim production-ready/deployed/synced/integrated unless verified. Do not commit/push.
```

## Prompt 7 — Review before commit
```text
Review the final diff only. Do not modify, commit, push, deploy, or publish. Identify unrelated changes, secrets/private information, missing tests, misleading UI claims, accessibility issues, and remaining gaps. Give a go/no-go recommendation and suggested commit message. Wait for my approval before any Git action.
```
