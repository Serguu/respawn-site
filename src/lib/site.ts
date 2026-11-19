// Global site settings - change the name/tagline here.
export const SITE = {
  name: "RESPAWN",
  tagline: "Gaming news & reviews, written by players.",
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

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;

export const DISCLAIMER =
  "All articles and reviews on this site are written by the participants of this project out of passion and represent personal opinions. The authors are not journalists or industry experts, and this website is a community project, not an official gaming news publication.";
