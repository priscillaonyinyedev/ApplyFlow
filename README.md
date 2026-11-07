# ApplyFlow

ApplyFlow is a responsive job search tracker built with React, React Router, Tailwind CSS, Lucide icons, Recharts, and browser local storage.

## Run locally

```sh
npm install
npm run dev
```

Build a production bundle with `npm run build` and preview it with `npm run preview`.

Applications, saved jobs, interviews, profile information, and notification preferences are stored in local storage in the current browser. New workspaces start with your own details and empty lists.

The dashboard’s activity chart, response rate, weekly focus goal, and upcoming interview count are derived from the saved tracker data. Saved roles can be carried straight into a new application, and `Ctrl/⌘ K` opens application search.

## Optional: connect real accounts and cloud data

ApplyFlow supports Supabase Auth and a per-user Postgres database. Create a Supabase project, copy `.env.example` to `.env`, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project URL and publishable (anon) key. Never put a service-role key in the frontend. Add your local and deployed app URLs to Supabase Auth's Site URL and Redirect URLs; include `/update-password` so password reset links return to the password update screen.

Run the SQL in `supabase/schema.sql` in the Supabase SQL editor. It creates profile, application, saved-job, and interview tables, creates the user's profile after signup, and enables row-level security so each signed-in account can access only its own records. Restart the Vite server after adding environment variables.

Supabase is optional. Without Supabase credentials, sign up, sign in, sign out, and job tracking work in local browser mode. This mode has no server account, password recovery, or cross-device sync; anyone using that browser can access its local workspace. Add Supabase only when you want private server accounts and cloud sync.

## Deploy to Vercel

1. Push this project to GitHub and import the repository into Vercel.
2. Keep the Vite framework preset, build command `npm run build`, and output directory `dist` (also set in `vercel.json`). No environment variables or SQL setup are needed for local browser mode.
3. To add cloud accounts later, configure the Supabase environment variables, apply the SQL schema, set the Supabase Auth redirect URLs, and redeploy.

The Vercel rewrite keeps React Router URLs working when a user opens or refreshes a page such as `/applications` directly.

Sign out is available in the workspace sidebar and on the Profile & settings page. It clears the local demo session or Supabase session and returns to `/login`.
