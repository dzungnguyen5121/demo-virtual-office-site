import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Copy,
  Plus,
  Save,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ================== Promotions Page ==================

type PromoType = 'PERCENT' | 'FIXED';

type Promo = {
  id: string;
  code: string;
  description?: string;
  type: PromoType;
  value: number; // percent or GBP depending on type
  start?: string; // ISO date
  end?: string;   // ISO date
  maxUses?: number;
  used?: number;
  active: boolean;
  createdAt: string;
  // Audience rules
  allowedUsers?: string[];   // explicit usernames (email or handle)
  newUsersOnly?: boolean;    // apply to new signups only
  minSpendGBP?: number;      // lifetime spend threshold
};

const gbp = (n:number)=> new Intl.NumberFormat(undefined,{ style:'currency', currency:'GBP' }).format(n);

function genCode(){
  const base = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'VO-';
  for(let i=0;i<6;i++) out += base[Math.floor(Math.random()*base.length)];
  return out;
}

function loadPromos(): Promo[]{
  try{ const raw = localStorage.getItem('promotions'); if(raw) return JSON.parse(raw); }catch{}
  // minimal dummy data with audience rules
  return [
    { id: 'p1', code: 'VO-WELCOME10', description: '10% for first month', type: 'PERCENT', value: 10, start: '', end: '', maxUses: 100, used: 12, active: true, createdAt: new Date().toISOString(), newUsersOnly: true },
    { id: 'p2', code: 'VO-5GBP', description: '£5 off first invoice', type: 'FIXED', value: 5, start: '', end: '', maxUses: 50, used: 5, active: true, createdAt: new Date().toISOString(), allowedUsers: ['alice','bob'], minSpendGBP: 0 },
  ];
}

function savePromos(list: Promo[]){ try{ localStorage.setItem('promotions', JSON.stringify(list)); }catch{} }

function validatePromo(p: Promo, all: Promo[]){
  if(!p.code.trim()) return false;
  if(!/^[A-Z0-9\-]{3,}$/.test(p.code)) return false;
  if(p.value<=0) return false;
  const dup = all.some(x=> x.id!==p.id && x.code.toUpperCase()===p.code.toUpperCase());
  if(dup) return false;
  if(p.start && p.end){ if(new Date(p.start) > new Date(p.end)) return false; }
  return true;
}

function summarizeTargeting(p:Promo){
  const chips:string[] = [];
  if(p.allowedUsers && p.allowedUsers.length) chips.push(`@${p.allowedUsers.slice(0,2).join(', ')}${p.allowedUsers.length>2?` +${p.allowedUsers.length-2}`:''}`);
  if(p.newUsersOnly) chips.push("New users only");
  if(p.minSpendGBP && p.minSpendGBP>0) chips.push(`Min spend: ${gbp(p.minSpendGBP)}`);
  return chips.length? chips.join(' · ') : "Any";
}

