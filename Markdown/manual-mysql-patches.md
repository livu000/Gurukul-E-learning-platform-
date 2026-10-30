# Gurukul Database Runbook

Date: 2026-03-20

The authoritative schema definition is now the full SQL block in [docs/gurukul-system-requirements.md](./gurukul-system-requirements.md).

## Important Change

- Database name: `gurukul_db`
- Backend env file: `Backend/.env`
- Validation script: `npm run db:check` from `Backend/`

## Recommended Setup Order

1. Create or select the `gurukul_db` database.
2. Run the table creation SQL in the exact phase order documented in `docs/gurukul-system-requirements.md`.
3. From `Backend/`, run:

```bash
npm run db:check
```

4. Start the backend:

```bash
npm run dev
```

## Health Check Coverage

The DB health check confirms that these required tables exist:

- `users`
- `courses`
- `modules`
- `lessons`
- `quizzes`
- `quiz_questions`
- `quiz_options`
- `assignments`
- `assignment_submissions`
- `assignment_grades`
- `payments`
- `transactions`
- `invoices`
- `enrollments`
- `lesson_progress`
- `quiz_attempts`
- `quiz_answers`
- `certificates`
- `refresh_tokens`
- `audit_logs`

## Note

This runbook intentionally replaces the older partial patch list because the project has moved to the fuller production-style LMS schema.
