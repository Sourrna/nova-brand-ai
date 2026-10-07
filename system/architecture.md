# Architecture
```text
NOVA / GPT (reasoning, stateless)
   ↓ proposals (Nova Context Packet)      ↑ snapshot export
Memory Core (context/memory.json, git-versioned)
   ↓
Control Center (this app)
 ├ GitHub Engine   (proof of work)
 ├ LinkedIn Engine (narrative, distribution)
 ├ Brand Engine
 ├ Content Engine
 └ Analytics
```
- Source of truth: git repository. Every memory change = a commit (history = sync log).
- Nova never writes directly; changes are reviewed by the owner.
- AI providers (later) sit behind one interface: manual (copy/paste, $0), hosted gateway, local Ollama via a local bridge.
- Credentials only in project secrets; never in repo.
- Upgrade path: move memory to a database when in-app editing/approval is needed, keeping the same schema and JSON export.
