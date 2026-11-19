"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { GTM_ID } from "@/lib/site";

// GDPR: Google Tag Manager (and the GA4 tag inside it) is only loaded after the visitor
// clicks "Accept". Until then nothing is sent to Google and no analytics cookies are set.
// The choice is remembered in localStorage; "Cookie settings" in the footer reopens the banner.

type Choice = "granted" | "denied";

const STORAGE_KEY = "respawn-cookie-consent";
const CHANGE_EVENT = "respawn-consent-change";
const OPEN_EVENT = "respawn-open-cookie-settings";

function readChoice(): Choice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null; // storage blocked (private mode etc.): ask again, track nothing
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // choice made in another tab
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

type DataLayerWindow = Window & { dataLayer?: unknown[] };

// Same as Google's gtag snippet: commands must be pushed as an `arguments` object, not an array.
function gtag(...args: unknown[]): void;
function gtag() {
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  w.dataLayer.push(arguments);
}

let gtmLoaded = false;

function loadGtm() {
  if (gtmLoaded || !GTM_ID || process.env.NODE_ENV !== "production") return;
  gtmLoaded = true;
  // Consent Mode v2 signals, sent before the container loads. No ads on the site, so ad signals stay denied.
  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  const w = window as DataLayerWindow;
  w.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  document.head.appendChild(script);
}

function clearAnalyticsCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!name.startsWith("_ga") && !name.startsWith("_gid")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

function saveChoice(choice: Choice) {
  const previous = readChoice();
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Can't remember it; the choice still applies to this page view.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  if (choice === "denied" && previous === "granted") {
    gtag("consent", "update", { analytics_storage: "denied" });
    clearAnalyticsCookies();
    location.reload(); // drop the already-loaded GTM container
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CookieConsent() {
  // "pending" on the server and during hydration, so the banner never flashes for people who already chose.
  const stored = useSyncExternalStore(subscribe, readChoice, () => "pending" as const);
  const [sessionChoice, setSessionChoice] = useState<Choice | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const choice = stored === "pending" ? null : (stored ?? sessionChoice);

  useEffect(() => {
    if (choice === "granted") loadGtm();
  }, [choice]);

  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  if (stored === "pending" || (choice && !settingsOpen)) return null;

  const decide = (value: Choice) => {
    setSessionChoice(value);
    setSettingsOpen(false);
    saveChoice(value);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consimțământ cookie-uri"
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-lg border border-line bg-surface p-5 shadow-2xl shadow-black/50 sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-sm leading-relaxed text-ink-soft">
          Am vrea să folosim cookie-uri Google Analytics ca să vedem ce articole se citesc, ca să știm despre ce
          să scriem mai mult. Nu urmărim nimic dacă nu accepți. Poți schimba oricând alegerea din{" "}
          <span className="text-ink">Setări cookie-uri</span>, în josul paginii.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="flex-1 rounded border border-line px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-ink hover:border-ink-soft sm:flex-none"
          >
            Refuz
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="flex-1 rounded bg-accent px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-accent-ink hover:bg-accent-hover sm:flex-none"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  return (
    <button type="button" onClick={openCookieSettings} className="underline hover:text-accent">
      Setări cookie-uri
    </button>
  );
}
