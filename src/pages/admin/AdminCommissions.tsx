import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Check,
  X,
  Filter,
  AlertCircle,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ================== Page: Commissions ==================

type CommissionStatus = "DUE" | "SCHEDULED" | "PAID";

type CommissionRow = {
  id: string;
  referrer: { name: string; org?: string; bank: { holder: string; bankName: string; account: string; sortCode?: string } };
  client: string;
  plan: string;
  amount: number; // contract value
  rate: number;   // percentage 0..1
  commission: number; // computed amount
  status: CommissionStatus;
  createdAt: string; // ISO
  note?: string;
  txid?: string;
};

const addDays = (n:number)=>{ const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString(); };

function gbp(n:number){ return new Intl.NumberFormat(undefined,{ style:"currency", currency:"GBP" }).format(n); }

function csvEscape(val: any){
  // CSV rule: escape double quotes by doubling them
  return String(val).replaceAll('"', '""');
}

function mockCommissions(n=20): CommissionRow[] {
  const referrers = [
    { name: "UK Biz Hub", org: "UK Biz Hub", bank: { holder: "UK Biz Hub Ltd", bankName: "Barclays", account: "12345678", sortCode: "20-00-00" } },
    { name: "John Doe", bank: { holder: "John Doe", bankName: "Monzo", account: "98765432" } },
    { name: "Partner Co.", org: "Partner Co.", bank: { holder: "Partner Co. Ltd", bankName: "HSBC", account: "22223333", sortCode: "40-00-00" } },
  ];
  const clients = ["Alpha Ltd", "Beta LLP", "Gamma PLC", "Delta Ltd", "Epsilon Ltd", "Zeta Ltd", "Eta Ltd", "Theta Ltd", "Iota Ltd", "Kappa Ltd"];
  const plans = ["Virtual Office - London", "Virtual Office - Manchester"];
  const rows: CommissionRow[] = [];
  for(let i=0;i<n;i++){
    const ref = referrers[i % referrers.length];
    const client = clients[i % clients.length];
    const plan = plans[i % plans.length];
    const amount = 30 + (i%5)*10; // £30..£70
    const rate = i % 3 === 0 ? 0.2 : i % 3 === 1 ? 0.15 : 0.1; // 20%,15%,10%
    const commission = Math.round(amount*rate*100)/100;
    const status: CommissionStatus = i % 6 === 0 ? "PAID" : i % 4 === 0 ? "SCHEDULED" : "DUE";
    rows.push({ id: `c${i+1}`, referrer: ref as any, client, plan, amount, rate, commission, status, createdAt: addDays(-(i+2)), note: i%5===0?"High value client":undefined, txid: i%6===0?`TX-${1000+i}`:undefined });
  }
  return rows;
}

function runSmokeTests(){
  // CSV escaping tests
  console.assert(csvEscape('He said "Hi"') === 'He said ""Hi""', 'csvEscape should double quotes');
  console.assert(csvEscape('a,b') === 'a,b', 'csvEscape should leave commas as-is (quoting happens at row join)');
  // currency formatting
  const f = gbp(12.34);
  console.assert(/£|GBP/.test(f), 'gbp should format GBP values');
  // mock data
  const m = mockCommissions(20);
  console.assert(m.length === 20, 'mockCommissions should build 20 rows');
}

