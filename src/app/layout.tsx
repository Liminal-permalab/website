import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import { THEME_KEY } from "permalab-ui/theme-script";
import "./globals.css";

// Runs before the first drawing, so the page never flashes the wrong theme. The website opens in the Mosaic Hub's
// dark colours unless the visitor chose light (the app does the opposite: light unless dark was chosen).
const APPLY_THEME = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_KEY}")==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Permalab: what it means to create a culture", template: "%s | Permalab" },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script sets data-theme before React starts, so the attribute differs from the server's on purpose.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: APPLY_THEME }} />
        <div className="site">
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
