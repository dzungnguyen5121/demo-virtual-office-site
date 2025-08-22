import {
  Plus,
  Download,
  Upload,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function DocsPage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Manage Documents</h3>
        <div className="flex items-center gap-2">
          <Input placeholder="Search documents" className="w-64 rounded-xl" />
          <Button variant="outline" className="rounded-xl"><Upload className="mr-2 h-4 w-4"/>Upload</Button>
          <Button className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]"><Plus className="mr-2 h-4 w-4"/>New</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Document_{i + 1}.pdf</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Uploaded today • 250 KB</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-xl"><Download className="h-4 w-4"/></Button>
                <Button size="sm" variant="outline" className="rounded-xl"><ExternalLink className="h-4 w-4"/></Button>
                <Button size="sm" variant="outline" className="rounded-xl text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4"/></Button>
              </div>
                </CardContent>
              </Card>
            ))}
          </div>
    </div>
  );
}
