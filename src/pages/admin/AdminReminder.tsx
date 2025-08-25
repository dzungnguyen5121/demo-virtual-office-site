import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ================== Page: Due Soon Clients (7 days) ==================

type DueClient = { id: string; client: string; invoiceId: string; dueAt: string; amount: number; manager: string };

const gbp = (n:number)=> new Intl.NumberFormat(undefined,{ style:"currency", currency:"GBP" }).format(n);

function withinNextDays(iso:string, days:number){
  const now = new Date();
  const d = new Date(iso);
  const diff = (d.getTime() - now.getTime()) / (1000*60*60*24);
  return diff >= 0 && diff <= days;
}

function mockDueClients(n=20): DueClient[]{
  const names = ["Alpha Ltd","Beta LLP","Gamma PLC","Delta Ltd","Epsilon Ltd","Zeta Ltd","Eta Ltd","Theta Ltd","Iota Ltd","Kappa Ltd"]; 
  const mgrs = ["Alice Johnson","Bob Lee","Carol Tran","David Kim"]; 
  const arr: DueClient[] = [];
  for(let i=0;i<n;i++){
    const due = new Date();
    due.setDate(due.getDate() + (i%12) - 3); // spread around now (-3..+8 days)
    arr.push({
      id: `c${i+1}`,
      client: names[i%names.length],
      invoiceId: `INV-${3000+i}`,
      dueAt: due.toISOString(),
      amount: 49 + (i%5)*10,
      manager: mgrs[i%mgrs.length],
    });
  }
  return arr.sort((a,b)=> new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

function runDueSmokeTests(){
  const items = mockDueClients(20);
  console.assert(items.length===20, 'mockDueClients should return 20');
  const seven = items.filter(x=>withinNextDays(x.dueAt,7));
  console.assert(Array.isArray(seven), 'withinNextDays returns array filterable');
}

export default function AdminReminderPage(){
  const [items] = useState<DueClient[]>(()=> mockDueClients(20));
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(()=>{ if(typeof window!=="undefined") runDueSmokeTests(); },[]);

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    const list = items.filter(x=> withinNextDays(x.dueAt, 7));
    return list.filter(x=> !term || x.client.toLowerCase().includes(term) || x.manager.toLowerCase().includes(term) || x.invoiceId.toLowerCase().includes(term));
  },[items,q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);
  useEffect(()=>setPage(1),[q]);

  const fmtDate = (iso:string)=> new Date(iso).toLocaleDateString();
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder={'Search client / invoice / manager…'} className="w-80 rounded-xl border px-3 py-2 text-sm" />
        <div className="text-sm text-slate-600">
          {`Total: ${filtered.length} records`}
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{'Due Soon'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="py-2 pl-0 pr-3">{'Client'}</th>
                  <th className="px-3 py-2">Invoice</th>
                  <th className="px-3 py-2">{'Due date'}</th>
                  <th className="px-3 py-2">{'Amount'}</th>
                  <th className="px-3 py-2">{'Account manager'}</th>
                  <th className="px-3 py-2">{'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {paged.length===0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">{'No records.'}</td></tr>
                )}
                {paged.map(row=> (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2 pl-0 pr-3">
                      <div className="font-medium text-slate-900">{row.client}</div>
                    </td>
                    <td className="px-3 py-2">{row.invoiceId}</td>
                    <td className="px-3 py-2">{fmtDate(row.dueAt)}</td>
                    <td className="px-3 py-2">{gbp(row.amount)}</td>
                    <td className="px-3 py-2">{row.manager}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]" onClick={()=>navigate('/admin/users')}>
                        <MessageSquare className="mr-1 h-4 w-4" /> Chat
                      </Button>
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
              <Button variant="outline" className="rounded-xl" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>{'Prev'}</Button>
              <Button className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>{'Next'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
