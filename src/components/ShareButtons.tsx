"use client";

import { useState, useSyncExternalStore } from "react";
import { SHARE_ICONS } from "./share-icons";

type Network = keyof typeof SHARE_ICONS;

const NETWORKS: { key: Network; label: string; hover: string; href: (url: string, title: string) => string }[] = [
  {
    key: "facebook",
    label: "Facebook",
    hover: "hover:bg-[#0866ff] hover:border-[#0866ff]",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    hover: "hover:bg-[#25d366] hover:border-[#25d366]",
    href: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    key: "x",
    label: "X",
    hover: "hover:bg-black hover:border-ink-soft",
    href: (url, title) => `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    key: "reddit",
    label: "Reddit",
    hover: "hover:bg-[#ff4500] hover:border-[#ff4500]",
    href: (url, title) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    hover: "hover:bg-[#26a5e4] hover:border-[#26a5e4]",
    href: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
];

const PHONE_NETWORKS: Network[] = ["facebook", "whatsapp", "x"];

/** Tags shared links so Google Analytics shows which network brought each visit. */
function tagged(url: string, source: string) {
  return `${url}?utm_source=${source}&utm_medium=social&utm_campaign=share`;
}

/** Lets GTM/GA count shares. Only queued in the page; nothing is sent unless analytics was accepted. */
function track(method: string, slug: string) {
  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer?.push({ event: "share", method, content_type: "article", item_id: slug });
}

const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";
const noop = () => () => {};

export function ShareButtons({ url, title, slug }: { url: string; title: string; slug: string }) {
  // Only known after hydration (phones mostly), so the server renders without it.
  const nativeShare = useSyncExternalStore(noop, canNativeShare, () => false);
  const [copied, setCopied] = useState(false);
  // The phone's own share sheet already covers Reddit, Telegram, Instagram, Messenger…, so keep the row short.
  const networks = nativeShare ? NETWORKS.filter((n) => PHONE_NETWORKS.includes(n.key)) : NETWORKS;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copiază linkul:", url);
      return;
    }
    track("copy_link", slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    try {
      await navigator.share({ title, url });
      track("native", slug);
    } catch {
      // Cancelled by the user.
    }
  };

  const button =
    "grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!nativeShare && (
        <span className="w-full font-display text-xs font-extrabold uppercase tracking-[0.18em] text-muted sm:mr-1 sm:w-auto">
          Distribuie
        </span>
      )}
      {nativeShare && (
        <button
          type="button"
          onClick={share}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 font-display text-xs font-extrabold uppercase tracking-wider text-accent-ink hover:bg-accent-hover"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
          </svg>
          Distribuie
        </button>
      )}
      {networks.map((n) => (
        <a
          key={n.key}
          href={n.href(tagged(url, n.key), title)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(n.key, slug)}
          aria-label={`Distribuie pe ${n.label}`}
          title={`Distribuie pe ${n.label}`}
          className={`${button} ${n.hover}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d={SHARE_ICONS[n.key]} />
          </svg>
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copiază linkul"
        title="Copiază linkul"
        className={`${button} hover:border-accent hover:bg-accent hover:text-accent-ink ${copied ? "w-auto px-3" : ""}`}
      >
        {copied ? (
          <span className="font-display text-xs font-extrabold uppercase tracking-wider" role="status">
            Copiat!
          </span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
    </div>
  );
}
