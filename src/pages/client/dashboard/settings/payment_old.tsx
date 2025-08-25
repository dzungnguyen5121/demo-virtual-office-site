import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Bell,
  Settings,
  Phone,
  FileText,
  Globe2,
  User2,
  CreditCard,
  LayoutDashboard,
  ChevronDown,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------- i18n ----------------
const tDict = {
  en: {
    dashboard: "Dashboard",
    profile: "Profile",
    manageCalls: "Manage Calls",
    manageDocs: "Manage Documents",
    billing: "Billing",
    settings: "Settings",
    submenu: { general: "General", payment: "Payment" },
    logout: "Log out",
    notifications: "Notifications",
    payment: "Payment",
    addCard: "Add Card",
    makeDefault: "Make default",
    default: "Default",
    holder: "Card Holder Name",
    number: "Card Number",
    expiry: "Expiry (MM/YY)",
    save: "Save",
    cancel: "Cancel",
    noCard: "No saved cards. Add your first card.",
    removeCard: "Remove card",
    confirmRemoveTitle: "Remove this card?",
    confirmRemoveDesc:
      "This card will be removed from your account. If it's your default, the next card will become default.",
    confirm: "Confirm",
    cannotRemoveLast: "You cannot remove the last remaining card.",
  },
  vi: {
    dashboard: "Bảng điều khiển",
    profile: "Hồ sơ",
    manageCalls: "Quản lý cuộc gọi",
    manageDocs: "Quản lý tài liệu",
    billing: "Thanh toán",
    settings: "Cài đặt",
    submenu: { general: "Chung", payment: "Thanh toán" },
    logout: "Đăng xuất",
    notifications: "Thông báo",
    payment: "Thanh toán",
    addCard: "Thêm thẻ",
    makeDefault: "Đặt làm mặc định",
    default: "Mặc định",
    holder: "Tên chủ thẻ",
    number: "Số thẻ",
    expiry: "Ngày hết hạn (MM/YY)",
    save: "Lưu",
    cancel: "Hủy",
    noCard: "Chưa có thẻ nào. Hãy thêm thẻ đầu tiên.",
    removeCard: "Xóa thẻ",
    confirmRemoveTitle: "Xóa thẻ này?",
    confirmRemoveDesc:
      "Thẻ sẽ bị xóa khỏi tài khoản. Nếu là thẻ mặc định, thẻ kế tiếp sẽ được đặt mặc định.",
    confirm: "Xác nhận",
    cannotRemoveLast: "Bạn không thể xóa thẻ cuối cùng.",
  },
} as const;

type Lang = keyof typeof tDict;

type UserCard = {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  expiry: string; // MM/YY
  isDefault: boolean;
};

