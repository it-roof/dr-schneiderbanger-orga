<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Datenbank (Drizzle)

- PostgreSQL über Drizzle ORM (`lib/db/`)
- Schema-Änderungen **nur** via `pnpm db:generate` → `pnpm db:migrate`
- **Nie** `db:push` verwenden
- Siehe `lib/db/README.md` und `.cursor/rules/drizzle-migrations.mdc`
