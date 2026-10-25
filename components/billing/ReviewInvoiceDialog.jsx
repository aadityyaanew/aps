"use client";
/**
 * ReviewInvoiceDialog.jsx — Modal for Admin to approve or reject an invoice with remarks.
 */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, AlertCircle, Loader2, ReceiptText } from "lucide-react";

export default function ReviewInvoiceDialog({ open, onClose, invoice, onReviewed }) {
  const [status, setStatus] = useState(invoice?.status === "Pending" ? "Approved" : invoice?.status || "Approved");
  const [remarks, setRemarks] = useState(invoice?.admin_remarks || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setStatus("Approved");
    setRemarks("");
    setError("");
    onClose();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!invoice) return;

    if (status === "Rejected" && !remarks.trim()) {
      setError("Please provide admin remarks explaining why the invoice was rejected.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/billing/invoices/${invoice.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminRemarks: remarks.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update invoice review.");
      }

      onClose();
      onReviewed?.(json.data);
    } catch (err) {
      setError(err.message || "Failed to update invoice.");
    } finally {
      setLoading(false);
    }
  }

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-[#8B0000]">
              <ReceiptText size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                Review Invoice #{invoice.invoice_number}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Submitted by {invoice.unit_name} {invoice.organization_name ? `(${invoice.organization_name})` : ""}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Quick Invoice Details Banner */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="font-semibold text-slate-800">
                ₹{Number(invoice.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Month & Year:</span>
              <span className="text-slate-700">{invoice.invoice_month} {invoice.invoice_year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Signed By:</span>
              <span className="text-slate-700">{invoice.signed_by}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-status">Decision Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="review-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 size={14} /> Approved
                  </span>
                </SelectItem>
                <SelectItem value="Rejected">
                  <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                    <XCircle size={14} /> Rejected
                  </span>
                </SelectItem>
                <SelectItem value="Pending">
                  <span className="text-amber-700 font-medium">Pending (Reset)</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-remarks">
              Admin Remarks {status === "Rejected" ? "*" : "(Optional)"}
            </Label>
            <Textarea
              id="admin-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                status === "Rejected"
                  ? "Specify reason for rejection (mandatory)..."
                  : "Add approval note or instructions for unit..."
              }
              rows={3}
              className="text-xs"
            />
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
              className={
                status === "Approved"
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                  : status === "Rejected"
                  ? "bg-rose-700 hover:bg-rose-800 text-white"
                  : "bg-slate-800 hover:bg-slate-900 text-white"
              }
            >
              {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
              Confirm {status}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