export default function AdminCommissionsPage(){
  const [rows, setRows] = useState<CommissionRow[]>(()=>mockCommissions(20));
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CommissionStatus|"ALL">("ALL");
  // sample referral code data for admin
  const referralCode = "VO-ADMIN-REF-1234";

  useEffect(()=>{ if (typeof window !== 'undefined') runSmokeTests(); }, []);

  // paging
  const pageSize = 10;
  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    return rows.filter(r=>{
      const okQ = !term || r.referrer.name.toLowerCase().includes(term) || (r.referrer.org||"").toLowerCase().includes(term) || r.client.toLowerCase().includes(term);
      const okS = status === "ALL" ? true : r.status === status;
      return okQ && okS;
    });
  },[rows, q, status]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(()=>{ setPage(1); },[q, status]);
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const [detailId, setDetailId] = useState<string|null>(null);

  const markPaid = (ids: string[], txid?: string)=> setRows(prev => prev.map(r=> ids.includes(r.id) ? { ...r, status: "PAID", txid: txid || r.txid } : r));
  const markUnpaid = (id: string) => setRows(prev => prev.map(r => r.id === id ? { ...r, status: "DUE", txid: undefined } : r));

  const exportCsv = ()=>{
    const header = ["id","referrer","client","plan","amount","rate","commission","status","createdAt","bankHolder","bankName","account","sortCode"].join(",");
    const lines = filtered.map(r=> [r.id, r.referrer.name, r.client, r.plan, r.amount, r.rate, r.commission, r.status, r.createdAt, r.referrer.bank.holder, r.referrer.bank.bankName, r.referrer.bank.account, r.referrer.bank.sortCode||""]
      .map(v=>`"${csvEscape(v)}"`).join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `commissions.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const badge = (s:CommissionStatus)=>{
    const map: Record<CommissionStatus,string> = { DUE: "bg-amber-100 text-amber-800", SCHEDULED:"bg-blue-100 text-blue-800", PAID: "bg-emerald-100 text-emerald-800" };
    const label = s === "DUE" ? "Due" : s === "SCHEDULED" ? "Scheduled" : "Paid";
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${map[s]}`}>{label}</span>;
  };

  return (
    <>
      <div className="mb-1 flex items-center gap-2 text-amber-900">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm">Ensure payout bank details are verified before paying commissions.</p>
      </div>
      <p className="mb-4 text-sm text-slate-600">Track referrers, calculate payouts, and mark as paid.</p>

      {/* Admin Referral Code */}
      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="text-sm text-slate-600">Referral code</div>
        <div className="mt-1 font-mono text-lg font-semibold text-slate-900">{referralCode}</div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">Status</span>
            <select value={status as any} onChange={(e)=>setStatus(e.target.value as any)} className="ml-2 rounded-md border px-2 py-1 text-sm">
              <option value="ALL">All</option>
              <option value="DUE">Due</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search referrer or client…" className="w-72 rounded-xl border py-2 pl-9 pr-3 text-sm" />
          </div>
          <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="py-2 pl-0 pr-3">Referrer</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Rate</th>
                  <th className="px-3 py-2">Commission</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Payout To</th>
                </tr>
              </thead>
              <tbody>
                {paged.length===0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-slate-500">No rows match your filters.</td>
                  </tr>
                )}
                {paged.map(r=> (
                  <tr key={r.id} className="border-b last:border-0 cursor-pointer hover:bg-slate-50" onClick={() => setDetailId(r.id)}>
                    <td className="py-2 pl-0 pr-3">
                      <div className="font-medium text-slate-900">{r.referrer.org || r.referrer.name}</div>
                      <div className="text-xs text-slate-500">{r.referrer.name}</div>
                    </td>
                    <td className="px-3 py-2">{r.client}</td>
                    <td className="px-3 py-2">{r.plan}</td>
                    <td className="px-3 py-2">{gbp(r.amount)}</td>
                    <td className="px-3 py-2">{Math.round(r.rate*100)}%</td>
                    <td className="px-3 py-2 font-medium">{gbp(r.commission)}</td>
                    <td className="px-3 py-2">
                      {r.status !== 'PAID' ? (
                        <Button
                          size="sm"
                          className="rounded-lg bg-amber-400 px-2 py-1 text-xs font-semibold text-slate-900 hover:bg-amber-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailId(r.id);
                          }}
                        >
                          Mark Paid
                        </Button>
                      ) : (
                        badge(r.status)
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-slate-700">{r.referrer.bank.holder}</div>
                      <div className="text-xs text-slate-500">{r.referrer.bank.bankName} • {r.referrer.bank.account}{r.referrer.bank.sortCode?` • ${r.referrer.bank.sortCode}`:""}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-slate-600">{`Page ${page} of ${totalPages}`}</div>
            <div className="flex gap-2">
              <Button onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={page===1} variant="outline" className="rounded-xl">Prev</Button>
              <Button onClick={()=>setPage(p=>Math.min(totalPages, p+1))} disabled={page===totalPages} className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {detailId && (
        <CommissionDetailModal row={rows.find(r=>r.id===detailId)!} onClose={()=>setDetailId(null)} onMarkPaid={(tx)=>{ markPaid([detailId], tx); setDetailId(null); }} onMarkUnpaid={() => { markUnpaid(detailId); setDetailId(null); }} />
      )}
    </>
  );
}

function CommissionDetailModal({ row, onClose, onMarkPaid, onMarkUnpaid }:{ row: CommissionRow; onClose:()=>void; onMarkPaid:(txid?:string)=>void; onMarkUnpaid:()=>void }){
  const [txid, setTxid] = useState(row.txid || "");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal onClick={onClose}>
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="text-base font-semibold">Commission Detail</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-100">✕</button>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <section className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Referrer</span><span className="font-medium">{row.referrer.org || row.referrer.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Client</span><span className="font-medium">{row.client}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Plan</span><span className="font-medium">{row.plan}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Amount</span><span className="font-medium">{gbp(row.amount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Rate</span><span className="font-medium">{Math.round(row.rate*100)}%</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{gbp(row.commission)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Status</span><span className="font-medium">{row.status}</span></div>
          </section>
          <section className="space-y-2 text-sm">
            <div className="font-semibold text-slate-900">Bank account</div>
            <div className="rounded-lg border p-2">
              <div>{row.referrer.bank.holder}</div>
              <div className="text-slate-600 text-xs">{row.referrer.bank.bankName} • {row.referrer.bank.account}{row.referrer.bank.sortCode?` • ${row.referrer.bank.sortCode}`:""}</div>
            </div>
            <div className="font-semibold text-slate-900">Transaction ID</div>
            <input value={txid} onChange={(e)=>setTxid(e.target.value)} placeholder="e.g. bank transfer ref" className="w-full rounded-lg border px-3 py-2 text-sm" />
            {row.note && <>
              <div className="font-semibold text-slate-900">Note</div>
              <div className="rounded-lg border p-2 text-slate-700">{row.note}</div>
            </>}
          </section>
        </div>
        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          {row.status !== "PAID" && (
            <Button className="rounded-xl bg-[#00A896] text-white hover:opacity-90" onClick={()=>onMarkPaid(txid)}>
              <Check className="mr-1 h-4 w-4" /> Mark as Paid
            </Button>
          )}
          {row.status === "PAID" && (
            <Button variant="outline" onClick={onMarkUnpaid}>
              <X className="mr-1 h-4 w-4" /> Mark as Unpaid
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
