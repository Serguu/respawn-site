import { NextResponse } from "next/server";

// Keeps the hidden editor out of search engines. Real auth checks happen
// server-side in every editor page, action and API route (requireEditor).
export function proxy() {
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/editor", "/editor/:path*", "/api/editor/:path*"],
};
