import { ImageResponse } from "next/og";
import { LogoMark, loadArchivo } from "@/lib/og";
import { SITE } from "@/lib/site";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<LogoMark size={64} radius={14} />, {
    ...size,
    fonts: await loadArchivo(900, SITE.name.charAt(0)),
  });
}
