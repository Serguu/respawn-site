// Global site settings - change the name/tagline here.
export const SITE = {
  name: "RespawnCentral",
  tagline: "Știri gaming și recenzii de jocuri, scrise de gameri.",
  // Used as the homepage meta description (what Google shows under the title).
  description:
    "Știri din lumea gaming-ului și recenzii de jocuri video cu note, plusuri și minusuri, scrise de o comunitate de gameri din România. Plus recomandări de la cititori și mini-jocuri.",
  locale: "ro_RO",
  url: siteUrl(),
};

// Public base URL, used for the sitemap, robots.txt, canonical links and social previews.
// NEXT_PUBLIC_SITE_URL wins (set it once you have a custom domain); otherwise on Vercel we fall
// back to the project's production domain, so these never point search engines at localhost.
function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

// Google Tag Manager container ID. Public (it ends up in every page's HTML), so it lives here;
// override with NEXT_PUBLIC_GTM_ID, or set it to "" to turn tracking off.
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-MLNMJV5K";

// The logo links home, so "Acasă" isn't repeated in the menu.
export const NAV_LINKS = [
  { href: "/stiri", label: "Știri" },
  { href: "/recenzii", label: "Recenzii" },
  { href: "/articole", label: "Articole" },
  { href: "/recomandari", label: "Recomandări" },
  { href: "/joaca", label: "Joacă" },
  { href: "/contact", label: "Contact" },
] as const;
