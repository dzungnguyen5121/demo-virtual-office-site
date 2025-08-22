// Virtual Office - Manage Calls page (Client View)
import { useMemo, useState, useEffect } from "react";
import {
  Calendar,
  Download,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// i18n dictionary (EN + VI)
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
    notifItems: [
      "📅 Payment due for September invoice",
      "📞 New call from: +44 20...",
      "📂 New document from: ABC Company",
    ],
    copyright: "© 2025 Virtual Office UK. All rights reserved.",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    chatWithAdmin: "Chat with Admin",
    typeMessage: "Type a message…",
    send: "Send",
    calls: {
      toolbar: {
        dateRange: "Date range",
        last7: "Last 7 days",
        last30: "Last 30 days",
        status: "Status",
        all: "All statuses",
        answered: "Answered",
        missed: "Missed",
        voicemail: "Voicemail",
        search: "Search caller or notes…",
        export: "Export CSV",
        groupBy: "Group by",
        day: "Day",
        week: "Week",
      },
      stats: {
        total: "Total calls",
        answeredRate: "Answered rate",
        avgDuration: "Avg. duration",
      },
      chart: {
        title: "Calls overview",
        answered: "Answered",
        missed: "Missed",
        voicemail: "Voicemail",
        answeredRate: "Answered %",
      },
      table: {
        time: "Time",
        caller: "Caller",
        answeredBy: "Answered by",
        duration: "Duration",
        status: "Status",
        notes: "Notes",
        actions: "Actions",
        view: "View",
        noResults: "No calls found for the selected filters.",
        prev: "Prev",
        next: "Next",
        page: (x: number, y: number) => `Page ${x} of ${y}`,
      },
      detail: {
        title: "Call details",
        close: "Close",
        copy: "Copy number",
        download: "Download recording",
      },
    },
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
    notifItems: [
      "📅 Đến hạn thanh toán hóa đơn tháng 9",
      "📞 Cuộc gọi mới từ: +44 20...",
      "📂 Tài liệu mới từ: Công ty ABC",
    ],
    copyright: "© 2025 Virtual Office UK. Bảo lưu mọi quyền.",
    terms: "Điều khoản dịch vụ",
    privacy: "Chính sách bảo mật",
    chatWithAdmin: "Chat với Admin",
    typeMessage: "Nhập tin nhắn…",
    send: "Gửi",
    calls: {
      toolbar: {
        dateRange: "Khoảng thời gian",
        last7: "7 ngày gần đây",
        last30: "30 ngày gần đây",
        status: "Trạng thái",
        all: "Tất cả",
        answered: "Đã trả lời",
        missed: "Nhỡ",
        voicemail: "Voicemail",
        search: "Tìm số gọi/ghi chú…",
        export: "Xuất CSV",
        groupBy: "Nhóm theo",
        day: "Ngày",
        week: "Tuần",
      },
      stats: {
        total: "Tổng cuộc gọi",
        answeredRate: "Tỉ lệ trả lời",
        avgDuration: "Thời lượng TB",
      },
      chart: {
        title: "Tổng quan cuộc gọi",
        answered: "Đã trả lời",
        missed: "Nhỡ",
        voicemail: "Voicemail",
        answeredRate: "% trả lời",
      },
      table: {
        time: "Thời gian",
        caller: "Người gọi",
        answeredBy: "Nhân viên",
        duration: "Thời lượng",
        status: "Trạng thái",
        notes: "Ghi chú",
        actions: "Thao tác",
        view: "Xem",
        noResults: "Không có cuộc gọi theo bộ lọc đã chọn.",
        prev: "Trước",
        next: "Sau",
        page: (x: number, y: number) => `Trang ${x}/${y}`,
      },
      detail: {
        title: "Chi tiết cuộc gọi",
        close: "Đóng",
        copy: "Sao chép số",
        download: "Tải ghi âm",
      },
    },
  },
};

export default function ManageCallsPage() {
  const [lang, setLang] = useState<"en" | "vi">("en");
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("vo_lang") : null;
      if (stored === "en" || stored === "vi") setLang(stored);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("vo_lang", lang);
    } catch {}
  }, [lang]);
  const t = useMemo(() => tDict[lang] || tDict.vi, [lang]);

  return <CallsSection t={t} />;
}

