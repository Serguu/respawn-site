import type { Metadata } from "next";
import { CategoryListing, parsePage } from "@/components/CategoryListing";

export async function generateMetadata({ searchParams }: PageProps<"/stiri">): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `Știri gaming – pagina ${page}` : "Știri gaming",
    description: "Ultimele știri din lumea jocurilor video: lansări, anunțuri, update-uri și noutăți din industria gaming, scrise de comunitatea RESPAWN.",
    alternates: { canonical: page > 1 ? `/stiri?page=${page}` : "/stiri" },
  };
}

export default async function NewsPage({ searchParams }: PageProps<"/stiri">) {
  const page = parsePage((await searchParams).page);
  return (
    <CategoryListing
      category="news"
      title="Știri"
      intro="Ultimele noutăți din lumea gaming-ului, alese și scrise de comunitatea noastră."
      basePath="/stiri"
      page={page}
    />
  );
}
