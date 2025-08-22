import { useRef, useEffect, RefObject, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { X, Gift, Phone, Files } from "lucide-react";

const initialNotifications = [
  { type: "promo", title: "Summer Offer: 2 months free", time: "2m ago", read: false, icon: <Gift className="h-5 w-5 text-amber-500" /> },
  { type: "mail", title: "Mail received from Companies House", time: "1h ago", read: false, icon: <Files className="h-5 w-5 text-blue-500" /> },
  { type: "call", title: "Missed call from +44 20 7123 4567", time: "yesterday", read: true, icon: <Phone className="h-5 w-5 text-emerald-500" /> },
];


export function NotificationsPanel({ open, onClose, triggerRef }: { open: boolean; onClose: () => void; triggerRef: RefObject<HTMLButtonElement> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAsRead = (index: number) => {
    const newNotifications = [...notifications];
    newNotifications[index].read = true;
    setNotifications(newNotifications);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, triggerRef]);

  if (!open) return null;
  return (
    <div className="fixed right-4 top-16 z-40 w-80" ref={containerRef} role="dialog" aria-label="Notifications">
      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl ring-1 ring-slate-200">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-base font-semibold">Notifications</CardTitle>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-full"><X className="h-4 w-4"/></Button>
        </CardHeader>
        <Separator />
        <ScrollArea className="h-80">
          <CardContent className="p-0">
            {notifications.map((n, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 hover:bg-slate-50 ${!n.read ? 'bg-slate-50' : ''}`}>
                <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${!n.read ? 'bg-white' : 'bg-slate-100'}`}>
                  {n.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.time}</p>
                </div>
                {!n.read && <button onClick={() => handleMarkAsRead(i)} className="mt-1 text-xs text-blue-600 hover:underline">Mark read</button>}
              </div>
            ))}
          </CardContent>
        </ScrollArea>
        <Separator />
        <CardFooter className="p-2">
          <Button variant="ghost" className="w-full text-sm">View all notifications</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