export default function AdminPromotionsPage(){
  const [items, setItems] = useState<Promo[]>(()=> loadPromos());
  const [editing, setEditing] = useState<Promo|null>(null);
  const empty: Promo = { id: '', code: '', description: '', type: 'PERCENT', value: 10, start: '', end: '', maxUses: 0, used: 0, active: true, createdAt: new Date().toISOString(), allowedUsers: [], newUsersOnly: false, minSpendGBP: 0 };
  const [form, setForm] = useState<Promo>(empty);
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState<string>('');
  const [usersInput, setUsersInput] = useState<string>('');

  // keep textarea input in sync when editing different rows
  useEffect(()=>{
    if(editing){
      setUsersInput((editing.allowedUsers||[]).join(', '));
    } else {
      setUsersInput('');
    }
  },[editing]);

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    return items.filter(x=> !term || x.code.toLowerCase().includes(term) || (x.description||'').toLowerCase().includes(term));
  },[items,q]);

  const pageSize = 10; const [page,setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);
  useEffect(()=>setPage(1),[q]);

  const persist = (list:Promo[])=>{ setItems(list); savePromos(list); };

  const parseUsers = (s:string)=> s
    .split(/[\n,]/)
    .map(x=>x.trim())
    .filter(Boolean);

  const upsert = ()=>{
    const draft: Promo = {
      ...form,
      code: form.code.toUpperCase(),
      allowedUsers: parseUsers(usersInput),
      minSpendGBP: Number(form.minSpendGBP||0),
    };
    if(!validatePromo(draft, items)) return;
    if(editing){
      const next = items.map(x=> x.id===editing.id ? { ...draft, id: editing.id } : x);
      persist(next); setEditing(null); setForm(empty);
    }else{
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      persist([{ ...draft, id }, ...items]); setForm(empty);
    }
  };
  const remove = (id:string)=>{ const next = items.filter(x=>x.id!==id); persist(next); };
  const toggleActive = (id:string)=>{ const next = items.map(x=> x.id===id ? { ...x, active: !x.active } : x); persist(next); };
  const copyCode = async(code:string)=>{
    try{ await navigator.clipboard.writeText(code); setCopied(code); setTimeout(()=>setCopied(''),1500);}catch{}
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <p className="mb-6 text-sm text-slate-600">Create and manage discount codes for Virtual Office.</p>

      {/* Create / Edit Card */}
      <Card className="mb-6 rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Create / Edit Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 min-w-0">
            <div className="md:col-span-1">
              <label className="block text-sm text-slate-700">Code</label>
              <div className="mt-1 flex flex-wrap gap-2 min-w-0 md:flex-nowrap">
                <input value={form.code} onChange={e=>setForm(f=>({ ...f, code: e.target.value.toUpperCase() }))} className="flex-1 min-w-0 rounded-lg border px-3 py-2 text-sm" placeholder="VO-XXXXXX" />
                <Button type="button" variant="outline" onClick={()=>setForm(f=>({ ...f, code: genCode() }))}><Plus className="mr-1 h-4 w-4" /> Generate</Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-700">Description</label>
              <input value={form.description||''} onChange={e=>setForm(f=>({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({ ...f, type: e.target.value as PromoType }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                <option value="PERCENT">Percent</option>
                <option value="FIXED">Fixed (GBP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-700">Value</label>
              <input type="number" min={0} step={form.type==='PERCENT'?1:0.01} value={form.value} onChange={e=>setForm(f=>({ ...f, value: Number(e.target.value||0) }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Max Uses</label>
              <input type="number" min={0} value={form.maxUses||0} onChange={e=>setForm(f=>({ ...f, maxUses: parseInt(e.target.value||'0') }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Start Date</label>
              <input type="date" value={form.start||''} onChange={e=>setForm(f=>({ ...f, start: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">End Date</label>
              <input type="date" value={form.end||''} onChange={e=>setForm(f=>({ ...f, end: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>

            {/* Audience Rules */}
            <div className="md:col-span-3 mt-2 rounded-xl border p-3">
              <div className="mb-2 text-sm font-medium text-slate-800">Audience Rules</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-700">Usernames (comma / new line)</label>
                  <textarea value={usersInput} onChange={e=>setUsersInput(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="alice, bob\nor\nuser1\nuser2" />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm text-slate-700">Min lifetime spend (GBP)</label>
                  <input type="number" min={0} step={0.01} value={form.minSpendGBP||0} onChange={e=>setForm(f=>({ ...f, minSpendGBP: Number(e.target.value||0) }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                  <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={!!form.newUsersOnly} onChange={e=>setForm(f=>({ ...f, newUsersOnly: e.target.checked }))} />
                    New users only
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button type="button" variant="outline" onClick={()=>{ setEditing(null); setForm(empty); setUsersInput(''); }}>Cancel</Button>
              <Button type="button" className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]" onClick={upsert} disabled={!validatePromo({ ...form, code: form.code.toUpperCase() }, items)}>
                <Save className="mr-1 h-4 w-4" /> {editing ? "Update Code" : "Add Code"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List Card */}
      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Existing Codes</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="relative flex-grow">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search code or description…" className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm md:w-80" />
            </div>
            <div className="text-sm text-slate-600">{`Page ${page} of ${totalPages}`}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-hidden">
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="py-2 pl-0 pr-3 whitespace-normal break-words">Code</th>
                  <th className="px-3 py-2 whitespace-normal break-words">Description</th>
                  <th className="px-3 py-2 whitespace-normal break-words">Type</th>
                  <th className="px-3 py-2 whitespace-normal break-words">Value</th>
                  <th className="px-3 py-2 whitespace-normal break-words">Start Date</th>
                  <th className="px-3 py-2 whitespace-normal break-words">End Date</th>
                  <th className="px-3 py-2 whitespace-normal break-words">Used</th>
                  <th className="px-3 py-2 whitespace-normal break-words">Targeting</th>
                  <th className="px-3 py-2 whitespace-normal break-words">Active</th>
                  <th className="px-3 py-2 whitespace-normal break-words">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length===0 && (
                  <tr><td colSpan={10} className="px-3 py-6 text-center text-slate-500">No codes yet.</td></tr>
                )}
                {paged.map(row=> (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2 pl-0 pr-3 whitespace-normal break-words">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{row.code}</span>
                        <Button size="icon" variant="ghost" onClick={()=>copyCode(row.code)} title="Copy"><Copy className="h-4 w-4" /></Button>
                        {copied===row.code && <span className="text-xs text-green-600">Copied!</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-normal break-words">{row.description}</td>
                    <td className="px-3 py-2 whitespace-normal break-words">{row.type==='PERCENT' ? "Percent" : "Fixed (GBP)"}</td>
                    <td className="px-3 py-2 whitespace-normal break-words">{row.type==='PERCENT' ? `${row.value}%` : gbp(row.value)}</td>
                    <td className="px-3 py-2 whitespace-normal break-words">{row.start || '—'}</td>
                    <td className="px-3 py-2 whitespace-normal break-words">{row.end || '—'}</td>
                    <td className="px-3 py-2 whitespace-normal break-words">{row.used ?? 0}{row.maxUses ? `/${row.maxUses}` : ''}</td>
                    <td className="px-3 py-2 whitespace-normal break-words">{summarizeTargeting(row)}</td>
                    <td className="px-3 py-2 whitespace-normal break-words">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${row.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{row.active ? 'ON' : 'OFF'}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-normal break-words">
                      <div className="flex justify-start gap-2">
                        <Button size="sm" variant="outline" onClick={()=>{ setEditing(row); setForm(row); setUsersInput((row.allowedUsers||[]).join(', ')); }}> <Edit className="mr-1 h-4 w-4" /> Edit</Button>
                        <Button size="sm" variant="outline" onClick={()=>toggleActive(row.id)}>{row.active ? "Disable" : "Enable"}</Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={()=>remove(row.id)}><Trash2 className="mr-1 h-4 w-4" /> Remove</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-end gap-2 text-sm">
            <Button variant="outline" className="rounded-xl" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
            <Button className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
