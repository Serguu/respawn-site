import { requireEditor } from "@/lib/session";
import { getTeamMembers, SOCIAL_PLATFORMS } from "@/lib/team";
import { Panel } from "../../ui";
import { DeleteButton } from "../articles/DeleteButton";
import { deleteTeamMember } from "./actions";
import { TeamMemberForm } from "./TeamMemberForm";

export default async function TeamAdminPage() {
  await requireEditor();
  const members = await getTeamMembers();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-ink">Team</h1>
        <p className="mt-1 text-sm text-muted">These cards appear on the public Contact page, sorted by “Order”.</p>
      </div>

      {members.map((member) => (
        <Panel key={member.id}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-black text-ink">{member.name}</h2>
            <form action={deleteTeamMember}>
              <input type="hidden" name="id" value={member.id} />
              <DeleteButton label="Remove" />
            </form>
          </div>
          <TeamMemberForm member={member} platforms={SOCIAL_PLATFORMS} />
        </Panel>
      ))}

      <Panel title="Add a team member" className="border-dashed">
        <TeamMemberForm member={null} platforms={SOCIAL_PLATFORMS} />
      </Panel>
    </div>
  );
}
