"use client";

import { useEffect, useRef } from "react";

function send(payload: unknown) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) return;
  fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
}

/** Counts one view for the article (server de-duplicates per visitor per day). */
export function ViewTracker({ articleId }: { articleId: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    send({ type: "view", id: articleId });
  }, [articleId]);
  return null;
}

/**
 * Wraps the homepage. Records an impression when a card with
 * data-article-id becomes visible and a click when one is clicked.
 * Used to compute homepage CTR in the editor dashboard.
 */
export function HomeTracker({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const seen = new Set<string>();
    let pending: string[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    const flush = () => {
      if (pending.length) send({ type: "impressions", ids: pending });
      pending = [];
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.articleId;
          if (!entry.isIntersecting || !id || seen.has(id)) continue;
          seen.add(id);
          pending.push(id);
        }
        clearTimeout(timer);
        timer = setTimeout(flush, 1500);
      },
      { threshold: 0.5 },
    );
    root.querySelectorAll<HTMLElement>("[data-article-id]").forEach((el) => observer.observe(el));

    const onClick = (event: MouseEvent) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>("[data-article-id]");
      if (card?.dataset.articleId && (event.target as HTMLElement).closest("a")) {
        send({ type: "click", id: card.dataset.articleId });
      }
    };
    root.addEventListener("click", onClick);
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      flush();
      root.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
