"use client";
/**
 * SendNotificationDialog.jsx — Admin dialog to dispatch announcements, instructions,
 * and reminders to all or selected units with billing access.
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  BookOpen,
  CalendarClock,
  AlertCircle,
  Loader2,
  Check,
  Send,
} from "lucide-react";

export default function SendNotificationDialog({ open, onClose, units = [], onSent }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [targetType, setTargetType] = useState("all"); // 'all' or 'selected'
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only authorized units can receive billing notifications
  const authorizedUnits = units.filter((u) => u.billing_access);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setType("announcement");
    setTargetType("all");
    setSelectedUnits([]);
    setError("");
  };

  const toggleUnit = (unitId) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Notification title is required.");
      return;
    }
    if (!message.trim()) {
      setError("Notification message is required.");
      return;
    }
    if (targetType === "selected" && selectedUnits.length === 0) {
      setError("Please select at least one unit to receive this notification.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/billing/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          targetAllUnits: targetType === "all",
          unitIds: targetType === "selected" ? selectedUnits : [],
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to send notification.");
      }

      resetForm();
      onClose();
      onSent?.();
    } catch (err) {
      setError(err.message || "Failed to send notification.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Megaphone size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                Send Billing Notification
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Broadcast announcements, instructions, or reminders to authorized units
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Notification Type */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-type">Notification Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="notif-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">
                  <span className="flex items-center gap-2 text-purple-700">
                    <Megaphone size={14} /> Announcement
                  </span>
                </SelectItem>
                <SelectItem value="instruction">
                  <span className="flex items-center gap-2 text-blue-700">
                    <BookOpen size={14} /> Instruction
                  </span>
                </SelectItem>
                <SelectItem value="reminder">
                  <span className="flex items-center gap-2 text-amber-700">
                    <CalendarClock size={14} /> Reminder
                  </span>
                </SelectItem>
                <SelectItem value="alert">
                  <span className="flex items-center gap-2 text-rose-700">
                    <AlertCircle size={14} /> Alert
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-title">Title *</Label>
            <Input
              id="notif-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. October 2026 Invoices Submission Window Open"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-msg">Message / Instructions *</Label>
            <Textarea
              id="notif-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter detailed instructions, deadlines, or announcements..."
              rows={4}
              required
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label>Target Units</Label>
            <div className="flex gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={targetType === "all"}
                  onChange={() => setTargetType("all")}
                  className="accent-red-700"
                />
                All Authorized Units ({authorizedUnits.length})
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="targetType"
                  value="selected"
                  checked={targetType === "selected"}
                  onChange={() => setTargetType("selected")}
                  className="accent-red-700"
                />
                Select Specific Units
              </label>
            </div>

            {targetType === "selected" && (
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1.5 bg-slate-50/50 mt-2">
                {authorizedUnits.length === 0 ? (
                  <p className="text-xs text-slate-400 p-2 text-center">
                    No units currently have billing access enabled.
                  </p>
                ) : (
                  authorizedUnits.map((u) => {
                    const isChecked = selectedUnits.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleUnit(u.id)}
                        className={`flex items-center justify-between p-2 rounded-md text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-red-50 text-red-900 border border-red-200"
                            : "hover:bg-white text-slate-700 border border-transparent"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.organization_name || u.email}</p>
                        </div>
                        <div
                          className={`h-4 w-4 rounded flex items-center justify-center border ${
                            isChecked
                              ? "bg-red-700 border-red-700 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#800000] hover:bg-[#6c0000] text-white shadow-sm"
            >
              {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
              <Send size={14} className="mr-1.5" />
              Broadcast Notification
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
