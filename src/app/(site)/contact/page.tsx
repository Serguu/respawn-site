import type { Metadata } from "next";
import Image from "next/image";
import { getTeamMembers, SOCIAL_PLATFORMS } from "@/lib/team";
import { EmptyState } from "@/components/EmptyState";
import type { TeamMember } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contact — The Team",
  description: "Meet the people behind the articles and find them on social media.",
};

export default async function ContactPage() {
  const members = await getTeamMembers();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <header className="mb-12 max-w-2xl">
        <div className="mb-4 h-1.5 w-16 rounded-full bg-accent" aria-hidden />
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-ink sm:text-5xl">The Team</h1>
        <p className="mt-3 text-lg text-muted">
          We&apos;re a group of players writing about the games we love. Want to reach one of us? Find us on our
          socials below.
        </p>
      </header>

      {members.length === 0 ? (
        <EmptyState title="Team coming soon" text="Our team profiles will appear here shortly." />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const links = SOCIAL_PLATFORMS.filter((p) => member.socials?.[p.key]);
  const initials = member.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <li className="flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent/60">
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-accent bg-surface-2">
          {member.avatar_url ? (
            <Image src={member.avatar_url} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <span className="grid size-full place-items-center font-display text-2xl font-black text-accent">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-black text-ink">{member.name}</h2>
          {member.role && (
            <p className="mt-0.5 font-display text-xs font-extrabold uppercase tracking-wider text-accent">
              {member.role}
            </p>
          )}
        </div>
      </div>

      {member.bio && <p className="mt-4 flex-1 leading-relaxed text-ink-soft">{member.bio}</p>}

      {links.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${member.name} on social media`}>
          {links.map((platform) => (
            <li key={platform.key}>
              <a
                href={member.socials[platform.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                {platform.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
