# Essential Files for Deployment

## ✅ Required for Backend (Railway)

- `pyproject.toml` - Dependencies
- `app/` - Backend code
- `alembic.ini` - Migration config
- `migrations/` - Database migrations
- `.env` - Environment variables (not committed, set in Railway)

## ✅ Required for Frontend (Vercel)

- `abroadly/` - Frontend code
  - `package.json` - Dependencies
  - `vercel.json` - Vercel config
  - `src/` - React code
  - `vite.config.js` - Build config

## 📝 Optional but Useful

- `README.md` - Project documentation
- `CHANGELOG.md` - Version history

## ❌ Not Needed for Deployment

- `checkpoints/` - Old checkpoints
- `code_review_package/` - Code review docs
- `design_inspiration/` - Design files
- `sprint_logs/` - Development logs
- `docs/` - API docs (nice to have, not required)
- `tests/` - Test files (not needed for production)
- `app.db` - Local SQLite database (not needed, using Supabase)

