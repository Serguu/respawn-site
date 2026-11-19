import type { Metadata } from "next";
import { CategoryListing, parsePage } from "@/components/CategoryListing";
import { CATEGORIES } from "@/lib/categories";

const CATEGORY = CATEGORIES.news;

export async function generateMetadata({ searchParams }: PageProps<"/stiri">): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `Știri gaming – pagina ${page}` : "Știri gaming",
    description: CATEGORY.description,
    alternates: { canonical: page > 1 ? `/stiri?page=${page}` : "/stiri" },
  };
}

export default async function Page({ searchParams }: PageProps<"/stiri">) {
  const page = parsePage((await searchParams).page);
  return (
    <CategoryListing
      category="news"
      title={CATEGORY.label}
      intro={CATEGORY.intro}
      basePath="/stiri"
      page={page}
    />
  );
}
