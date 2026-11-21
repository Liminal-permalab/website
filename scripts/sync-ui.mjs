// Refreshes vendor/permalab-ui from the kit's source in the desktop app project (permalab-desktop/packages/ui).
// The copy is committed with the website so it can be built on a host that does not have the app project.
// Runs before `npm run dev`; where the app project is not present (a build host), it leaves the copy as it is.
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, process.env.PERMALAB_UI_SRC ?? "../permalab-desktop/packages/ui");
const target = resolve(root, "vendor/permalab-ui");

if (!existsSync(resolve(source, "package.json"))) {
  console.log(`ui:sync skipped: no kit found at ${source}. Using the copy in vendor/permalab-ui.`);
  process.exit(0);
}

// Only the kit's own files are replaced; nothing outside vendor/permalab-ui is touched.
rmSync(resolve(target, "src"), { recursive: true, force: true });
cpSync(source, target, { recursive: true, filter: (path) => !path.includes("node_modules") });
console.log(`ui:sync: vendor/permalab-ui refreshed from ${source}`);
