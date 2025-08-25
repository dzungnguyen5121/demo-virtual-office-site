import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useAuth } from "../../contexts/AuthContext";
import { NotificationsPanel } from "./NotificationsPanel";
import profileDemo from "../../assets/profile-demo.svg";

export function Header({ title }: { title: string }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Close user menu if clicked outside
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);
  
  const notifCount = 3;
  const isAdmin = user?.role === 'admin';
  const userName = isAdmin ? "Admin User" : "John Doe";
  const userEmail = user?.username || "";

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </div>

          {/* --- User menu / right side --- */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                ref={notifButtonRef}
                onClick={() => setNotifOpen(v => !v)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {notifCount}
                  </span>
                )}
              </button>
            </div>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full p-1 pr-2 text-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={isAdmin ? undefined : profileDemo} alt="User avatar" />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold">{userName}</div>
                  <div className="text-xs text-slate-500">{userEmail}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
              {userMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border bg-white py-1 shadow-xl">
                {!isAdmin && (
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                )}
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <NotificationsPanel 
        open={notifOpen} 
        onClose={() => setNotifOpen(false)} 
        triggerRef={notifButtonRef}
      />
    </>
  );
}
