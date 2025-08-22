import { useMemo, useState, useEffect } from "react";
import {
  Gift,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

// Minimal i18n for this component
const tDict = {
  en: {
    overview: "Overview",
    promotions: "Promotions",
    claimNow: "Claim Now",
    offer: (n:number)=>`Special Offer ${n}`,
  },
  vi: {
    overview: "Tổng quan",
    promotions: "Chương trình khuyến mại",
    claimNow: "Nhận ưu đãi",
    offer: (n:number)=>`Ưu đãi đặc biệt ${n}`,
  },
};

type Lang = keyof typeof tDict;

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

function StatsSection({ t }: { t: any }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{t.overview}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="New mail" value="6" sub="in the last 7 days" />
        <StatCard title="Calls answered" value="42" sub="this month" />
        <StatCard title="Documents" value="128" sub="stored securely" />
        <StatCard title="Plan" value="Business" sub="renews in 22 days" />
      </div>
    </section>
  );
}

function PromotionsSection({ t }: { t: any }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{t.promotions}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((p) => (
          <Card key={p} className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader className="flex flex-row items-center gap-2">
              <Gift className="h-5 w-5 text-[#F5B700]" />
              <CardTitle className="text-base font-semibold">{t.offer(p)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Exclusive discount for your subscription plan. Don’t miss out!</p>
              <Button className="mt-4 rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]">{t.claimNow}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function Overview() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("vo_lang") as Lang) || "en");
  const t = useMemo(() => tDict[lang], [lang]);

  useEffect(() => {
    const handleLangChange = () => {
      setLang((localStorage.getItem("vo_lang") as Lang) || "en");
    };
    window.addEventListener('storage', handleLangChange);
    return () => window.removeEventListener('storage', handleLangChange);
  }, []);


  return (
    <div className="grid gap-6">
      <StatsSection t={t} />
      <PromotionsSection t={t} />
    </div>
  );
}
