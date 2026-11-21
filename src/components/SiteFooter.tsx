import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="row mt-16 border-t border-line pt-5" style={{ gap: "var(--space-4)" }}>
      <span className="brand">{site.name}</span>
      {site.nav.map((item) => (
        <Link key={item.href} href={item.href} className="nav-link">
          {item.label}
        </Link>
      ))}
      <Link href="/ui" className="nav-link">
        UI styleguide
      </Link>
      {site.contactEmail && (
        <a href={`mailto:${site.contactEmail}`} className="nav-link">
          {site.contactEmail}
        </a>
      )}
      <span className="spacer" />
      <span className="text-[13px] text-muted">© Permalab</span>
    </footer>
  );
}
