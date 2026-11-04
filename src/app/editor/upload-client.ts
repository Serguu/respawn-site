// Client helper: uploads an image through the authenticated editor API.
export async function uploadFile(file: File, folder: "articles" | "avatars" = "articles"): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  const res = await fetch("/api/editor/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.url as string;
}
