// Virtual Office - Manage Documents page (Client View)
import { useMemo, useState, useEffect } from "react";
import {
  Calendar,
  AlertCircle,
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

// ---------- i18n dictionary (EN + VI) ----------
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
    docs: {
      title: "Document Inbox",
      memo: "All scanned documents will be automatically deleted after 3 months. Please download and store them if needed.",
      toolbar: {
        month: "Month",
        allMonths: "All months",
        type: "Type",
        allTypes: "All types",
        search: "Search sender or filename…",
        downloadAll: "Download All",
      },
      table: {
        received: "Received",
        sender: "Sender",
        type: "Type",
        scans: "Scans",
        actions: "Actions",
        view: "View",
        download: "Download",
        noResults: "No documents for the selected filters.",
        page: (x: number, y: number) => `Page ${x} of ${y}`,
        prev: "Prev",
        next: "Next",
      },
      detail: {
        title: "Document detail",
        from: "From",
        when: "Received",
        files: "Files",
        downloadCurrent: "Download current",
        downloadAll: "Download all",
        close: "Close",
      },
      types: {
        invoice: "Invoice",
        contract: "Contract",
        official: "Official Letter",
        notice: "Package Notice",
        bank: "Bank Statement",
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
    docs: {
      title: "Hộp thư tài liệu",
      memo:
        "Tất cả bản scan sẽ tự động bị xóa sau 3 tháng. Vui lòng tải về và lưu trữ nếu cần.",
      toolbar: {
        month: "Tháng",
        allMonths: "Tất cả các tháng",
        type: "Loại",
        allTypes: "Tất cả",
        search: "Tìm người gửi hoặc tên file…",
        downloadAll: "Tải tất cả",
      },
      table: {
        received: "Ngày nhận",
        sender: "Người gửi",
        type: "Loại",
        scans: "Bản scan",
        actions: "Thao tác",
        view: "Xem",
        download: "Tải",
        noResults: "Không có tài liệu theo bộ lọc đã chọn.",
        page: (x: number, y: number) => `Trang ${x}/${y}`,
        prev: "Trước",
        next: "Sau",
      },
      detail: {
        title: "Chi tiết tài liệu",
        from: "Người gửi",
        when: "Ngày nhận",
        files: "Tệp",
        downloadCurrent: "Tải tệp đang xem",
        downloadAll: "Tải tất cả",
        close: "Đóng",
      },
      types: {
        invoice: "Hóa đơn",
        contract: "Hợp đồng",
        official: "Công văn",
        notice: "Giấy báo nhận bưu kiện",
        bank: "Sao kê ngân hàng",
      },
    },
  },
};

// ---------- helpers ----------
function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
function download(url: string, filename = "") {
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {}
}
function monthKey(iso: string) {
  return iso.slice(0, 7); // YYYY-MM
}

// ---------- main page ----------
export default function ManageDocumentsPage() {
  // i18n
  const [lang, setLang] = useState<"en" | "vi">("en");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vo_lang");
      if (stored === "en" || stored === "vi") setLang(stored as "en" | "vi");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("vo_lang", lang);
    } catch {}
  }, [lang]);
  const t = useMemo(() => tDict[lang] || tDict.vi, [lang]);

  return <DocumentsSection t={t} />;
}

