export type Category = "news" | "review";
export type Status = "draft" | "published";

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  category: Category;
  published_at: Date | null;
  view_count: number;
  review_score: number | null;
  author_name: string | null;
};

export type Article = ArticleSummary & {
  content_html: string;
  content_json: unknown;
  status: Status;
  created_at: Date;
  updated_at: Date;
  review_verdict: string | null;
  review_pros: string[];
  review_cons: string[];
  review_platform: string | null;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  socials: Record<string, string>;
  sort_order: number;
};
