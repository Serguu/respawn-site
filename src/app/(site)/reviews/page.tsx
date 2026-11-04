import type { Metadata } from "next";
import { CategoryListing, parsePage } from "@/components/CategoryListing";

export const metadata: Metadata = { title: "Reviews", description: "Honest game reviews with scores, pros and cons." };

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
