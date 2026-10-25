"use client";
/**
 * BillingNotificationsDialog.jsx — Modal to display billing notifications, announcements,
 * instructions, reminders, and unread counts for units.
 */
import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCheck,
  Megaphone,
  BookOpen,
  CalendarClock,
  AlertCircle,
  Loader2,
} from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function BillingNotificationsDialog({ open, onClose, onReadUpdated }) {
  const { data, error, isLoading, mutate } = useSWR(
    open ? "/api/billing/notifications" : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const [markingAll, setMarkingAll] = useState(false);

  const notifications = data?.data || [];
  const hasUnread = notifications.some((n) => !n.is_read);

  async function handleMarkAllAsRead() {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/billing/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        await mutate();
        onReadUpdated?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkSingleRead(notificationId) {
    try {
      const res = await fetch("/api/billing/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        await mutate();
        onReadUpdated?.();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "instruction":
        return <BookOpen size={16} className="text-blue-600" />;
      case "reminder":
        return <CalendarClock size={16} className="text-amber-600" />;
      case "alert":
        return <AlertCircle size={16} className="text-rose-600" />;
      case "announcement":
      default:
        return <Megaphone size={16} className="text-purple-600" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "instruction":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Instruction</Badge>;
      case "reminder":
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Reminder</Badge>;
      case "alert":
        return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200">Alert</Badge>;
      case "announcement":
      default:
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Announcement</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100/80 text-red-700">
                <Bell size={18} />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-slate-900">
                  Billing Notifications
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Announcements, instructions, and reminders from the Administration
                </DialogDescription>
              </div>
            </div>

            {hasUnread && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="text-xs h-8 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                {markingAll ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={14} />}
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-slate-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 size={24} className="animate-spin text-red-600" />
              <span className="text-xs">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <div className="p-3 bg-slate-100 rounded-full mb-2 text-slate-400">
                <Bell size={24} />
              </div>
              <p className="text-sm font-medium text-slate-700">No Billing Notifications</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                You will receive announcements, instructions, and reminders from the administration here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = notif.is_read === 0 || notif.is_read === false;
              return (
                <div
                  key={notif.notification_id}
                  onClick={() => isUnread && handleMarkSingleRead(notif.notification_id)}
                  className={`pt-3 first:pt-0 transition-all rounded-lg p-3 ${
                    isUnread
                      ? "bg-red-50/40 border border-red-100/80 cursor-pointer hover:bg-red-50/70"
                      : "bg-white hover:bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                        {getTypeIcon(notif.type)}
                      </div>
                      <span className="font-semibold text-sm text-slate-900">
                        {notif.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getTypeBadge(notif.type)}
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-red-600" title="Unread" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed pl-9">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-3 pl-9 text-[11px] text-slate-400">
                    <span>
                      {new Date(notif.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isUnread && (
                      <span className="text-[11px] font-medium text-red-600">
                        Click to mark read
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
