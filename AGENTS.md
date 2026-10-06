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

- Legal pages use titled paragraph sections in the shared LegalPage renderer to keep institutional content consistent without duplicating layouts.
- Notification preparation stays in the server-only notification module with fixed recipients and event-derived keys; without verified managed sending it must return pending_domain, never pretend delivery or create a queue.
- Administrative/security notification preparation follows persisted security events and never changes their existing audit or account behavior; account verification and recovery remain with the existing authentication provider.
