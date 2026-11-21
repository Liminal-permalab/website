// Kept apart from theme.ts so a page that is drawn on a server (the website's layout) can use it.
export const THEME_KEY = "permalab.theme";

/** Runs as an inline script before the first drawing, so the page never flashes the wrong theme. Light unless dark was chosen. */
export const APPLY_STORED_THEME = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_KEY}")==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}`;
