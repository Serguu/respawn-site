import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

// latin-ext carries the Romanian ș, ț, ă, â, î; with "latin" alone they fall back to another font.
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} – Știri gaming și recenzii de jocuri`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: { siteName: SITE.name, type: "website", locale: SITE.locale },
  // Let Google show large image previews and full snippets (Discover, Top stories).
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  twitter: { card: "summary_large_image" },
  // Canonical URLs are set per page (a canonical here would be inherited by every page).
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ro" className={`${inter.variable} ${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
