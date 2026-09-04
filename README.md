# Bravford ASSDA Portal

A full-stack school portal: a public marketing site (Home / About / Contact), admissions, CBT exams,
results, an admin dashboard, and an AI help desk.

```
BAGS WEB/
├── src/          ← React + TypeScript frontend (Vite)
└── backend/      ← Express + MongoDB API (see backend/README.md)
```

## Quick start

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env      # or use the provided .env — already pointed at your MongoDB Atlas cluster
npm run seed               # creates the admin login + demo data
npm run dev                 # http://localhost:4000
```

**2. Frontend**
```bash
npm install
cp .env.example .env       # VITE_API_URL — defaults to http://localhost:4000/api
npm run dev                 # http://localhost:5173
```

Default admin login: **Admin / ayeni**. Demo students: **STU001 / password**, **STU002 / password**.
Change the admin login any time from **Admin Portal → Account Settings**.

## What's included

- **MongoDB** via Mongoose — students, exams, results, applications, contact messages and AI chat all
  live in your Atlas cluster (Supabase has been fully removed).
- **JWT auth** with bcrypt-hashed passwords for both students and admins.
- **Pages**: Home, **About Us**, **Contact Us** (with a working contact form saved to the database),
  Admissions, and the student/admin portal — plus a refreshed, flatter, more institutional navy/gold/teal
  theme, a utility topbar, and a proper multi-column footer.
- **Admin → Results**: search by student/subject, results grouped by Class → Subject, and a "🗑 Retake"
  action that deletes a result so the student can retake that exam.
- **Admin → Students → Add Student**: admins set a login username + password for each student directly.
- **Admin → Account Settings**: admins can change their own login username and/or password at any time
  (current password required to confirm).
- **Admissions → auto-provisioning**: applicants choose their own portal username/password while applying;
  the moment an admin approves the application, that student account is created automatically.
- **Randomized CBT exams**: question order and answer-option order are independently shuffled for every
  student and every attempt, so no two students see the same paper — grading stays exact either way.
- **Offline-resilient exam-taking**: answers autosave to the student's own device as they go. If the
  connection drops mid-exam, the student can keep answering (or reload the page) and pick up exactly where
  they left off — the timer keeps counting the real elapsed time. On submit, if there's no connection the
  result is queued locally and sent automatically the moment the device is back online.
- **AI Help Desk**: a floating chat widget (bottom-right, on every public/student page) answers
  visitor/student questions via Google's Gemini API (Google AI Studio). Chats are private to each
  visitor/student — there is no admin-facing view of chat history. Set `GEMINI_API_KEY` in
  `backend/.env` to enable it (already filled in with the key you provided).
- **Reports & Analytics** (Admin Portal → Reports): live dashboard with key metrics, performance by
  class and by subject, grade distribution, an admissions funnel, top performers, students who may need
  extra attention, and a one-click CSV export of every result.

See `backend/README.md` for the full API reference.
