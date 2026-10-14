# BiteWise

A Telugu-first, mobile-friendly CSI educational prototype for mosquito prevention planning in Chinamiram, Bhimavaram, West Godavari, Andhra Pradesh.

## Stack

- React + Vite + JavaScript
- Tailwind-compatible Vite setup and plain CSS for the visual system
- Supabase browser client
- Recharts is installed for future chart expansion; the dashboard currently uses labelled accessible summary bars

There is no custom backend server. Recommendations are deterministic JavaScript rules in the browser.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Put these values in `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Only use the public publishable/anon key in the browser. Never use a `service_role` key or database connection string in `.env`.

## Supabase setup

1. Create or open a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the full contents of `supabase-setup.sql`.
4. Confirm that `public.prevention_assessments` exists and RLS is enabled.
5. Copy the project URL and publishable/anon key into the local `.env`.
6. Restart Vite after changing `.env`.
7. Open `/assessment`, submit a test record, then verify the record in Supabase.

The assessment keeps an unfinished draft in the browser under the BiteWise site storage, so leaving and reopening `/assessment` can resume the answers. After a successful submission, the latest action plan can be reopened from the shared action-plan navigation. Run the updated `supabase-setup.sql` to add the prevention-method and environmental fields used by the expanded assessment.

The included RLS is intentionally permissive for this academic prototype: anonymous visitors can read anonymous prevention rows and update overall action status. Do not use this access model for identifiable or sensitive real-world data.

## Pages

- `/` Home
- `/awareness` Disease awareness for dengue, malaria, and chikungunya
- `/assessment` Anonymous prevention assessment
- `/recommendations?id=...` Rule-based action recommendations
- `/actions?id=...` Overall action status and reassessment entry point
- `/dashboard` Anonymous community summary

## Health content and limitations

Awareness content links to official WHO fact sheets. It is educational and does not diagnose disease, provide drug instructions, calculate medically validated risk, predict outbreaks, contact authorities, or prove that disease rates have fallen.

The dashboard describes only records submitted to this application. It does not represent all households in Chinamiram. No names, phone numbers, exact addresses, personal medical histories, or free-text personal details are collected.

Because there is no login, stored assessment rows are anonymous and public under the prototype policies. Any visitor may change an action status. A genuine community deployment requires authentication or a server-side access-control design before collecting anything sensitive.

## Verify

```bash
npm run lint
npm run build
```
