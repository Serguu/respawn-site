import { NextResponse, type NextRequest } from "next/server";
import { getCurrentEditor } from "@/lib/session";
import { uploadImage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  if (!(await getCurrentEditor())) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const folder = form.get("folder") === "avatars" ? "avatars" : "articles";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  try {
    const url = await uploadImage(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
