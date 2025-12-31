# Sprint 1 Log 

### App Scafolding 

Set up basic scaffolding for our app, including a main.py for our fastapi app and some auth stuff

### Auth 

Magic-link auth working end-to-end. Callback sets HttpOnly JWT cookie. Real email via Resend when `RESEND_API_KEY`/`EMAIL_FROM` are set; otherwise returns the link JSON for dev. Storage is in-memory for now (DB coming next).

### UV and Ruff 

UV for package/env managment Ruff for styling

### Dev Tooling & CI

Added Ruff lint/format locally via pre-commit and in CI with GitHub Actions. This enforces consistent style and import order on every commit and PR. Devs can run `uv run ruff check --fix && uv run ruff format` locally; CI verifies the same on push.

### Sprint Log Folder

Using this to keep track of what we get done in each sprint


### Data

Added SQLite + SQLModel with Alembic. Initial `User` table migrated; DB auto-creates disabled in favor of migrations. Dev uses `sqlite:///./app.db`; Postgres ready via `DATABASE_URL` switch. Next: add Program/Place/Review models and request-scoped DB sessions.

