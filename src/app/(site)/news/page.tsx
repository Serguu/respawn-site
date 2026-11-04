import type { Metadata } from "next";
import { CategoryListing, parsePage } from "@/components/CategoryListing";

export const metadata: Metadata = { title: "News", description: "The latest gaming news from our community writers." };

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
