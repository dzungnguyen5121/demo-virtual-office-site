import { useMemo, useState } from "react";
import {
  Search,
  Circle,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const t = {
  chat: {
    users: "Users",
    search: "Search users…",
    placeholder: "Type a message…",
    send: "Send",
    online: "Online",
    offline: "Offline",
  },
  menu: {
      users: "Users & Chat"
  }
};

type ChatUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  online?: boolean;
  unread?: number;
};

type ChatMsg = {
  id: string;
  userId: string; // sender id, "admin" for admin
  text: string;
  time: string; // ISO
};

let MOCK_USERS: ChatUser[] = [
  { id: "u1", name: "Alice Johnson", email: "alice@client.com", avatar: "https://i.pravatar.cc/100?img=1", online: true, unread: 2 },
  { id: "u2", name: "Bob Tran", email: "bob@client.com", avatar: "https://i.pravatar.cc/100?img=5", online: false, unread: 0 },
  { id: "u3", name: "Chris Lee", email: "chris@client.com", avatar: "https://i.pravatar.cc/100?img=15", online: true, unread: 1 },
  { id: "u4", name: "Diana Patel", email: "diana@client.com", avatar: "https://i.pravatar.cc/100?img=12", online: false, unread: 0 },
];

const NOW = new Date().toISOString();
const MOCK_MSGS: ChatMsg[] = [
  { id: "m1", userId: "u1", text: "Hi, could you review my documents?", time: NOW },
  { id: "m2", userId: "admin", text: "Sure, I'm checking them now.", time: NOW },
  { id: "m3", userId: "u1", text: "Also I paid via bank transfer.", time: NOW },
  { id: "m4", userId: "admin", text: "Got it, I'll confirm shortly.", time: NOW },
];

export default function AdminChatPage() {
  const [users, setUsers] = useState<ChatUser[]>(MOCK_USERS);
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string>(MOCK_USERS[0].id);
  const [msgs, setMsgs] = useState<Record<string, ChatMsg[]>>({
    u1: MOCK_MSGS,
    u2: [{ id: "m5", userId: "u2", text: "Hello, I need an invoice copy.", time: NOW }],
    u3: [{ id: "m6", userId: "u3", text: "Any update on approval?", time: NOW }],
    u4: [],
  });
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() =>
    users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
  [q, users]);

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    const m: ChatMsg = { id: Math.random().toString(36).slice(2), userId: "admin", text, time: new Date().toISOString() };
    setMsgs((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), m] }));
    setDraft("");
  };

  const handleUserSelect = (userId: string) => {
    setActiveId(userId);
    // Mark as read
    const newUsers = users.map(u => u.id === userId ? { ...u, unread: 0 } : u);
    setUsers(newUsers);
    MOCK_USERS = newUsers; // Persist mock data change
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Users list */}
        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="text-base">{t.chat.users}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.chat.search}
                className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <ul className="max-h-[520px] space-y-2 overflow-auto">
              {filtered.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => handleUserSelect(u.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left ${
                      activeId === u.id ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-slate-900">{u.name}</span>
                        {u.unread ? (
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{u.unread}</span>
                        ) : null}
                      </div>
                      <div className="truncate text-xs text-slate-500">{u.email}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs ${u.online ? "text-green-600" : "text-slate-400"}`}>
                      <Circle className={`h-3 w-3 ${u.online ? "fill-green-600 text-green-600" : "text-slate-400"}`} />
                      {u.online ? t.chat.online : t.chat.offline}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Chat panel */}
        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="text-base">
              {MOCK_USERS.find((x) => x.id === activeId)?.name || "User"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="mb-3 h-[420px] overflow-auto rounded-xl border bg-white p-3">
              {(msgs[activeId] || []).map((m) => (
                <div key={m.id} className={`mb-2 flex ${m.userId === "admin" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                      m.userId === "admin" ? "bg-[#0A2647] text-white" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.chat.placeholder}
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
              />
              <Button onClick={onSend} className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]">
                <Send className="mr-1 h-4 w-4" /> {t.chat.send}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
