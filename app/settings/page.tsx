import Topbar from "@/components/Topbar";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" subtitle="Workspace preferences" />
      <div className="px-6 py-6 max-w-2xl space-y-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-2">Profile</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Name<input className="input mt-1" defaultValue="Gusar"/></label>
            <label className="text-sm">Base currency<input className="input mt-1" defaultValue="USD"/></label>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-2">Telegram bot token</h3>
          <p className="text-sm text-ink-500 mb-2">Set <code className="bg-ink-100 px-1.5 rounded">DASHBOARD_API_TOKEN</code> in <code className="bg-ink-100 px-1.5 rounded">.env.local</code>. See the Bot page for examples.</p>
        </div>
      </div>
    </>
  );
}
