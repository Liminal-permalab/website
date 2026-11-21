"use client";

import { Button } from "permalab-ui/elements";
import { setTheme, useTheme } from "permalab-ui/theme";

export function ThemeToggle() {
  const theme = useTheme();
  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}
