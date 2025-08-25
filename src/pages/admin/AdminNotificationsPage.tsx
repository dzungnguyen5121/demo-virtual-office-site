import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const t = {
  notify: {
    title: "System Notifications",
    sub: "Send broadcast messages to users and review delivery history.",
    composer: "Compose Notification",
    list: "Sent Notifications",
    target: "Target",
    all: "All users",
    group: "Group",
    usernames: "Usernames (comma / new line)",
    subject: "Subject",
    body: "Message",
    sendNow: "Send now",
    saveDraft: "Save draft",
    cancel: "Cancel",
    createdAt: "Created",
    sentBy: "Sender",
    recipients: "Recipients",
    actions: "Actions",
    remove: "Remove",
    search: "Search subject or message…",
    empty: "No notifications yet.",
    page: (x:number,y:number)=>`Page ${x} of ${y}`,
    prev: "Prev",
    next: "Next",
  }
};

type Target = 'ALL' | 'GROUP';

type SysNotify = {
  id: string;
  subject: string;
  body: string;
  target: Target;
  usernames?: string[];
  createdAt: string; // ISO
  sentBy: string;
};

function loadNotifies(): SysNotify[] {
  try { const raw = localStorage.getItem('sys_notifications'); if(raw) return JSON.parse(raw); } catch {}
  return [
    { id: 'n1', subject: 'Maintenance Window', body: 'We will perform maintenance on Sunday 02:00-04:00 UTC.', target: 'ALL', usernames: [], createdAt: new Date().toISOString(), sentBy: 'Admin User' },
    { id: 'n2', subject: 'Welcome Offer', body: 'Exclusive info for selected users.', target: 'GROUP', usernames: ['alice','bob'], createdAt: new Date().toISOString(), sentBy: 'Admin User' },
  ];
}
function saveNotifies(list: SysNotify[]){ try { localStorage.setItem('sys_notifications', JSON.stringify(list)); } catch {} }

function parseUserList(s:string){
  return s.split(/[\n,]/).map(x=>x.trim()).filter(Boolean);
}

export default function AdminNotificationsPage(){
  const [items, setItems] = useState<SysNotify[]>(()=> loadNotifies());
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<Target>('ALL');
  const [usernamesInput, setUsernamesInput] = useState('');
  const [q, setQ] = useState('');

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    return items.filter(x=> !term || x.subject.toLowerCase().includes(term) || x.body.toLowerCase().includes(term));
  },[items,q]);

  const pageSize = 10; const [page,setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);
  useEffect(()=>setPage(1),[q]);

  const persist = (list: SysNotify[])=>{ setItems(list); saveNotifies(list); };

  function sendNow(){
    if(!subject.trim() || !body.trim()) return;
    if(target==='GROUP' && parseUserList(usernamesInput).length===0) return;
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const row: SysNotify = {
      id,
      subject: subject.trim(),
      body: body.trim(),
      target,
      usernames: target==='GROUP' ? parseUserList(usernamesInput) : [],
      createdAt: new Date().toISOString(),
      sentBy: 'Admin User',
    };
    persist([row, ...items]);
    // reset form
    setSubject(''); setBody(''); setTarget('ALL'); setUsernamesInput('');
  }

  const remove = (id:string)=>{ const next = items.filter(x=>x.id!==id); persist(next); };

  const targetSummary = (n:SysNotify)=> n.target==='ALL' ? t.notify.all : `@${(n.usernames||[]).slice(0,3).join(', ')}${(n.usernames||[]).length>3?` +${(n.usernames||[]).length-3}`:''}`;

  return (
    <>
      <p className="mb-6 text-sm text-slate-600">{t.notify.sub}</p>

      {/* Composer */}
      <Card className="mb-6 rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">{t.notify.composer}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="block text-sm text-slate-700">{t.notify.target}</label>
              <select value={target} onChange={e=>setTarget(e.target.value as Target)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                <option value="ALL">{t.notify.all}</option>
                <option value="GROUP">{t.notify.group}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-700">{t.notify.usernames}</label>
              <textarea value={usernamesInput} onChange={e=>setUsernamesInput(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="alice, bob\nor\nuser1\nuser2" disabled={target!=='GROUP'} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm text-slate-700">{t.notify.subject}</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Title" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm text-slate-700">{t.notify.body}</label>
              <textarea value={body} onChange={e=>setBody(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Write your message…" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="button" variant="outline" onClick={()=>{ setSubject(''); setBody(''); setTarget('ALL'); setUsernamesInput(''); }}>{t.notify.cancel}</Button>
              <Button type="button" className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]" onClick={sendNow} disabled={!subject.trim() || !body.trim() || (target==='GROUP' && parseUserList(usernamesInput).length===0)}>
                <Send className="mr-1 h-4 w-4" /> {t.notify.sendNow}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sent List */}
      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t.notify.list}</CardTitle>
          <div className="mt-2 flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.notify.search} className="w-80 rounded-xl border py-2 pl-9 pr-3 text-sm" />
            </div>
            <div className="text-sm text-slate-600">{t.notify.page(page,totalPages)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="px-3 py-2">{t.notify.createdAt}</th>
                  <th className="px-3 py-2">{t.notify.subject}</th>
                  <th className="px-3 py-2">{t.notify.recipients}</th>
                  <th className="px-3 py-2">{t.notify.sentBy}</th>
                  <th className="px-3 py-2 text-right">{t.notify.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paged.length===0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">{t.notify.empty}</td></tr>
                )}
                {paged.map(row=> (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-900">{row.subject}</div>
                      <div className="line-clamp-2 text-xs text-slate-600">{row.body}</div>
                    </td>
                    <td className="px-3 py-2">{targetSummary(row)}</td>
                    <td className="px-3 py-2">{row.sentBy}</td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={()=>remove(row.id)}><Trash2 className="mr-1 h-4 w-4" /> {t.notify.remove}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-sm">
            <Button variant="outline" className="rounded-xl" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>{t.notify.prev}</Button>
            <Button className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>{t.notify.next}</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
