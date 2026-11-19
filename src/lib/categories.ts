import type { Category } from "./types";

/**
 * Everything the UI needs to know about each content category, in one place.
 * Class names are written out in full so Tailwind can see them.
 */
export const CATEGORIES: Record<
  Category,
  {
    label: string; // plural, for sections and navigation
    singular: string; // for badges
    path: string;
    description: string; // meta description of the listing page
    intro: string; // text under the listing page title
    bg: string;
    text: string;
    border: string;
  }
> = {
  news: {
    label: "Știri",
    singular: "Știre",
    path: "/stiri",
    description:
      "Ultimele știri din lumea jocurilor video: lansări, anunțuri, update-uri și noutăți din industria gaming, scrise de comunitatea RespawnCentral.",
    intro: "Ultimele noutăți din lumea gaming-ului, alese și scrise de comunitatea noastră.",
    bg: "bg-news",
    text: "text-news",
    border: "border-news",
  },
  review: {
    label: "Recenzii",
    singular: "Recenzie",
    path: "/recenzii",
    description: "Recenzii sincere de jocuri video, cu notă finală, plusuri și minusuri — de la gameri, pentru gameri.",
    intro: "Păreri sincere, cu notă finală, plusuri și minusuri — de la gameri, pentru gameri.",
    bg: "bg-review",
    text: "text-review",
    border: "border-review",
  },
  article: {
    label: "Articole",
    singular: "Articol",
    path: "/articole",
    description:
      "Opinii, analize, ghiduri și fun facts din gaming: articole mai lungi despre jocurile, oamenii și poveștile din spatele lor.",
    intro: "Opinii, analize, ghiduri și fun facts — povești mai lungi din lumea jocurilor.",
    bg: "bg-article",
    text: "text-article",
    border: "border-article",
  },
};

export const CATEGORY_ORDER: Category[] = ["news", "review", "article"];

export function isCategory(value: unknown): value is Category {
  return value === "news" || value === "review" || value === "article";
}
