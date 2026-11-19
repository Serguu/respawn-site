import { ImageResponse } from "next/og";
import { BRAND, LogoMark, loadArchivo } from "@/lib/og";
import { SITE } from "@/lib/site";

// Default preview image for links shared on Facebook, Discord, WhatsApp, X…
// Articles with a cover image use that instead.
export const alt = `${SITE.name} – Știri gaming și recenzii de jocuri`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE = "Știri gaming și recenzii de jocuri";
const SUBLINE = "Scrise de gameri, pentru gameri.";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: `radial-gradient(circle at 85% 15%, #2f312f, ${BRAND.bgDeep} 60%)`,
          color: BRAND.ink,
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <LogoMark size={96} radius={20} />
          <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: -2 }}>{SITE.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ width: 120, height: 10, borderRadius: 5, background: BRAND.accent }} />
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>
            {HEADLINE}
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: BRAND.muted }}>{SUBLINE}</div>
        </div>
      </div>
    ),
    { ...size, fonts: await loadArchivo(900, SITE.name + HEADLINE + SUBLINE) },
  );
}