export default function PaymentPage() {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("vo_lang") as Lang) || "vi");
  const t = useMemo(() => tDict[lang], [lang]);

  const notifRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const user = { name: "Nguyễn Văn A", email: "nguyenvana@company.com" };
  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    setCards([
      { id: "c1", brand: "Visa", last4: "4242", holder: "Nguyen Van A", expiry: "12/28", isDefault: true },
      { id: "c2", brand: "Mastercard", last4: "8888", holder: "Nguyen Van A", expiry: "06/27", isDefault: false },
    ]);
  }, []);

  const handleAddCard = (card: UserCard) => {
    setCards((prev) => [card, ...prev]);
    setShowForm(false);
  };

  const handleMakeDefault = (id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  const handleAskRemove = (id: string) => {
    if (cards.length === 1) {
      alert(t.cannotRemoveLast);
      return;
    }
    setConfirmId(id);
  };

  const handleConfirmRemove = () => {
    if (!confirmId) return;
    setCards((prev) => {
      const wasDefault = prev.find((c) => c.id === confirmId)?.isDefault;
      const next = prev.filter((c) => c.id !== confirmId);
      if (wasDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
      return next;
    });
    setConfirmId(null);
  };

  const handleCancelRemove = () => setConfirmId(null);

  // helper to get card by id for modal display
  const selectedCard = confirmId ? cards.find((c) => c.id === confirmId) : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F6FA] font-sans">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-white p-6 md:flex">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2647]">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Virtual Office UK</span>
          </div>
          <nav className="flex flex-col gap-2">
            <a href="#dashboard" className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#F5F6FA]"><LayoutDashboard className="h-5 w-5" /> {t.dashboard}</a>
            <a href="#profile" className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#F5F6FA]"><User2 className="h-5 w-5" /> {t.profile}</a>
            <a href="#calls" className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#F5F6FA]"><Phone className="h-5 w-5" /> {t.manageCalls}</a>
            <a href="#docs" className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#F5F6FA]"><FileText className="h-5 w-5" /> {t.manageDocs}</a>
            <a href="#billing" className="group flex items-center gap-2 rounded-lg bg-[#F5F6FA] px-3 py-2 font-semibold"><CreditCard className="h-5 w-5" /> {t.billing}</a>
            <div className="group relative">
              <a href="#settings" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#F5F6FA]"><Settings className="h-5 w-5" /> {t.settings}</a>
              <div className="pointer-events-none absolute left-full top-0 z-10 ml-1 w-44 rounded-xl border bg-white py-1 opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:opacity-100">
                <a href="#settings-general" className="block px-3 py-2 text-sm hover:bg-slate-50">{t.submenu.general}</a>
                <a href="#settings-payment" className="block px-3 py-2 text-sm hover:bg-slate-50">{t.submenu.payment}</a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-6 py-4">
            <h1 className="text-xl font-bold">{t.payment}</h1>
            <div className="flex items-center gap-3">
              <button onClick={() => setLang((l) => (l === "en" ? "vi" : "en"))} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"><Globe2 className="h-4 w-4" /> {lang.toUpperCase()}</button>
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen((o) => !o)} className="relative rounded-full p-2 hover:bg-slate-100"><Bell className="h-5 w-5 text-slate-600" /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#F5B700]" /></button>
                {notifOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl border bg-white shadow-xl">
                    <div className="border-b px-4 py-2 text-sm font-medium">{t.notifications}</div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setUserMenuOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-xl border px-2 py-1 hover:bg-slate-50" aria-label="User menu">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A2647] text-xs font-bold text-white">{initials}</div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border bg-white shadow-xl">
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">{t.logout}</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Payment Section */}
          <section id="payment" className="px-6 py-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{t.payment}</h2>
              <Button onClick={() => setShowForm(true)} className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]"><Plus className="mr-2 h-4 w-4" /> {t.addCard}</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.length === 0 ? (
                <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-600">{t.noCard}</div>
              ) : (
                cards.map((c) => (
                  <Card key={c.id} className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5 text-[#0A2647]" />{c.brand} ****{c.last4}</CardTitle>
                      {c.isDefault && (
                        <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> {t.default}</span>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">{c.holder}</p>
                      <p className="text-sm text-slate-600">{c.expiry}</p>
                      <div className="mt-3 flex gap-2">
                        {!c.isDefault && (
                          <Button variant="outline" className="rounded-xl border text-sm" onClick={() => handleMakeDefault(c.id)}>{t.makeDefault}</Button>
                        )}
                        <Button variant="outline" className="rounded-xl border text-sm text-red-600 hover:bg-red-50" onClick={() => handleAskRemove(c.id)}>
                          <Trash2 className="mr-1 h-4 w-4" /> {t.removeCard}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Add Card Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">{t.addCard}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = new FormData(form);
                const num = (data.get("number") as string) || "";
                handleAddCard({
                  id: Math.random().toString(36).slice(2),
                  brand: num.startsWith("4") ? "Visa" : "Mastercard",
                  last4: num.slice(-4),
                  holder: data.get("holder") as string,
                  expiry: data.get("expiry") as string,
                  isDefault: cards.length === 0,
                });
              }}
              className="space-y-4"
            >
              <input name="holder" placeholder={t.holder} required className="w-full rounded-xl border px-3 py-2 text-sm" />
              <input name="number" placeholder={t.number} required className="w-full rounded-xl border px-3 py-2 text-sm" />
              <input name="expiry" placeholder={t.expiry} required className="w-full rounded-xl border px-3 py-2 text-sm" />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowForm(false)} variant="outline" className="rounded-xl border text-sm">{t.cancel}</Button>
                <Button type="submit" className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]">{t.save}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Remove Dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold">{t.confirmRemoveTitle}</h2>
            {selectedCard && (
              <p className="mb-2 text-sm font-medium text-slate-800">{selectedCard.brand} ****{selectedCard.last4}</p>
            )}
            <p className="mb-4 text-sm text-slate-600">{t.confirmRemoveDesc}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl border text-sm" onClick={handleCancelRemove}>{t.cancel}</Button>
              <Button className="rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={handleConfirmRemove}>{t.confirm}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
