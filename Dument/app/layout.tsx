import type { Metadata } from "next";
import { Onest, Unbounded } from "next/font/google";
import { SITE } from "@/lib/site";
import { Footer } from "./components/footer";
import { Nav } from "./components/nav";
import { RevealObserver } from "./components/reveal-observer";
import "./globals.css";

// Unbounded: wide, round, heavy display face whose circles echo the logo. Onest: sturdy text face for reading.
const unbounded = Unbounded({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-unbounded", display: "swap" });
const onest = Onest({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-onest", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} : relance automatique des factures impayées`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: "fr_FR", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${unbounded.variable} ${onest.variable}`} suppressHydrationWarning>
      <head>
        {/* Scroll-reveal styles only apply once JS runs, so content is never hidden without it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
