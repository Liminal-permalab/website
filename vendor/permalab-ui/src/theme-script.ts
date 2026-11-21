// Kept apart from theme.ts so a page that is drawn on a server (the website's layout) can use it.
export const THEME_KEY = "permalab.theme";

/** Runs as an inline script before the first drawing, so the page never flashes the wrong theme. Dark unless light was chosen. */
export const APPLY_STORED_THEME = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_KEY}")==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;
