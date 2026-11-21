# permalab-ui

The interface kit of Permalab: every colour, size, shadow and element the desktop app and the website are drawn
with. This folder is the one place to change them.

| File | What it holds |
|---|---|
| `src/tokens.css` | Colours, type sizes, spacing, radius and elevation, for the light and dark theme |
| `src/styles.css` | The styles of every element, the map labels and the styleguide page |
| `src/elements.tsx` | The elements as React components (Button, Card, Field, Tabs, Alert…) |
| `src/theme.ts`, `src/theme-script.ts` | Switching between light and dark, remembered in the browser |
| `src/scope.ts` | The `Scope` type (personal, collective, cloud) |

## Who uses it

- **The desktop app** (this repository) imports it directly as the workspace package `permalab-ui`. A change here
  shows in the running app at once.
- **The website** keeps a copy in its own `vendor/permalab-ui`, so it can be built on a host that does not have
  this repository. The website refreshes that copy with `npm run ui:sync` (it also runs before `npm run dev`).
  After changing the kit, run the sync in the website and commit the result there.

Both show every element on a styleguide page: `#/ui` in the app, `/ui` on the website.

The files are plain TypeScript and CSS with no build step; each project compiles them itself.
