# ApplyFlow

ApplyFlow is a responsive job search tracker built with React, React Router, Tailwind CSS, Lucide icons, Recharts, and browser local storage.

## Run locally

```sh
npm install
npm run dev
```

Build a production bundle with `npm run build` and preview it with `npm run preview`.

Applications, saved jobs, interviews, profile information, and notification preferences are stored in local storage in the current browser. The app opens with sample job search data so the dashboard is useful on first launch.

The dashboard’s activity chart, response rate, weekly focus goal, and upcoming interview count are derived from the saved tracker data. Saved roles can be carried straight into a new application, and `Ctrl/⌘ K` opens application search.

## Connect real accounts and cloud data

ApplyFlow supports Supabase Auth and a per-user Postgres database. Create a Supabase project, copy `.env.example` to `.env`, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project URL and publishable (anon) key. Never put a service-role key in the frontend. Add your local and deployed app URLs to Supabase Auth's Site URL and Redirect URLs; include `/update-password` so password reset links return to the password update screen.

Run the SQL in `supabase/schema.sql` in the Supabase SQL editor. It creates profile, application, saved-job, and interview tables, creates the user's profile after signup, and enables row-level security so each signed-in account can access only its own records. Restart the Vite server after adding environment variables.

Without Supabase credentials the app runs as a clearly labeled local preview. It stores a single workspace in this browser and is not real authentication or cross-device sync. New profiles start blank; the former fictional starter records are removed.

## Deploy to Vercel

1. Push this project to GitHub and import the repository into Vercel.
2. Keep the Vite framework preset, build command `npm run build`, and output directory `dist` (also set in `vercel.json`).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel's project environment variables for Preview and Production, then redeploy.
4. In Supabase Auth URL Configuration, set the production site URL and add both the production domain and its `/update-password` route to the redirect allowlist.

The Vercel rewrite keeps React Router URLs working when a user opens or refreshes a page such as `/applications` directly.

Sign out is available in the workspace sidebar and on the Profile & settings page. It clears the local demo session or Supabase session and returns to `/login`.
