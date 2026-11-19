import type { Metadata } from "next";
import { CategoryListing, parsePage } from "@/components/CategoryListing";
import { CATEGORIES } from "@/lib/categories";

const CATEGORY = CATEGORIES.review;

export async function generateMetadata({ searchParams }: PageProps<"/recenzii">): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `Recenzii jocuri – pagina ${page}` : "Recenzii jocuri",
    description: CATEGORY.description,
    alternates: { canonical: page > 1 ? `/recenzii?page=${page}` : "/recenzii" },
  };
}

export default async function Page({ searchParams }: PageProps<"/recenzii">) {
  const page = parsePage((await searchParams).page);
  return (
    <CategoryListing
      category="review"
      title={CATEGORY.label}
      intro={CATEGORY.intro}
      basePath="/recenzii"
      page={page}
    />
  );
}
