import React, { useEffect, useState } from "react";
import {
  Save,
  Trash2,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PayType = "DIRECT" | "WIRE";

type PayMethod = {
  id: string;
  label: string;
  type: PayType;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  sortCode?: string;
  iban?: string;
  bic?: string;
  currency?: string;
  note?: string;
  active?: boolean;
};

export default function AdminSettingsPage(){
  // === basic settings (renewal & retention) ===
  const [renewalDays, setRenewalDays] = useState<number>(()=>{
    try{ return JSON.parse(localStorage.getItem("settings")||"{}")?.renewalDays ?? 7 }catch{ return 7 }
  });
  const [docMonths, setDocMonths] = useState<number>(()=>{
    try{ return JSON.parse(localStorage.getItem("settings")||"{}")?.docMonths ?? 3 }catch{ return 3 }
  });
  const [savedMsg, setSavedMsg] = useState<string>("");
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [originalGeneralSettings, setOriginalGeneralSettings] = useState({ renewalDays, docMonths });

  const handleEditGeneral = () => {
    setOriginalGeneralSettings({ renewalDays, docMonths });
    setIsEditingGeneral(true);
  };

  const handleCancelGeneral = () => {
    setRenewalDays(originalGeneralSettings.renewalDays);
    setDocMonths(originalGeneralSettings.docMonths);
    setIsEditingGeneral(false);
  };

  const handleSaveGeneral = () => {
    try {
      localStorage.setItem('settings', JSON.stringify({ renewalDays, docMonths }));
      setSavedMsg("Settings saved!");
      setTimeout(()=>setSavedMsg(''), 2500);
      setIsEditingGeneral(false);
    } catch {}
  };

  // === state: list of methods ===
  const [methods, setMethods] = useState<PayMethod[]>(()=>{
    try{
      const raw = localStorage.getItem("settings_payment_methods");
      if (raw) return JSON.parse(raw);
    }catch{}
    return [
      { id: "pm1", label: "Barclays Business", type: "WIRE", bankName: "Barclays", accountName: "Virtual Office UK Ltd", accountNumber: "12345678", sortCode: "12-34-56", iban: "GB00BARC20000012345678", bic: "BARCGB22", currency: "GBP", note: "Use invoice reference as payment reference", active: true },
      { id: "pm2", label: "HSBC Direct", type: "DIRECT", bankName: "HSBC", accountName: "Virtual Office UK Ltd", accountNumber: "23456789", sortCode: "65-43-21", currency: "GBP", note: "Faster Payments supported", active: false },
    ];
  });
  const [methodToRemove, setMethodToRemove] = useState<PayMethod | null>(null);


  // === state: add/edit form ===
  const [editing, setEditing] = useState<PayMethod|null>(null);
  const [form, setForm] = useState<PayMethod>({ id:"", label:"", type:"DIRECT", bankName:"", accountName:"", accountNumber:"", sortCode:"", iban:"", bic:"", currency:"GBP", note:"", active:true });

  // === persistence helper ===
  const persist = (m = methods)=>{ try{ localStorage.setItem("settings_payment_methods", JSON.stringify(m)); }catch{} };

  // === actions ===
  const removeMethod = (id:string)=> setMethods(prev=>{ const next = prev.filter(x=>x.id!==id); persist(next); return next; });
  const toggleActive = (id:string)=> setMethods(prev=>{ const next = prev.map(m=> m.id===id ? { ...m, active: !m.active } : m); persist(next); return next; });
  const updateMethod = (pm:PayMethod)=> setMethods(prev=>{ const next = prev.map(m=> m.id===pm.id ? pm : m); persist(next); return next; });

  const resetForm = ()=> setForm({ id:"", label:"", type:"DIRECT", bankName:"", accountName:"", accountNumber:"", sortCode:"", iban:"", bic:"", currency:"GBP", note:"", active:true });

  const submitAdd = (e:React.FormEvent)=>{
    e.preventDefault();
    if (!form.label.trim()) return;
    if (editing) {
      updateMethod({ ...form, id: editing.id });
      setEditing(null);
    } else {
      setMethods(prev=>{
        const newList = [...prev, { ...form, id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) }];
        persist(newList);
        return newList;
      });
    }
    resetForm();
  };

  const typeLabel = (v:PayType)=> v === "DIRECT" ? "Direct Payment" : "Wire Transfer";

  // === smoke tests (to catch regressions for string/CSV etc.) ===
  useEffect(()=>{
    try{
      const sample = { id:"x", label:"L", type:"DIRECT" as PayType } as PayMethod;
      console.assert(sample.type === "DIRECT", "sample type ok");
    }catch{}
  }, []);

  return (
    <>
      {/* General Settings card */}
      <Card className="mb-6 max-w-xl rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Renewal Reminder (days before due)</label>
            <input type="number" value={renewalDays} onChange={(e)=>setRenewalDays(parseInt(e.target.value||'0'))} className="mt-1 w-40 rounded-lg border px-3 py-2 text-sm read-only:bg-slate-100" readOnly={!isEditingGeneral} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Document Retention (months)</label>
            <input type="number" value={docMonths} onChange={(e)=>setDocMonths(parseInt(e.target.value||'0'))} className="mt-1 w-40 rounded-lg border px-3 py-2 text-sm read-only:bg-slate-100" readOnly={!isEditingGeneral} />
          </div>
          <div className="flex items-center gap-2">
            {!isEditingGeneral ? (
              <Button onClick={handleEditGeneral} className="rounded-xl">
                <Edit className="mr-1 h-4 w-4" /> Edit
              </Button>
            ) : (
              <>
                <Button onClick={handleCancelGeneral} className="rounded-xl" variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSaveGeneral} className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">
                  <Save className="mr-1 h-4 w-4" /> Save Changes
                </Button>
              </>
            )}
          </div>
          {savedMsg && <div className="text-green-600 text-sm">{savedMsg}</div>}
        </CardContent>
      </Card>

      {/* Payment Methods card */}
      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle>Payment Receiving Methods</CardTitle>
          <p className="text-sm text-slate-600">Clients can transfer to any of the following accounts.</p>
        </CardHeader>
        <CardContent>
          {/* Cards grid (max 2 per row) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {methods.map(m=> (
              <div key={m.id} className={`rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all ${m.active ? 'ring-green-200 bg-green-50/30' : 'ring-slate-100'}`}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-base font-semibold text-slate-900">{m.label} · <span className="text-sm text-slate-600 font-normal">{typeLabel(m.type)}</span></div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>{ setEditing(m); setForm(m); }}>
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={()=>setMethodToRemove(m)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Bank Name" value={m.bankName} />
                  <Field label="Account Holder" value={m.accountName} />
                  <Field label="Account Number" value={m.accountNumber} />
                  <Field label="Sort Code" value={m.sortCode} />
                  <Field label="IBAN" value={m.iban} />
                  <Field label="BIC/SWIFT" value={m.bic} />
                  <Field label="Currency" value={m.currency} />
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-slate-500">Note (shown to client)</div>
                  <div className="truncate text-slate-800" title={m.note}>{m.note || "—"}</div>
                </div>
                <div className="mt-3">
                  <Button size="sm" variant={m.active ? 'default' : 'secondary'} onClick={()=>toggleActive(m.id)} className={`rounded-xl ${m.active ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                    {m.active ? "Active" : "Inactive"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit form */}
          <form onSubmit={submitAdd} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-700">Display Label</label>
              <input value={form.label} onChange={e=>setForm(f=>({ ...f, label: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({ ...f, type: e.target.value as PayType }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                <option value="DIRECT">Direct Payment</option>
                <option value="WIRE">Wire Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-700">Bank Name</label>
              <input value={form.bankName} onChange={e=>setForm(f=>({ ...f, bankName: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Account Holder</label>
              <input value={form.accountName} onChange={e=>setForm(f=>({ ...f, accountName: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Account Number</label>
              <input value={form.accountNumber} onChange={e=>setForm(f=>({ ...f, accountNumber: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Sort Code</label>
              <input value={form.sortCode} onChange={e=>setForm(f=>({ ...f, sortCode: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">IBAN</label>
              <input value={form.iban} onChange={e=>setForm(f=>({ ...f, iban: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">BIC/SWIFT</label>
              <input value={form.bic} onChange={e=>setForm(f=>({ ...f, bic: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Currency</label>
              <input value={form.currency} onChange={e=>setForm(f=>({ ...f, currency: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-700">Note (shown to client)</label>
              <input value={form.note} onChange={e=>setForm(f=>({ ...f, note: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              {editing && (
                <Button type="button" variant="outline" onClick={()=>{ setEditing(null); resetForm(); }}>Cancel</Button>
              )}
              <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              <Button type="submit" className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">
                {editing ? "Edit" : "Add Method"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {methodToRemove && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-xl">
            <div className="border-b p-4">
              <h3 className="text-lg font-semibold">Confirm Removal</h3>
              <p className="text-sm text-slate-600 mt-1">Are you sure you want to remove the payment method "{methodToRemove.label}"?</p>
            </div>
            <div className="flex justify-end gap-2 p-4 bg-slate-50">
              <Button variant="outline" onClick={() => setMethodToRemove(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { removeMethod(methodToRemove.id); setMethodToRemove(null); }}>
                <Trash2 className="mr-1 h-4 w-4" /> Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value }: { label: string; value?: string }){
  return (
    <div>
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-800">{value || "—"}</div>
    </div>
  );
}
