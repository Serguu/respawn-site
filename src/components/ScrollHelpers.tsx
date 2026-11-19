"use client";

import { useEffect, useState } from "react";

function useScroll() {
  const [state, setState] = useState({ y: 0, progress: 0 });
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setState({ y: window.scrollY, progress: max > 0 ? Math.min(1, window.scrollY / max) : 0 });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return state;
}

/** Thin bar under the header showing how far through the article you are. */
export function ReadingProgress() {
  const { progress } = useScroll();
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden>
      <div
        className="h-full origin-left bg-gradient-to-r from-accent to-score-great"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export function BackToTop() {
  const { y } = useScroll();
  const visible = y > 900;
  return (
    <button
      type="button"
      aria-label="Înapoi sus"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className={`fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full border border-line bg-surface text-ink shadow-xl shadow-black/40 transition-all hover:border-accent hover:text-accent ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 15l6-6 6 6" />
      </svg>
    </button>
  );
}
