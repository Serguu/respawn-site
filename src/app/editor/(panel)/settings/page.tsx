import { DEFAULT_DISCLAIMER, getDisclaimer } from "@/lib/settings";
import { requireEditor } from "@/lib/session";
import { Panel } from "../../ui";
import { DisclaimerForm } from "./DisclaimerForm";

export default async function SettingsPage() {
  await requireEditor();
  const disclaimer = await getDisclaimer();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Site-wide content. Changes are live as soon as you save.</p>
      </div>

      <Panel title="Footer disclaimer">
        <p className="mb-4 text-sm text-muted">The box at the bottom of every public page.</p>
        <DisclaimerForm disclaimer={disclaimer} defaults={DEFAULT_DISCLAIMER} />
      </Panel>
    </div>
  );
}
