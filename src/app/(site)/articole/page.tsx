import type { Metadata } from "next";
import { CategoryListing, parsePage } from "@/components/CategoryListing";
import { CATEGORIES } from "@/lib/categories";

const CATEGORY = CATEGORIES.article;

export async function generateMetadata({ searchParams }: PageProps<"/articole">): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `Articole gaming – pagina ${page}` : "Articole gaming",
    description: CATEGORY.description,
    alternates: { canonical: page > 1 ? `/articole?page=${page}` : "/articole" },
  };
}

export default async function Page({ searchParams }: PageProps<"/articole">) {
  const page = parsePage((await searchParams).page);
  return (
    <CategoryListing
      category="article"
      title={CATEGORY.label}
      intro={CATEGORY.intro}
      basePath="/articole"
      page={page}
    />
  );
}
