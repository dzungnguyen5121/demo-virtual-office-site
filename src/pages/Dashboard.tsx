import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import {
  MessageCircle,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Sidebar } from "../components/common/Sidebar";
import { Header } from "../components/common/Header";
import { Footer } from "../components/common/Footer";


// --- Chat with admin (floating widget) ---
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [messages, setMessages] = useState([
    { from: "admin", text: "Hi! How can we help today?" },
  ]);
  const [draft, setDraft] = useState("");
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      areaRef.current?.scrollTo({ top: areaRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open]);

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "me", text: draft.trim() }]);
    setDraft("");
    // TODO: integrate websocket / chat API
    setTimeout(() => setMessages((m) => [...m, { from: "admin", text: "Thanks! We'll get back shortly." }]), 600);
  };

  const handleToggleChat = () => {
    setOpen(prev => {
      if (!prev) { // If it's about to open
        setUnreadCount(0);
      }
      return !prev;
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 w-[320px] overflow-hidden rounded-2xl border bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b bg-[#0A2647] px-3 py-2 text-white">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Chat with admin</span>
                </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-md p-1 hover:bg-white/10">
                <X className="h-4 w-4" />
                  </button>
                </div>
            <div ref={areaRef} className="h-64 space-y-2 overflow-y-auto bg-slate-50 p-3">
              {messages.map((m, i) => (
                <div key={i} className={`w-fit max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === "me" ? "ml-auto bg-[#F5B700] text-[#0A2647]" : "bg-white text-slate-800 shadow"}`}>
                  {m.text}
          </div>
            ))}
          </div>
            <div className="flex items-center gap-2 p-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), send())}
                placeholder="Type a message…"
                className="rounded-xl"
                aria-label="Message input"
              />
              <Button onClick={send} className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">Send</Button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={handleToggleChat}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F5B700] text-[#0A2647] shadow-xl hover:bg-[#e5aa00]"
        aria-label={open ? "Minimize chat" : "Open chat"}
      >
        <MessageCircle className="h-6 w-6" />
        {!open && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Overview",
  "/dashboard/calls": "Manage Calls",
  "/dashboard/docs": "Manage Documents",
  "/dashboard/settings": "Settings",
  "/profile": "Profile",
};


export default function Dashboard({ children }: { children?: React.ReactNode }) {
  const location = useLocation();

  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header title={title} />

          {/* Main content */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children || <Outlet />}
          </main>
          
          <Footer />
        </div>

      <ChatWidget />
    </div>
  );
}
