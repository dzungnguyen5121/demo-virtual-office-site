import { Sidebar } from "@/components/common/Sidebar";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Outlet, useLocation } from "react-router-dom";

// This list mirrors the one in Sidebar.tsx for robust title generation.
const adminNavItems = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/users", label: "Users & Chat" },
    { to: "/admin/approvals", label: "Client Approvals" },
    { to: "/admin/notifications", label: "System Notifications" },
    { to: "/admin/commissions", label: "Commissions" },
    { to: "/admin/promotions", label: "Promotions" },
    { to: "/admin/reconciliation", label: "Manual Reconciliation" },
    { to: "/admin/reminder", label: "Due Reminders" },
    { to: "/admin/settings", label: "Settings" },
    { to: "/admin/roles", label: "Roles & Offices" },
];

export default function AdminDashboardPage() {
  const location = useLocation();

  const getTitle = (pathname: string) => {
    // Find the best match from the navigation items by sorting by path length.
    const matchingNavItem = adminNavItems
        .slice()
        .sort((a, b) => b.to.length - a.to.length)
        .find(item => pathname.startsWith(item.to));

    if (matchingNavItem) {
        return matchingNavItem.label;
    }

    // Fallback for pages not in the sidebar.
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, " ");
    }
    
    return "Admin Dashboard"; // Default title
  };

  const title = getTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-[#F5F6FA] font-sans">
      <Sidebar role="admin" />
      <div className="flex flex-1 flex-col">
        <Header title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
