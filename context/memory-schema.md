# Memory Schema (v1)

`context/memory.json`:
- `schemaVersion`, `snapshotVersion` (increment on every accepted change), `updatedAt`
- `records[]`: `id`, `domain`, `title`, `value`, `state`, `visibility`, `source`, optional `evidence[]`, `note`
- `content[]`: `id`, `stage` (idea | strategy | draft | review | approved | published | measured), `title`, `pillar`, `sourceRecord`
- `accounts[]`: `id`, `role`, `status`

Domains: identity, education, skill, project, experience, research, goal, brand, content_pillar, writing_style, visual_identity, evidence, achievement, decision, rule, preference, priority, pending_question, rejected_suggestion, account_state.

## Nova Context Packet (proposal format)
```json
{ "schemaVersion": 1, "baseSnapshotVersion": 1, "source": "nova_gpt",
  "changes": [ { "op": "add|update|remove", "record": { } , "reason": "" } ] }
```
If `baseSnapshotVersion` < current, review for conflicts before applying. Nova output always enters as `INFERRED` unless the owner confirms.
