import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export function CallsPage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Manage Calls</h3>
        <div className="flex gap-2">
          <Input placeholder="Search caller, number…" className="w-64 rounded-xl" />
          <Button className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">New call rule</Button>
        </div>
      </div>
      <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
                </CardHeader>
                <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="px-3 py-2">Caller</th>
                  <th className="px-3 py-2">Number</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-2">Acme Ltd.</td>
                    <td className="px-3 py-2">+44 20 7123 45{i}{i}</td>
                    <td className="px-3 py-2">12:{10 + i} PM</td>
                    <td className="px-3 py-2">{2 + (i % 5)}m</td>
                    <td className="px-3 py-2"><Badge className="rounded-full bg-emerald-100 text-emerald-700">Answered</Badge></td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" className="rounded-xl">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
