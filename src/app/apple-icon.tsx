import { ImageResponse } from "next/og";
import { LogoMark, loadArchivo } from "@/lib/og";
import { SITE } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the mark fills the whole square.
export default async function AppleIcon() {
  return new ImageResponse(<LogoMark size={180} radius={0} />, {
    ...size,
    fonts: await loadArchivo(900, SITE.name.charAt(0)),
  });
}
