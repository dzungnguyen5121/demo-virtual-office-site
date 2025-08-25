import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GeneralSettingsTab() {
  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-[#0A2647]" /> Email alerts for new mail
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-[#0A2647]" /> Push notifications for calls
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#0A2647]" /> Promotions & product updates
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
