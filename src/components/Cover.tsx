import Image from "next/image";

/** Cover image with a branded placeholder when an article has none. */
export function Cover({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-surface ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#3a3d3a,transparent_60%)]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-line">
            <rect x="2" y="6" width="20" height="12" rx="4" />
            <path d="M7 10v4M5 12h4M15.5 11h.01M18 13h.01" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
