import Link from "next/link";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        {site.name}
      </Link>
      <span className="spacer" />
      <nav aria-label="Main" className="row" style={{ gap: "var(--space-4)" }}>
        {site.nav.map((item) => (
          <Link key={item.href} href={item.href} className="nav-link">
            {item.label}
          </Link>
        ))}
        <Link href="/sign-in" className="btn primary">
          Sign in
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