// ---------------- Calls (Client View) -----------------
function CallsSection({ t }: { t: any }) {
  const [range, setRange] = useState("7"); // 7 | 30
  const [status, setStatus] = useState("all"); // all | answered | missed | voicemail
  const [q, setQ] = useState("");
  const [groupBy, setGroupBy] = useState("day"); // day | week
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const data = useMemo(() => mockCalls(parseInt(range, 10)), [range]);

  // filter
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((c: any) => {
      const okStatus = status === "all" ? true : c.status === status;
      const okSearch =
        !term ||
        c.caller.number.toLowerCase().includes(term) ||
        (c.caller.name || "").toLowerCase().includes(term) ||
        (c.notes || "").toLowerCase().includes(term);
      return okStatus && okSearch;
    });
  }, [data, status, q]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [range, status, q]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // analytics
  const analytics = useMemo(() => buildAnalytics(filtered, groupBy), [filtered, groupBy]);
  const answeredCount = filtered.filter((c: any) => c.status === "answered").length;
  const avgDur = filtered.length
    ? Math.round(filtered.reduce((s: number, c: any) => s + c.durationSec, 0) / filtered.length)
    : 0;
  const answeredRate = filtered.length ? Math.round((answeredCount / filtered.length) * 100) : 0;

  return (
    <section id="calls">
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">{t.calls.toolbar.dateRange}</span>
            <div className="ml-2 inline-flex rounded-lg bg-slate-100 p-1">
              <button onClick={() => setRange("7")} className={`px-2 py-1 text-xs ${range === "7" ? "rounded-md bg-white shadow" : ""}`}>{t.calls.toolbar.last7}</button>
              <button onClick={() => setRange("30")} className={`px-2 py-1 text-xs ${range === "30" ? "rounded-md bg-white shadow" : ""}`}>{t.calls.toolbar.last30}</button>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <span className="text-slate-700">{t.calls.toolbar.status}</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px] rounded-md border px-2 py-1 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.calls.toolbar.all}</SelectItem>
                <SelectItem value="answered">{t.calls.toolbar.answered}</SelectItem>
                <SelectItem value="missed">{t.calls.toolbar.missed}</SelectItem>
                <SelectItem value="voicemail">{t.calls.toolbar.voicemail}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <span className="text-slate-700">{t.calls.toolbar.groupBy}</span>
            <div className="ml-1 inline-flex rounded-lg bg-slate-100 p-1">
              <button onClick={() => setGroupBy("day")} className={`px-2 py-1 text-xs ${groupBy === "day" ? "rounded-md bg-white shadow" : ""}`}>{t.calls.toolbar.day}</button>
              <button onClick={() => setGroupBy("week")} className={`px-2 py-1 text-xs ${groupBy === "week" ? "rounded-md bg-white shadow" : ""}`}>{t.calls.toolbar.week}</button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.calls.toolbar.search} className="w-64 rounded-xl border py-2 pl-9 pr-3 text-sm" />
          </div>
          <Button onClick={() => exportCSV(filtered)} className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">
            <Download className="mr-2 h-4 w-4" /> {t.calls.toolbar.export}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Stat title={t.calls.stats.total} value={String(filtered.length)} />
        <Stat title={t.calls.stats.answeredRate} value={`${answeredRate}%`} />
        <Stat title={t.calls.stats.avgDuration} value={`${formatDuration(avgDur)}`} />
      </div>

      {/* Chart */}
      <Card className="mb-6 rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t.calls.chart.title}</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={analytics} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => `${v}%`} />
              <Tooltip formatter={(value: any, name: any) => [value, name]} />
              <Legend />
              <Bar yAxisId="left" dataKey="answered" name={t.calls.chart.answered} stackId="a" fill="#00A896" />
              <Bar yAxisId="left" dataKey="missed" name={t.calls.chart.missed} stackId="a" fill="#ef4444" />
              <Bar yAxisId="left" dataKey="voicemail" name={t.calls.chart.voicemail} stackId="a" fill="#F5B700" />
              <Line yAxisId="right" type="monotone" dataKey="answeredRate" name={t.calls.chart.answeredRate} stroke="#0A2647" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t.manageCalls}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="px-3 py-2">{t.calls.table.time}</th>
                  <th className="px-3 py-2">{t.calls.table.caller}</th>
                  <th className="px-3 py-2">{t.calls.table.answeredBy}</th>
                  <th className="px-3 py-2">{t.calls.table.duration}</th>
                  <th className="px-3 py-2">{t.calls.table.status}</th>
                  <th className="px-3 py-2">{t.calls.table.notes}</th>
                  <th className="px-3 py-2 text-right">{t.calls.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-slate-500">{t.calls.table.noResults}</td>
                  </tr>
                )}
                {paged.map((c: any) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="whitespace-nowrap px-3 py-2">{formatDateTime(c.time)}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{c.caller.name || c.caller.number}</div>
                      <div className="text-xs text-slate-500">{c.caller.name ? c.caller.number : ""}</div>
                    </td>
                    <td className="px-3 py-2">{c.answeredBy || "-"}</td>
                    <td className="px-3 py-2">{formatDuration(c.durationSec)}</td>
                    <td className="px-3 py-2">{statusBadge(c.status, t)}</td>
                    <td className="max-w-[240px] truncate px-3 py-2" title={c.notes || ""}>{c.notes || "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <ViewButton call={c} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-slate-600">{t.calls.table.page(page, totalPages)}</div>
            <div className="flex gap-2">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} variant="outline" className="rounded-xl">
                {t.calls.table.prev}
              </Button>
              <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">
                {t.calls.table.next}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Stat({ title, value }: { title: string, value: string }) {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}

function statusBadge(s: string, t: any) {
  const map: { [key: string]: string } = {
    answered: "bg-emerald-100 text-emerald-700",
    missed: "bg-red-100 text-red-700",
    voicemail: "bg-amber-100 text-amber-700",
  };
  const label: { [key: string]: string } = {
    answered: t.calls.toolbar.answered,
    missed: t.calls.toolbar.missed,
    voicemail: t.calls.toolbar.voicemail,
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs ${map[s] || "bg-slate-100 text-slate-700"}`}>{label[s]}</span>;
}

function ViewButton({ call, t }: { call: any, t: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setOpen(true)}>
        {t.calls.table.view}
      </Button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <h3 className="text-base font-semibold">{t.calls.detail.title}</h3>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 p-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">{t.calls.table.time}</span><span className="font-medium">{formatDateTime(call.time)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">{t.calls.table.caller}</span><span className="font-medium">{call.caller.name || call.caller.number}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">{t.calls.table.answeredBy}</span><span className="font-medium">{call.answeredBy || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">{t.calls.table.duration}</span><span className="font-medium">{formatDuration(call.durationSec)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">{t.calls.table.status}</span><span className="font-medium">{call.status}</span></div>
              {call.notes && <div><div className="text-slate-600">{t.calls.table.notes}</div><div className="mt-1 rounded-lg bg-slate-50 p-2">{call.notes}</div></div>}
              <div className="flex items-center gap-2 pt-2">
                <Button className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]" onClick={() => copyToClipboard(call.caller.number)}>{t.calls.detail.copy}</Button>
                {call.recordingUrl && (
                  <Button className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]" onClick={() => downloadRecording(call.recordingUrl)}>
                    {t.calls.detail.download}
                  </Button>
                )}
                <span className="ml-auto text-xs text-slate-500">ID: {call.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function exportCSV(rows: any[]) {
  const headers = ["Time", "Caller Number", "Caller Name", "Answered By", "Duration (s)", "Status", "Notes"];
  const csvContent = [
    headers.join(","),
    ...rows.map(row => [
      `"${new Date(row.time).toLocaleString()}"`,
      `"${row.caller.number}"`,
      `"${row.caller.name || ''}"`,
      `"${row.answeredBy || ''}"`,
      row.durationSec,
      `"${row.status}"`,
      `"${(row.notes || '').replace(/"/g, '""')}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "calls_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatDateTime(iso: string) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
function copyToClipboard(text: string) { try { navigator.clipboard.writeText(text); } catch {} }
function downloadRecording(url: string) {
  try {
    const a = document.createElement("a");
    a.href = url; a.download = "";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch {}
}

function mockCalls(days: number) {
  const now = new Date();
  const out: any[] = [];
  const admins = ["Alice", "Ben", "Chloe", "Daniel"];
  const notes = [
    "Asked for invoice details",
    "Requested call back tomorrow",
    "Left a voicemail",
    "Discussed contract terms",
    "Follow-up email sent",
  ];
  let id = 1;
  for (let d = 0; d < days; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() - d);
    const count = 3 + Math.floor(Math.random() * 5); // 3..7 calls/day
    for (let i = 0; i < count; i++) {
      const time = new Date(day);
      time.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60));
      const statusPool = ["answered", "missed", "voicemail", "answered", "answered"]; // bias answered
      const status = statusPool[Math.floor(Math.random() * statusPool.length)];
      const durationSec = status === "missed" ? 0 : 30 + Math.floor(Math.random() * 240);
      out.push({
        id: `call_${id++}`,
        time: time.toISOString(),
        caller: { number: `+44 20 7${Math.floor(Math.random() * 900000) + 100000}`, name: Math.random() > 0.7 ? "ACME Ltd." : undefined },
        answeredBy: status === "missed" ? undefined : admins[Math.floor(Math.random() * admins.length)],
        durationSec,
        status,
        notes: Math.random() > 0.6 ? notes[Math.floor(Math.random() * notes.length)] : undefined,
        recordingUrl: status === "answered" && Math.random() > 0.6 ? "/recordings/sample.mp3" : undefined,
      });
    }
  }
  return out.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

function buildAnalytics(calls: any[], groupBy: string) {
  const buckets = new Map();
  for (const c of calls) {
    const d = new Date(c.time);
    const key = groupBy === "week" ? `W${getWeekNumber(d)}` : d.toISOString().slice(0, 10);
    const label = groupBy === "week" ? `W${getWeekNumber(d)}` : `${d.getDate()}/${d.getMonth() + 1}`;
    if (!buckets.has(key)) buckets.set(key, { key, label, answered: 0, missed: 0, voicemail: 0 });
    buckets.get(key)[c.status]++;
  }
  const arr = Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));
  return arr.map((row: any) => {
    const total = row.answered + row.missed + row.voicemail;
    const answeredRate = total ? Math.round((row.answered / total) * 100) : 0;
    return { ...row, answeredRate };
  });
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
}
