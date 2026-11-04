// Global site settings - change the name/tagline here.
export const SITE = {
  name: "RESPAWN",
  tagline: "Gaming news & reviews, written by players.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;

export const DISCLAIMER =
  "All articles and reviews on this site are written by the participants of this project out of passion and represent personal opinions. The authors are not journalists or industry experts, and this website is a community project, not an official gaming news publication.";