// ---------- Documents section ----------
function DocumentsSection({ t }: { t: any }) {
  // mock data
  const docs = useMemo(() => mockDocuments(), []);

  // filters
  const months = useMemo(() => buildMonthOptions(docs), [docs]); // array of {key,label}
  const [month, setMonth] = useState("all");
  const [dtype, setDtype] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return docs.filter((d) => {
      const okMonth = month === "all" ? true : monthKey(d.receivedAt) === month;
      const okType = dtype === "all" ? true : d.type === dtype;
      const okSearch =
        !term ||
        d.sender.toLowerCase().includes(term) ||
        d.scans.some((s: any) => s.fileName.toLowerCase().includes(term));
      return okMonth && okType && okSearch;
    });
  }, [docs, month, dtype, q]);

  const downloadAllFiltered = () => {
    filtered.forEach(doc => {
      doc.scans.forEach((scan: any) => {
        download(scan.url, scan.fileName);
      });
    });
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [month, dtype, q]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section id="docs">
      {/* Memo banner */}
      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <AlertCircle className="mt-0.5 h-5 w-5" />
        <p className="text-sm">{t.docs.memo}</p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Month */}
          <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">{t.docs.toolbar.month}</span>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="ml-2 w-[180px] rounded-md border px-2 py-1 text-sm">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.docs.toolbar.allMonths}</SelectItem>
                {months.map((m: {key: string, label: string}) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <span className="text-slate-700">{t.docs.toolbar.type}</span>
            <Select value={dtype} onValueChange={setDtype}>
              <SelectTrigger className="w-[180px] rounded-md border px-2 py-1 text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.docs.toolbar.allTypes}</SelectItem>
                <SelectItem value="invoice">{t.docs.types.invoice}</SelectItem>
                <SelectItem value="contract">{t.docs.types.contract}</SelectItem>
                <SelectItem value="official">{t.docs.types.official}</SelectItem>
                <SelectItem value="notice">{t.docs.types.notice}</SelectItem>
                <SelectItem value="bank">{t.docs.types.bank}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.docs.toolbar.search}
            className="w-72 rounded-xl border py-2 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">{t.manageDocs}</CardTitle>
          <Button
            onClick={downloadAllFiltered}
            disabled={filtered.length === 0}
            className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]"
          >
            <Download className="mr-2 h-4 w-4" />
            {t.docs.toolbar.downloadAll} ({filtered.length})
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="px-3 py-2">{t.docs.table.received}</th>
                  <th className="px-3 py-2">{t.docs.table.sender}</th>
                  <th className="px-3 py-2">{t.docs.table.type}</th>
                  <th className="px-3 py-2">{t.docs.table.scans}</th>
                  <th className="px-3 py-2 text-right">
                    {t.docs.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      {t.docs.table.noResults}
                    </td>
                  </tr>
                )}
                {paged.map((d: any) => (
                  <DocRow key={d.id} d={d} t={t} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-slate-600">
              {t.docs.table.page(page, totalPages)}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                className="rounded-xl"
              >
                {t.docs.table.prev}
              </Button>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]"
              >
                {t.docs.table.next}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function DocRow({ d, t }: { d: any, t: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className="border-b last:border-0">
        <td className="whitespace-nowrap px-3 py-2">
          {formatDateTime(d.receivedAt)}
        </td>
        <td className="px-3 py-2">
          <div className="font-medium text-slate-900">{d.sender}</div>
        </td>
        <td className="px-3 py-2">{mapDocType(t, d.type)}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {d.scans.length} file(s)
            </span>
            <div className="hidden gap-1 md:flex">
              {d.scans.slice(0, 3).map((s: any) => (
                <span
                  key={s.id}
                  className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
                >
                  {s.fileName}
                </span>
              ))}
              {d.scans.length > 3 && (
                <span className="text-xs text-slate-500">
                  +{d.scans.length - 3}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-2 text-right">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={() => setOpen(true)}
          >
            {t.docs.table.view}
          </Button>
        </td>
      </tr>

      {open && <DocDetailModal d={d} t={t} onClose={() => setOpen(false)} />}
    </>
  );
}

function DocDetailModal({ d, t, onClose }: { d: any, t: any, onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const file = d.scans[idx] || d.scans[0];

  const isImage = (m: string) => m && m.startsWith("image/");
  const isPdf = (m: string) => m === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="text-base font-semibold">{t.docs.detail.title}</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-3">
          {/* Viewer */}
          <div className="md:col-span-2">
            <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
              {isImage(file.mime) && (
                <img
                  src={file.url}
                  alt={file.fileName}
                  className="max-h-full max-w-full object-contain"
                />
              )}
              {isPdf(file.mime) && (
                <iframe
                  title={file.fileName}
                  src={file.url}
                  className="h-full w-full"
                />
              )}
              {!isImage(file.mime) && !isPdf(file.mime) && (
                <div className="text-sm text-slate-500">
                  {file.fileName} ({file.mime})
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {d.scans.map((s: any, i: number) => (
                <button
                  key={s.id}
                  onClick={() => setIdx(i)}
                  className={`min-w-[80px] rounded-lg border px-2 py-1 text-xs ${
                    i === idx ? "border-[#0A2647]" : "border-slate-200"
                  }`}
                  title={s.fileName}
                >
                  {s.fileName}
                </button>
              ))}
            </div>
          </div>

          {/* Meta + Actions */}
          <div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">{t.docs.detail.from}</span>
                <span className="font-medium">{d.sender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.docs.detail.when}</span>
                <span className="font-medium">{formatDateTime(d.receivedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.docs.table.type}</span>
                <span className="font-medium">{mapDocType(t, d.type)}</span>
              </div>
              <div className="pt-2 text-slate-600">{t.docs.detail.files}</div>
              <ul className="max-h-36 space-y-1 overflow-auto rounded-lg border p-2 text-xs">
                {d.scans.map((s: any) => (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{s.fileName}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg px-2 py-1"
                      onClick={() => download(s.url, s.fileName)}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      {t.docs.table.download}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]"
                onClick={() => d.scans.forEach((s: any) => download(s.url, s.fileName))}
              >
                <Download className="mr-2 h-4 w-4" />
                {t.docs.detail.downloadAll} ({d.scans.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- mock data ----------
function mockDocuments() {
  const now = new Date();
  const senders = [
    "HMRC",
    "Barclays Bank",
    "ACME Ltd.",
    "Companies House",
    "Royal Mail",
    "Partner Co.",
  ];
  const types = ["invoice", "contract", "official", "notice", "bank"];
  const docs: any[] = [];
  let id = 1;
  for (let i = 0; i < 28; i++) {
    const dt = new Date(now);
    dt.setDate(now.getDate() - Math.floor(Math.random() * 90)); // within last 3 months
    const scanCount = 1 + Math.floor(Math.random() * 3); // 1..3
    const scans = Array.from({ length: scanCount }).map((_, k) => {
      const n = k + 1;
      const mime = Math.random() > 0.75 ? "application/pdf" : "image/jpeg";
      const fileName =
        mime === "application/pdf" ? `scan_${id}_${n}.pdf` : `scan_${id}_${n}.jpg`;
      const url =
        mime === "application/pdf"
          ? "/scans/sample.pdf"
          : `https://via.placeholder.com/980x1300.jpg?text=Scan+${id}-${n}`;
      return { id: `s_${id}_${n}`, url, fileName, mime };
    });
    docs.push({
      id: `doc_${id++}`,
      receivedAt: dt.toISOString(),
      sender: senders[Math.floor(Math.random() * senders.length)],
      type: types[Math.floor(Math.random() * types.length)],
      scans,
    });
  }
  // newest first
  return docs.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

function buildMonthOptions(docs: any[]) {
  const fmt = (key: string) => {
    const [y, m] = key.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  };
  const set = new Set(docs.map((d) => monthKey(d.receivedAt)));
  const arr = Array.from(set).sort((a, b) => (a > b ? -1 : 1)); // latest first
  return arr.map((key: string) => ({ key, label: fmt(key) }));
}

function mapDocType(t: any, typeKey: string) {
  const map = t.docs.types;
  return map[typeKey] || typeKey;
}
