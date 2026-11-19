import type { Metadata } from "next";
import { CategoryListing, parsePage } from "@/components/CategoryListing";

export async function generateMetadata({ searchParams }: PageProps<"/recenzii">): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `Recenzii jocuri – pagina ${page}` : "Recenzii jocuri",
    description: "Recenzii sincere de jocuri video, cu notă finală, plusuri și minusuri — de la gameri, pentru gameri.",
    alternates: { canonical: page > 1 ? `/recenzii?page=${page}` : "/recenzii" },
  };
}

export default async function ReviewsPage({ searchParams }: PageProps<"/recenzii">) {
  const page = parsePage((await searchParams).page);
  return (
    <CategoryListing
      category="review"
      title="Recenzii"
      intro="Păreri sincere, cu notă finală, plusuri și minusuri — de la gameri, pentru gameri."
      basePath="/recenzii"
      page={page}
    />
  );
}
