"use client";

import { useActionState, useState } from "react";
import type { TeamMember } from "@/lib/types";
import { uploadFile } from "../../upload-client";
import { Field, inputClass, PrimaryButton } from "../../ui";
import { saveTeamMember, type TeamState } from "./actions";

type Platform = { key: string; label: string };

function initialFields(member: TeamMember | null, platforms: readonly Platform[]) {
  return {
    name: member?.name ?? "",
    role: member?.role ?? "",
    bio: member?.bio ?? "",
    avatar_url: member?.avatar_url ?? "",
    sort_order: String(member?.sort_order ?? 0),
    ...Object.fromEntries(platforms.map((p) => [`social_${p.key}`, member?.socials?.[p.key] ?? ""])),
  } as Record<string, string>;
}

export function TeamMemberForm({ member, platforms }: { member: TeamMember | null; platforms: readonly Platform[] }) {
  const [fields, setFields] = useState(() => initialFields(member, platforms));
  const [uploading, setUploading] = useState(false);
  const [state, action, pending] = useActionState<TeamState, FormData>(async (prev, formData) => {
    const result = await saveTeamMember(prev, formData);
    // Clear the "add member" form after a successful add.
    if (!member && result.message) setFields(initialFields(null, platforms));
    return result;
  }, {});

  const bind = (name: string) => ({
    id: `${member?.id ?? "new"}-${name}`,
    name,
    value: fields[name] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [name]: e.target.value })),
  });

  const onAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "avatars");
      setFields((f) => ({ ...f, avatar_url: url }));
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const fid = (name: string) => `${member?.id ?? "new"}-${name}`;

  return (
    <form action={action} className="space-y-4">
      {member && <input type="hidden" name="id" value={member.id} />}
      <input type="hidden" name="avatar_url" value={fields.avatar_url} />

      <div className="flex items-center gap-4">
        <div className="size-16 shrink-0 overflow-hidden rounded-full border-2 border-accent bg-bg">
          {fields.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fields.avatar_url} alt="" className="size-full object-cover" />
          )}
        </div>
        <label className="cursor-pointer rounded-md border border-line bg-bg px-3 py-2 text-sm font-semibold text-ink hover:border-accent">
          {uploading ? "Uploading…" : fields.avatar_url ? "Change photo" : "Upload photo"}
          <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={uploading} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_90px]">
        <Field label="Name" htmlFor={fid("name")}>
          <input {...bind("name")} required className={inputClass} />
        </Field>
        <Field label="Role" htmlFor={fid("role")}>
          <input {...bind("role")} placeholder="e.g. Writer, Editor" className={inputClass} />
        </Field>
        <Field label="Order" htmlFor={fid("sort_order")}>
          <input {...bind("sort_order")} type="number" className={inputClass} />
        </Field>
      </div>

      <Field label="Short bio" htmlFor={fid("bio")}>
        <textarea {...bind("bio")} rows={2} maxLength={600} className={inputClass} />
      </Field>

      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Social links</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {platforms.map((p) => (
            <input
              key={p.key}
              {...bind(`social_${p.key}`)}
              type="url"
              placeholder={`${p.label} — https://…`}
              aria-label={`${p.label} link`}
              className={inputClass}
            />
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Saving…" : member ? "Save" : "Add member"}
        </PrimaryButton>
        {state.error && <p role="alert" className="text-sm text-score-bad">{state.error}</p>}
        {state.message && !state.error && <p role="status" className="text-sm text-score-great">{state.message}</p>}
      </div>
    </form>
  );
}
