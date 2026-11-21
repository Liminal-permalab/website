# Permalab website

The public website of Permalab, built with Next.js, TypeScript and Tailwind CSS.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

- **Pages:** home, services, the app (download), sign in or join, and the styleguide at `/ui`.
- **Interface kit:** the site is drawn with `permalab-ui`, the same kit as the desktop app. Its source lives in the
  app project (`permalab-desktop/packages/ui`); this repository carries a copy in `vendor/permalab-ui` so the site
  can be built anywhere. `npm run ui:sync` refreshes the copy, and it also runs before `npm run dev`. Do not edit
  the copy by hand.
- **Sign-in:** needs a Supabase project. Copy `.env.example` to `.env.local` and fill in the two values. Until
  then the sign-in form is switched off.
- **Contact address:** set `contactEmail` in `src/lib/site.ts` to show the contact buttons.
