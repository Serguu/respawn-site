import type { Metadata } from "next";
import { CategoryListing, parsePage } from "@/components/CategoryListing";

export async function generateMetadata({ searchParams }: PageProps<"/news">): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `News – page ${page}` : "News",
    description: "The latest gaming news from our community writers.",
    alternates: { canonical: page > 1 ? `/news?page=${page}` : "/news" },
  };
}

export default async function NewsPage({ searchParams }: PageProps<"/news">) {
  const page = parsePage((await searchParams).page);
  return (
    <CategoryListing
      category="news"
      title="News"
      intro="The latest from the gaming world, picked and written by our community."
      basePath="/news"
      page={page}
    />
  );
}
