import { GoogleAnalytics } from "@next/third-parties/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

// Content comes from the database, so render on every request.
export const dynamic = "force-dynamic";

// Google Analytics 4 measurement ID (G-XXXXXXXXXX). Loaded only on the public site, not in the
// editor, and only when the env var is set, so local dev without it sends nothing.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </>
  );
}
