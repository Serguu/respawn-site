import type { Metadata } from "next";
import { CategoryListing, parsePage } from "@/components/CategoryListing";

export async function generateMetadata({ searchParams }: PageProps<"/reviews">): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `Reviews – page ${page}` : "Reviews",
    description: "Honest game reviews with scores, pros and cons.",
    alternates: { canonical: page > 1 ? `/reviews?page=${page}` : "/reviews" },
  };
}

export default async function ReviewsPage({ searchParams }: PageProps<"/reviews">) {
  const page = parsePage((await searchParams).page);
  return (
    <CategoryListing
      category="review"
      title="Reviews"
      intro="Honest takes with a final score, pros and cons — from players, for players."
      basePath="/reviews"
      page={page}
    />
  );
}
