import { NavLink } from "react-router-dom";
import {
  Building2,
  Home,
  Phone,
  Files,
  Settings,
  User2,
  CreditCard,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const BRAND = {
  primary: "#0A2647",
};

const mainNavItems = [
  { to: "/dashboard", label: "Overview", icon: <Home className="h-5 w-5" /> },
  { to: "/dashboard/calls", label: "Manage Calls", icon: <Phone className="h-5 w-5" /> },
  { to: "/dashboard/docs", label: "Manage Documents", icon: <Files className="h-5 w-5" /> },
  { to: "/profile", label: "Profile", icon: <User2 className="h-5 w-5" /> },
  { to: "/dashboard/billing", label: "Billing", icon: <CreditCard className="h-5 w-5" /> },
  { to: "/dashboard/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar() {
  const activeLinkClass = "bg-slate-100 text-[#0A2647]";
  const inactiveLinkClass = "text-slate-700";

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-white lg:block" aria-label="Sidebar">
      <div className="flex h-full flex-col">
        <div>
          <div className="flex items-center gap-2 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: BRAND.primary }}>
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Virtual Office UK</span>
          </div>
          <nav className="px-2">
            {mainNavItems.map((it) => (
              <NavLink
                to={it.to}
                key={it.to}
                end={it.to === "/dashboard"}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-medium hover:bg-slate-50 ${
                    isActive ? activeLinkClass : inactiveLinkClass
                  }`
                }
              >
                {it.icon}
                {it.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto px-4 py-4">
          <Card className="rounded-2xl border-0 bg-[#0A2647] text-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Need help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm opacity-90">
              Chat with our UK-based team any time.
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  );
}
