import { GoogleTagManager } from "@next/third-parties/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GTM_ID } from "@/lib/site";

// Content comes from the database, so render on every request.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Google Tag Manager (GA4 is configured inside the GTM container). Public site only, not the
          editor, and only in production builds so local dev doesn't pollute the stats. */}
      {GTM_ID && process.env.NODE_ENV === "production" && <GoogleTagManager gtmId={GTM_ID} />}
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
    </>
  );
}
