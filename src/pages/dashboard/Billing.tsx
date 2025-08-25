// Virtual Office - Billing Page (Client View)
import { useMemo, useState } from "react";
import {
  CreditCard,
  BadgePercent,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  X,
  Landmark,
  Lock,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

// ===== Types =====
type InvoiceStatus = "due" | "overdue" | "dueSoon" | "paid";
type CouponState = null | "invalid" | { code: string; percent: number };

interface InvoiceItem {
  name: string;
  price: number;
}
interface Invoice {
  id: string;
  period: string;
  due: string;
  amount: number;
  status: InvoiceStatus;
  items?: InvoiceItem[];
}

// ===== i18n dictionary =====
const tDict = {
  en: {
    title: "Billing",
    subTitle: "Review your invoices, apply promotions, and complete payment.",
    outstanding: "Outstanding Invoices",
    paidInvoices: "Paid Invoices",
    table: {
      selectAll: "Select all",
      invoice: "Invoice",
      period: "Period",
      dueDate: "Due date",
      amount: "Amount",
      status: "Status",
      actions: "Actions",
      view: "View",
      download: "Download",
      noOutstanding: "No outstanding invoices.",
      noPaid: "No paid invoices.",
      overdue: "Overdue",
      dueSoon: "Due soon",
      due: "Due",
      paid: "Paid",
    },
    filters: {
      search: "Search invoice / period…",
    },
    promo: {
      title: "Promotions",
      none: "No promotion",
      p3: "Prepay 3 months — 10% off",
      p12: "Prepay 12 months — 20% off + Free Mail Handling",
      note:
        "Promotions apply to your current selection. Some promotions may be subject to terms.",
      couponLabel: "Coupon code",
      apply: "Apply",
      clear: "Clear",
      applied: "Coupon applied",
      invalid: "Invalid coupon",
    },
    summary: {
      title: "Payment Summary",
      items: "Item(s)",
      subtotal: "Subtotal",
      promoDiscount: "Promotion discount",
      couponDiscount: "Coupon discount",
      vat: "VAT (20%)",
      total: "Total",
      payNow: "Pay Now",
      disabled: "Select at least one invoice",
      success: "Payment created (mock). Thank you!",
      method: "Payment Method",
      card: "Credit/Debit Card",
      bank: "Bank transfer",
      paypal: "PayPal",
    },
  },
};

// ===== Mock data =====
function mockInvoices(): { outstanding: Invoice[]; paid: Invoice[] } {
  // amounts in GBP
  const today = new Date();
  const addDays = (n: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString();
  };
  return {
    outstanding: [
      {
        id: "INV-2025-0901",
        period: "Sep 2025",
        due: addDays(7),
        amount: 39.0,
        status: "due", // due | overdue | dueSoon
        items: [
          { name: "Virtual Office - London Business Address", price: 29.0 },
          { name: "Mail Handling (per month)", price: 10.0 },
        ],
      },
      {
        id: "INV-2025-0801",
        period: "Aug 2025",
        due: addDays(-5),
        amount: 39.0,
        status: "overdue",
        items: [
          { name: "Virtual Office - London Business Address", price: 29.0 },
          { name: "Mail Handling (per month)", price: 10.0 },
        ],
      },
    ],
    paid: [
      {
        id: "INV-2025-0701",
        period: "Jul 2025",
        due: "2025-07-10T12:00:00.000Z",
        amount: 39.0,
        status: "paid",
        items: [
          { name: "Virtual Office - London Business Address", price: 29.0 },
          { name: "Mail Handling (per month)", price: 10.0 },
        ],
      },
      {
        id: "INV-2025-0601",
        period: "Jun 2025",
        due: "2025-06-10T12:00:00.000Z",
        amount: 39.0,
        status: "paid",
        items: [
          { name: "Virtual Office - London Business Address", price: 29.0 },
          { name: "Mail Handling (per month)", price: 10.0 },
        ],
      },
    ],
  };
}

// ===== Utils =====
const GBP = (n: number) =>
  n.toLocaleString("en-GB", { style: "currency", currency: "GBP" });
const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const VAT_RATE = 0.2; // UK VAT 20%

// ===== Component =====
export default function BillingPage() {
  const t = tDict.en;

  const data = useMemo(() => mockInvoices(), []);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() =>
    new Set(data.outstanding.map((i) => i.id)) // preselect all outstanding
  );
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);


  // Promotions
  const [promo, setPromo] = useState("none"); // none | p3 | p12
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<CouponState>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>('card'); // 'card', 'bank', 'paypal'

  // Filtered outstanding by search
  const filteredOutstanding = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data.outstanding;
    return data.outstanding.filter(
      (i) =>
        i.id.toLowerCase().includes(term) ||
        i.period.toLowerCase().includes(term)
    );
  }, [data.outstanding, query]);

  // Selection helpers
  const allVisibleSelected =
    filteredOutstanding.length > 0 &&
    filteredOutstanding.every((i) => selected.has(i.id));
  const toggleSelectAll = () => {
    const s = new Set(selected);
    if (allVisibleSelected) {
      filteredOutstanding.forEach((i) => s.delete(i.id));
    } else {
      filteredOutstanding.forEach((i) => s.add(i.id));
    }
    setSelected(s);
  };
  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  };

  // Price calc
  const subtotal = Array.from(selected)
    .map((id) => data.outstanding.find((i) => i.id === id))
    .filter((inv): inv is Invoice => !!inv)
    .reduce((sum, inv) => sum + inv.amount, 0);

  const promoPct = promo === "p12" ? 0.2 : promo === "p3" ? 0.1 : 0;
  const promoDiscount = round2(subtotal * promoPct);

  const couponPct = (couponApplied && typeof couponApplied === 'object' && couponApplied.percent) || 0;
  const couponDiscount = round2((subtotal - promoDiscount) * couponPct);

  const vat = round2((subtotal - promoDiscount - couponDiscount) * VAT_RATE);
  const total = round2(subtotal - promoDiscount - couponDiscount + vat);

  // Coupon logic — demo codes
  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase();
    if (!c) return setCouponApplied(null);
    // Demo: WELCOME10 = 10%, FIRSTMONTHFREE = 10%0 (cap to 1 invoice amount)
    if (c === "WELCOME10") {
      setCouponApplied({ code: c, percent: 0.1 });
    } else if (c === "FIRSTMONTHFREE") {
      // emulate 100% for first selected invoice by converting to equivalent %
      if (selected.size === 0) return setCouponApplied(null);
      const oneInvoice = data.outstanding.find((i) => selected.has(i.id));
      // convert to percent off on current subtotal (after promo)
      const base = Math.max(0, subtotal - promoDiscount);
      const pct = base > 0 ? Math.min(1, (oneInvoice?.amount ?? 0) / base) : 0;
      setCouponApplied({ code: c, percent: pct });
    } else {
      setCouponApplied("invalid");
      return;
    }
  };

  const clearCoupon = () => {
    setCoupon("");
    setCouponApplied(null);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(prev => prev === method ? null : method);
  };

  const onPay = () => {
    if (selected.size === 0 || !paymentMethod) return;
    // Mock payment callback
    alert(t.summary.success);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-[#0A2647]" />
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.subTitle}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Outstanding */}
          <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#0A2647]" />
                {t.outstanding}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* search + select all */}
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex select-none items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {t.table.selectAll}
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.filters.search}
                    className="w-72 rounded-xl border py-2 pl-9 pr-3 text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed">
                  <thead>
                    <tr className="border-b text-slate-600">
                      <th className="py-2 whitespace-nowrap w-12"></th>
                      <th className="py-2 whitespace-nowrap">{t.table.invoice}</th>
                      <th className="py-2 whitespace-nowrap">{t.table.period}</th>
                      <th className="py-2 whitespace-nowrap">{t.table.dueDate}</th>
                      <th className="py-2 whitespace-nowrap">{t.table.amount}</th>
                      <th className="py-2 whitespace-nowrap">{t.table.status}</th>
                      <th className="py-2 whitespace-nowrap w-24">{t.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOutstanding.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-6 text-center text-slate-500"
                        >
                          {t.table.noOutstanding}
                        </td>
                      </tr>
                    )}

                    {filteredOutstanding.map((inv) => (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => setViewingInvoice(inv)}>
                        <td className="py-2">
                          <input
                            type="checkbox"
                            checked={selected.has(inv.id)}
                            onClick={(e) => e.stopPropagation()} // prevent row click from triggering when clicking checkbox
                            onChange={() => toggleSelect(inv.id)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </td>
                        <td className="py-2 font-medium text-slate-900">
                          {inv.id}
                        </td>
                        <td className="py-2">{inv.period}</td>
                        <td className="py-2 whitespace-nowrap">
                          {fmtDate(inv.due)}
                        </td>
                        <td className="py-2">{GBP(inv.amount)}</td>
                        <td className="py-2">
                          <StatusBadge status={inv.status} t={t} />
                        </td>
                        <td className="py-2">
                          <Button size="icon" variant="outline" className="rounded-xl h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Paid */}
          <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader className="pb-2">
              <CardTitle>{t.paidInvoices}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-600">
                      <th className="py-2 whitespace-nowrap">{t.table.invoice}</th>
                      <th className="py-2 whitespace-nowrap">{t.table.period}</th>
                      <th className="py-2 whitespace-nowrap">{t.table.dueDate}</th>
                      <th className="py-2 whitespace-nowrap">{t.table.amount}</th>
                      <th className="py-2 whitespace-nowrap">{t.table.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.paid.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center text-slate-500"
                        >
                          {t.table.noPaid}
                        </td>
                      </tr>
                    )}
                    {data.paid.map((inv) => (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => setViewingInvoice(inv)}>
                        <td className="py-2 font-medium text-slate-900">
                          {inv.id}
                        </td>
                        <td className="py-2">{inv.period}</td>
                        <td className="py-2 whitespace-nowrap">
                          {fmtDate(inv.due)}
                        </td>
                        <td className="py-2">{GBP(inv.amount)}</td>
                        <td className="py-2">
                          <StatusBadge status="paid" t={t} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: promotions + summary */}
        <div className="space-y-6">
          {/* Promotions */}
          <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BadgePercent className="h-5 w-5 text-[#0A2647]" />
                {t.promo.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioRow
                checked={promo === "none"}
                onChange={() => setPromo("none")}
                title={t.promo.none}
                desc=""
              />
              <RadioRow
                checked={promo === "p3"}
                onChange={() => setPromo("p3")}
                title={t.promo.p3}
                desc="Billed now on selected invoices; renewals follow your plan."
              />
              <RadioRow
                checked={promo === "p12"}
                onChange={() => setPromo("p12")}
                title={t.promo.p12}
                desc="Best value. Applies to current selection; terms may apply."
              />

              <div className="mt-3 rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
                {t.promo.note}
              </div>

              {/* Coupon */}
              <div className="pt-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.promo.couponLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => {
                      setCoupon(e.target.value);
                      if (!e.target.value) setCouponApplied(null);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                    placeholder="WELCOME10 / FIRSTMONTHFREE"
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  />
                  <Button
                    onClick={applyCoupon}
                    className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]"
                  >
                    {t.promo.apply}
                  </Button>
                </div>
                {couponApplied === "invalid" && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    {t.promo.invalid}
                  </div>
                )}
                {couponApplied && couponApplied !== "invalid" && (
                  <div className="mt-2 flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                    <div className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t.promo.applied}: {couponApplied.code} (-
                      {Math.round((couponApplied.percent || 0) * 100)}%)
                    </div>
                    <button onClick={clearCoupon} className="rounded-full p-0.5 hover:bg-emerald-200/50">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                 )}
               </div>
             </CardContent>
           </Card>

          {/* Summary */}
          <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader className="pb-4">
              <CardTitle>{t.summary.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {t.summary.items}: {Array.from(selected).length}
                  </span>
                  <span className="font-semibold">{GBP(subtotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">{t.summary.promoDiscount} ({promoPct * 100}%)</span>
                    <span className="font-semibold text-emerald-700">
                      -{GBP(promoDiscount)}
                    </span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">{t.summary.couponDiscount} ({Math.round(couponPct*100)}%)</span>
                    <span className="font-semibold text-emerald-700">
                      -{GBP(couponDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t.summary.vat}</span>
                  <span className="font-semibold">{GBP(vat)}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-100 p-3 text-base font-bold">
                <span>{t.summary.total}</span>
                <span className="text-xl">{GBP(total)}</span>
              </div>

              {/* Payment method (mock) */}
              <div className="pt-2">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  {t.summary.method}
                </div>
                <div className="flex flex-col gap-2">
                  <PMButton label={t.summary.card} icon={<CreditCard className="h-4 w-4" />} active={paymentMethod === 'card'} onClick={() => handlePaymentMethodSelect('card')} />
                  <PMButton label={t.summary.bank} icon={<Landmark className="h-4 w-4" />} active={paymentMethod === 'bank'} onClick={() => handlePaymentMethodSelect('bank')} />
                  <PMButton label={t.summary.paypal} icon={<svg className="h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>PayPal</title><path d="M7.935 2.632c.184-.94.853-1.613 1.76-1.794a1.76 1.76 0 0 1 .151-.018H18.25a1.75 1.75 0 0 1 1.745 1.579l-1.42 9.213c-.143.92-.815 1.59-1.728 1.765a1.76 1.76 0 0 1-.163.019H7.288a1.75 1.75 0 0 1-1.745-1.579L4.12 3.602c-.08-.52.265-.997.773-1.074.06-.009.12-.014.18-.014l2.862.018zm.62 1.776H6.133l1.29 8.356a.25.25 0 0 0 .248.225h8.397a.25.25 0 0 0 .247-.22l1.29-8.361H10.33a.25.25 0 0 0-.247.22l-.24 1.559H8.79a.25.25 0 0 1-.235-.333l.001-.002z M8.71 14.288l.24-1.558h1.053l.24 1.558H8.71z M14.88 23.13a.25.25 0 0 1-.247-.22l-.46-2.98h-.012l-.24 1.55h-1.052l.462 2.987a.25.25 0 0 1-.248.274H4.375a.25.25 0 0 1 0-.5h7.947a.75.75 0 0 0 .742-.658l.46-2.98h.024l.472 3.064a.75.75 0 0 0 .742.658h3.33a.25.25 0 0 1 0 .5h-3.37zm-2.812-7.05h1.053l-.24-1.558h-1.053l-.24 1.558h.48z"/></svg>} active={paymentMethod === 'paypal'} onClick={() => handlePaymentMethodSelect('paypal')} />
                </div>
              </div>

              <Button
                disabled={selected.size === 0 || !paymentMethod}
                onClick={onPay}
                className={`mt-2 w-full rounded-xl text-base py-3 ${
                  selected.size === 0 || !paymentMethod
                    ? "bg-slate-300 text-slate-600"
                    : "bg-[#0A2647] text-white hover:bg-[#0b305f] animate-pulse"
                }`}
                title={selected.size === 0 || !paymentMethod ? t.summary.disabled : t.summary.payNow}
              >
                {(selected.size === 0 || !paymentMethod) && <Lock className="h-4 w-4 mr-2" />}
                 {t.summary.payNow}
               </Button>
             </CardContent>
           </Card>
        </div>
      </div>
      {viewingInvoice && <InvoiceDetailsDialog invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} t={t} />}
    </>
  );
}

// ===== Subcomponents =====
function InvoiceDetailsDialog({ invoice, onClose, t }: { invoice: Invoice; onClose: () => void; t: any }) {
  const subtotal = invoice.amount;
  const vat = round2(subtotal * VAT_RATE);
  const total = round2(subtotal + vat);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">{t.table.invoice} {invoice.id}</h2>
            <p className="text-sm text-slate-600">{invoice.period} &bull; Due: {fmtDate(invoice.due)}</p>
          </div>
          <StatusBadge status={invoice.status} t={t} />
        </div>

        <div className="my-4 h-px bg-slate-200" />

        <div className="space-y-2 text-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Details</h3>
          {invoice.items?.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-slate-600">{item.name}</span>
              <span className="font-medium text-slate-800">{GBP(item.price)}</span>
            </div>
          ))}
        </div>

        <div className="my-4 h-px bg-slate-200" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">{t.summary.subtotal}</span>
            <span className="font-semibold text-slate-900">{GBP(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{t.summary.vat}</span>
            <span className="font-semibold text-slate-900">{GBP(vat)}</span>
          </div>
          <div className="flex justify-between font-bold text-base mt-2">
            <span className="text-slate-900">{t.summary.total}</span>
            <span className="text-slate-900">{GBP(total)}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" className="rounded-xl" onClick={onClose}>Close</Button>
          {invoice.status !== 'paid' && (
           <Button className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">Pay this invoice</Button>
          )}
        </div>
      </div>
    </div>
  );
}


function StatusBadge({ status, t }: { status: InvoiceStatus; t: any }) {
  const map: Record<InvoiceStatus, string> = {
    overdue: "bg-red-100 text-red-700",
    dueSoon: "bg-amber-100 text-amber-700",
    due: "bg-slate-100 text-slate-700",
    paid: "bg-emerald-100 text-emerald-700",
  };
  const label =
    status === "overdue"
      ? t.table.overdue
      : status === "dueSoon"
      ? t.table.dueSoon
      : status === "paid"
      ? t.table.paid
      : t.table.dueDate;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${map[status] || map.due}`}>
      {label}
    </span>
  );
}

function RadioRow({ checked, onChange, title, desc }: { checked: boolean; onChange: () => void; title: string; desc: string }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
        checked ? "border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/20" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <input
        type="radio"
        name="promotion"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4"
      />
      <div>
        <div className="font-medium text-slate-900">{title}</div>
        {desc && <div className="text-xs text-slate-600">{desc}</div>}
      </div>
    </label>
  );
}

function PMButton({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean, onClick: () => void }) {
  return (
     <button
      type="button"
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl border p-3 text-left text-sm transition-all ${
        active ? "border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/30" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
     > 
        <div className="flex items-center justify-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
            {icon}
          </div>
          <span className="font-medium text-slate-800">{label}</span>
        </div>
        {active && (
          <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-3 h-5 w-5 text-sky-600" />
        )}
      </button>
   );
 }
 
 // ===== helpers =====
function round2(n: number) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}
