import { motion } from "framer-motion";
import {
  Gift,
  Phone,
  Plus,
  Download,
  Upload,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

// --- Feature: Promotions banner prominently ---
function PromoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#0A2647] to-[#0b305f] p-5 text-white shadow-sm"
      aria-label="Promotions"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Gift className="h-5 w-5 text-[#F5B700]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Summer Offer: 2 months free</h3>
            <p className="text-sm text-white/90">Sign up for the Business plan yearly and get 2 months free + free mail scanning.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]">Claim Offer</Button>
          <Button variant="outline" className="rounded-xl border-white bg-white/10 text-white hover:bg-white/20">See all promos</Button>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#F5B700]/20 blur-2xl" />
    </motion.div>
  );
}

// --- Overview widgets ---
function StatCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="mt-1 text-xs text-slate-500">{sub}</div>
      </CardContent>
    </Card>
  );
}

export function Overview() {
  return (
    <div className="grid gap-6">
      <PromoBanner />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="New mail" value="6" sub="in the last 7 days" />
        <StatCard title="Calls answered" value="42" sub="this month" />
        <StatCard title="Documents" value="128" sub="stored securely" />
        <StatCard title="Plan" value="Business" sub="renews in 22 days" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent calls */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">Recent Calls <Badge variant="outline" className="rounded-full">5 new</Badge></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Acme Ltd.", "HMRC", "Client - Sarah", "Supplier - King Print", "Unknown"].map((name, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[#00A896]" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">Duration {Math.floor(Math.random() * 7) + 1}m · 12:{30 + i} PM</p>
          </div>
        </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl">Details</Button>
                    <Button size="sm" className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">Call back</Button>
            </div>
          </div>
              ))}
                </div>
          </CardContent>
        </Card>

        {/* Quick documents */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">Recent Documents
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-xl"><Upload className="mr-2 h-4 w-4"/>Upload</Button>
                <Button size="sm" className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]"><Plus className="mr-2 h-4 w-4"/>New</Button>
            </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-xl border">
              {["Letter_HMRC.pdf", "Invoice_9821.pdf", "Contract_Template.docx"].map((d) => (
                <div key={d} className="flex items-center justify-between px-3 py-2">
                  <div className="truncate text-sm text-slate-800">{d}</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl"><Download className="h-4 w-4"/></Button>
                    <Button size="sm" variant="outline" className="rounded-xl"><ExternalLink className="h-4 w-4"/></Button>
                    <Button size="sm" variant="outline" className="rounded-xl text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4"/></Button>
                </div>
                </div>
              ))}
                </div>
          </CardContent>
        </Card>
            </div>
          </div>
  );
}
