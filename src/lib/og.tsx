import { SITE } from "@/lib/site";

export const BRAND = { bg: "#1e1f1e", bgDeep: "#161716", accent: "#f8d435", ink: "#faf9f6", muted: "#a3a29b" };

/**
 * Loads just the glyphs needed from Google Fonts for next/og images (its built-in font has no
 * Romanian diacritics). Images are generated at build time; if the fetch fails we fall back to
 * the built-in font instead of failing the build.
 */
export async function loadArchivo(weight: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Archivo:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return [];
    const data = await (await fetch(url)).arrayBuffer();
    return [{ name: "Archivo", data, weight: weight as 900, style: "normal" as const }];
  } catch {
    return [];
  }
}

/** The square "R" mark used for the favicon and the Apple touch icon. */
export function LogoMark({ size, radius }: { size: number; radius: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.accent,
        borderRadius: radius,
        color: BRAND.bg,
        fontFamily: "Archivo",
        fontWeight: 900,
        fontSize: size * 0.68,
        lineHeight: 1,
      }}
    >
      {SITE.name.charAt(0)}
    </div>
  );
}
