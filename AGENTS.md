<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS

- Memory Core is the file `context/memory.json`, versioned in git; the app reads it at build time. Why: git history is the sync log and stays portable to Nova GPT.
- Brand, project, content and system docs live as Markdown in root folders (brand/, projects/, content/, github/, linkedin/, system/). Why: human- and GPT-readable, version-controlled.
- Every memory record carries a knowledge state and a visibility level; UI and exports must respect them. Why: never present unverified info as fact.
- No secrets or credentials in the repository. Why: privacy rules.
