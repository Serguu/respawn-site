import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// The editor is intentionally not listed here (listing it would reveal it);
// its pages send a noindex header and meta tag instead.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
