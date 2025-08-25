import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  Filter,
  AlertCircle,
  FileUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


const t = {
  approvals: {
    title: "Pending Client Registrations",
    sub: "Review identity and documents, approve or reject.",
    search: "Search client…",
    filters: {
      status: "Status",
      all: "All",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    },
    table: {
      client: "Client",
      submitted: "Submitted",
      status: "Status",
      actions: "Actions",
      approve: "Approve",
      reject: "Reject",
      view: "View",
      bulkApprove: "Approve Selected",
      bulkReject: "Reject Selected",
      selected: (n:number)=>`${n} selected`,
      empty: "No requests match your filters.",
      page: (x:number,y:number)=>`Page ${x} of ${y}`,
      prev: "Prev",
      next: "Next",
    },
    detail: {
      title: "Application Detail",
      basic: "Basic Info",
      contact: "Contact",
      docs: "Submitted Documents",
      notes: "Notes",
      close: "Close",
      approveNow: "Approve Now",
      rejectNow: "Reject",
    },
    statusBadge: {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    },
    memo: "Remember to verify KYC documents before approval.",
  },
  menu: {
      approvals: "Client Approvals",
  }
};

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

type ApprovalItem = {
  id: string;
  client: string;
  email: string;
  phone?: string;
  submittedAt: string; // ISO
  status: ApprovalStatus;
  docs: { id: string; name: string; url: string; mime: string }[];
  notes?: string;
};

const addDays = (n:number)=>{ const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString(); };

function buildMockApprovals(n:number): ApprovalItem[] {
  const names = [
    "Alice Johnson","Bob Tran","Chris Lee","Diana Patel","Ethan Brown","Fiona Green","George King","Hana Kim",
    "Ivan Petrov","Jane Smith","Karl Müller","Lina Chen","Marco Rossi","Nina Lopez","Owen Clark","Priya Shah",
    "Quentin Blake","Rina Sato","Sam Wilson","Tina Nguyen"
  ];
  const items: ApprovalItem[] = [];
  for (let i=0;i<n;i++){
    const name = names[i % names.length];
    const status: ApprovalStatus = i % 5 === 0 ? "APPROVED" : i % 7 === 0 ? "REJECTED" : "PENDING";
    const docs = [
      { id: `doc_${i}_1`, name: "Passport.jpg", url: "https://via.placeholder.com/800x600?text=Passport", mime: "image/jpeg" },
      ...(i % 3 === 0 ? [{ id: `doc_${i}_2`, name: "ProofOfAddress.pdf", url: "/scans/sample.pdf", mime: "application/pdf" } as const] : [])
    ];
    items.push({
      id: `a${i+1}`,
      client: name,
      email: name.toLowerCase().split(' ').join('') + "@client.com",
      phone: "+44 20 " + (1000 + i).toString().padEnd(7,'0'),
      submittedAt: addDays(-(i+1)),
      status,
      docs: docs as any,
      notes: i % 4 === 0 ? "Referred by UK Biz Hub" : undefined,
    });
  }
  return items;
}

