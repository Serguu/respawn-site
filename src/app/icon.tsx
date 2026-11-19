import { ImageResponse } from "next/og";
import { LogoMark, loadArchivo } from "@/lib/og";
import { SITE } from "@/lib/site";

// Google wants a square favicon whose side is a multiple of 48px.
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<LogoMark size={96} radius={20} />, {
    ...size,
    fonts: await loadArchivo(900, SITE.name.charAt(0)),
  });
}
