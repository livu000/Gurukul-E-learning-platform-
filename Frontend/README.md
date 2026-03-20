# Gurukul Frontend

Frontend for the Gurukul e-learning platform.

## Run

```bash
npm install
npm run dev
```

The frontend expects the backend API at `http://localhost:4000/api` by default.
Override it with `VITE_API_URL` when needed.

## Main flows covered in the current branch

- Role-based login and token refresh
- Course list and course detail view
- Free enrollment and paid course purchase verification flow
- Lesson access and lesson completion tracking
- Student quiz attempt flow and quiz results
- Assignment submission and teacher grading
- Teacher course builder for modules and lessons
- Student, teacher, and admin dashboards
- Certificate issue, verify, and download
- Admin user management

## Notes

- MySQL is managed manually outside the repo.
- Use `../docs/manual-mysql-patches.md` before deploying schema-dependent backend changes.