export default function AdminApprovalPage() {
  const [items, setItems] = useState<ApprovalItem[]>(() => buildMockApprovals(20));
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ApprovalStatus | "ALL">("PENDING" as any);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [detailId, setDetailId] = useState<string | null>(null);

  // Paging
  const pageSize = 10;
  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    return items.filter(i=>{
      const matchQ = !term || i.client.toLowerCase().includes(term) || i.email.toLowerCase().includes(term);
      const matchStatus = status === "ALL" ? true : i.status === status;
      return matchQ && matchStatus;
    });
  },[items, q, status]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(()=>{ setPage(1); }, [q, status]);
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const bulkCount = useMemo(()=> Object.entries(selected).filter(([id, v]) => v && filtered.some(i=>i.id===id)).length, [selected, filtered]);

  const doApprove = (ids: string[]) => setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, status: "APPROVED" } : i));
  const doReject = (ids: string[]) => setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, status: "REJECTED" } : i));

  const allCheckedOnPage = paged.length>0 && paged.every(i=> selected[i.id]);
  const toggleAllCurrentPage = (checked: boolean) => {
    setSelected(prev => {
      const next = { ...prev };
      paged.forEach(i => { next[i.id] = checked; });
      return next;
    });
  };

  const fmt = (iso:string)=>{ try{ return new Date(iso).toLocaleDateString(); }catch{ return iso; } };

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-amber-900">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm">{t.approvals.memo}</p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">{t.approvals.filters.status}</span>
            <select value={status as any} onChange={(e)=>setStatus(e.target.value as any)} className="ml-2 rounded-md border px-2 py-1 text-sm">
              <option value="ALL">{t.approvals.filters.all}</option>
              <option value="PENDING">{t.approvals.filters.pending}</option>
              <option value="APPROVED">{t.approvals.filters.approved}</option>
              <option value="REJECTED">{t.approvals.filters.rejected}</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder={t.approvals.search} className="w-72 rounded-xl border py-2 pl-9 pr-3 text-sm" />
        </div>
      </div>

      {/* Bulk actions */}
      <div className="mb-2 flex items-center justify-between text-sm">
        <div className="text-slate-600">{t.approvals.table.selected(bulkCount)}</div>
        <div className="flex gap-2">
          <Button disabled={!bulkCount} onClick={()=>doApprove(Object.keys(selected).filter(k=>selected[k]))} className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]">
            <Check className="mr-1 h-4 w-4" /> {t.approvals.table.bulkApprove}
          </Button>
          <Button disabled={!bulkCount} variant="outline" onClick={()=>doReject(Object.keys(selected).filter(k=>selected[k]))} className="rounded-xl">
            <X className="mr-1 h-4 w-4" /> {t.approvals.table.bulkReject}
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t.menu.approvals}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="px-3 py-2"><input type="checkbox" checked={allCheckedOnPage} onChange={(e)=>toggleAllCurrentPage(e.target.checked)} /></th>
                  <th className="px-3 py-2">{t.approvals.table.client}</th>
                  <th className="px-3 py-2">{t.approvals.table.submitted}</th>
                  <th className="px-3 py-2">{t.approvals.table.status}</th>
                  <th className="px-3 py-2 text-right">{t.approvals.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">{t.approvals.table.empty}</td>
                  </tr>
                )}
                {paged.map(i=> (
                  <tr key={i.id} className="border-b last:border-0">
                    <td className="px-3 py-2"><input type="checkbox" checked={!!selected[i.id]} onChange={(e)=> setSelected(prev=>({ ...prev, [i.id]: e.target.checked }))} /></td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{i.client}</div>
                      <div className="text-xs text-slate-500">{i.email}</div>
                    </td>
                    <td className="px-3 py-2">{fmt(i.submittedAt)}</td>
                    <td className="px-3 py-2">{renderStatusBadge(t, i.status)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        {i.status === "PENDING" && (
                          <>
                            <Button size="sm" className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]" onClick={()=>doApprove([i.id])}>
                              <Check className="mr-1 h-4 w-4" /> {t.approvals.table.approve}
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-xl" onClick={()=>doReject([i.id])}>
                              <X className="mr-1 h-4 w-4" /> {t.approvals.table.reject}
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="rounded-xl" onClick={()=>setDetailId(i.id)}>
                          <Eye className="mr-1 h-4 w-4" /> {t.approvals.table.view}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-slate-600">{t.approvals.table.page(page, totalPages)}</div>
            <div className="flex gap-2">
              <Button onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={page===1} variant="outline" className="rounded-xl">{t.approvals.table.prev}</Button>
              <Button onClick={()=>setPage(p=>Math.min(totalPages, p+1))} disabled={page===totalPages} className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">{t.approvals.table.next}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {detailId && (
        <DetailModal item={items.find(x=>x.id===detailId)!} t={t} onClose={()=>setDetailId(null)} onApprove={()=>{ doApprove([detailId]); setDetailId(null); }} onReject={()=>{ doReject([detailId]); setDetailId(null); }} />
      )}
    </>
  );
}

function renderStatusBadge(t:any, s:ApprovalStatus){
  const cls = s === "PENDING" ? "bg-amber-100 text-amber-800" : s === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800";
  const label = s === "PENDING" ? t.approvals.statusBadge.pending : s === "APPROVED" ? t.approvals.statusBadge.approved : t.approvals.statusBadge.rejected;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span>;
}

function DetailModal({ item, t, onClose, onApprove, onReject }:{ item: ApprovalItem; t:any; onClose:()=>void; onApprove:()=>void; onReject:()=>void }){
  const isImage = (m:string)=> m.startsWith("image/");
  const isPdf = (m:string)=> m === "application/pdf";
  const [idx, setIdx] = useState(0);
  const file = item.docs[idx] || item.docs[0];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="text-base font-semibold">{t.approvals.detail.title}</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-100">✕</button>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-3">
          {/* Viewer */}
          <div className="md:col-span-2">
            <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
              {file && isImage(file.mime) && (
                <img src={file.url} alt={file.name} className="max-h-full max-w-full object-contain" />
              )}
              {file && isPdf(file.mime) && (
                <iframe title={file.name} src={file.url} className="h-full w-full" />
              )}
              {!file && (<div className="text-sm text-slate-500">No file</div>)}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {item.docs.map((d,i)=> (
                <button key={d.id} onClick={()=>setIdx(i)} className={`min-w-[100px] rounded-lg border px-2 py-1 text-xs ${i===idx?"border-[#0A2647]":"border-slate-200"}`}>{d.name}</button>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-3 text-sm">
            <section>
              <div className="mb-1 font-semibold text-slate-900">{t.approvals.detail.basic}</div>
              <div className="flex justify-between"><span className="text-slate-600">Client</span><span className="font-medium">{item.client}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Submitted</span><span className="font-medium">{new Date(item.submittedAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Status</span>{renderStatusBadge(t, item.status)}</div>
            </section>
            <section>
              <div className="mb-1 font-semibold text-slate-900">{t.approvals.detail.contact}</div>
              <div className="truncate">{item.email}</div>
              {item.phone && <div>{item.phone}</div>}
            </section>
            <section>
              <div className="mb-1 font-semibold text-slate-900">{t.approvals.detail.docs}</div>
              <ul className="max-h-32 space-y-1 overflow-auto rounded-lg border p-2">
                {item.docs.map(d => (
                  <li key={d.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{d.name}</span>
                    <Button size="sm" variant="outline" className="rounded-lg px-2 py-1">
                      <FileUp className="mr-1 h-3 w-3" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
            {item.notes && (
              <section>
                <div className="mb-1 font-semibold text-slate-900">{t.approvals.detail.notes}</div>
                <div className="rounded-lg border p-2 text-slate-700">{item.notes}</div>
              </section>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]" onClick={onApprove}>
                <Check className="mr-1 h-4 w-4" /> {t.approvals.detail.approveNow}
              </Button>
              <Button variant="outline" className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onReject}>
                <X className="mr-1 h-4 w-4" /> {t.approvals.detail.rejectNow}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
