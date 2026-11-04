import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "media";
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = EXTENSIONS[file.type];
  if (!ext) throw new Error("Only JPG, PNG, WEBP, GIF or AVIF images are allowed.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 8 MB.");

  const path = `${folder}/${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const supabase = client();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
