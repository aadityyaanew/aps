"use client";
/**
 * UploadInvoiceDialog.jsx — Form dialog for submitting invoices with Cloudflare R2 upload.
 * Mandatory fields: Invoice Number, Date, Month & Year, Amount (₹), Signed By, Document Upload.
 */
import { useState, useRef, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Calendar,
  Clock,
  Lock,
  ShieldCheck,
} from "lucide-react";

export default function UploadInvoiceDialog({ open, onClose, onSuccess, unitId = null, units = [] }) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [signedBy, setSignedBy] = useState("");
  const [file, setFile] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(unitId ? String(unitId) : "");

  // Auto-fetch real-time date, time, month, and year (cannot be manipulated)
  const [currentDateTime, setCurrentDateTime] = useState(() => {
    const now = new Date();
    return {
      dateFormatted: now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      timeFormatted: now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      month: now.toLocaleString("en-US", { month: "long" }),
      year: String(now.getFullYear()),
      rawDate: now.toISOString().split("T")[0],
    };
  });

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const now = new Date();
      setCurrentDateTime({
        dateFormatted: now.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        timeFormatted: now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        month: now.toLocaleString("en-US", { month: "long" }),
        year: String(now.getFullYear()),
        rawDate: now.toISOString().split("T")[0],
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setInvoiceNumber("");
    setAmount("");
    setSignedBy("");
    setFile(null);
    setError("");
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 20 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 20MB.");
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.size > 20 * 1024 * 1024) {
        setError("File exceeds maximum allowed size of 20MB.");
        return;
      }
      setError("");
      setFile(dropped);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!invoiceNumber.trim()) {
      setError("Invoice Number is mandatory.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please provide a valid Invoice Amount (₹).");
      return;
    }
    if (!signedBy.trim()) {
      setError("Invoice Signed By is mandatory.");
      return;
    }
    if (!file) {
      setError("Invoice Document upload is mandatory (PDF, PNG, JPG).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("invoice_number", invoiceNumber.trim());
      formData.append("invoice_date", currentDateTime.rawDate);
      formData.append("invoice_month", currentDateTime.month);
      formData.append("invoice_year", currentDateTime.year);
      formData.append("amount", amount);
      formData.append("signed_by", signedBy.trim());
      formData.append("file", file);

      if (selectedUnitId) {
        formData.append("unit_id", selectedUnitId);
      }

      const res = await fetch("/api/billing/invoices", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to upload invoice.");
      }

      resetForm();
      onClose();
      onSuccess?.(json.data);
    } catch (err) {
      setError(err.message || "An error occurred while uploading the invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-[#8B0000]">
              <Upload size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Upload Invoice
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Submit an invoice for administration review. All fields are mandatory.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {units?.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="unit-select">Select Unit *</Label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId} required>
                <SelectTrigger id="unit-select">
                  <SelectValue placeholder="Choose a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name} {u.organization_name ? `(${u.organization_name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Invoice Number */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-num">Invoice Number *</Label>
            <Input
              id="inv-num"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-2026-001"
              required
            />
          </div>

          {/* Auto-Fetched Date, Time & Year (Protected from manipulation) */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />

              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
              {/* Date */}
              <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
                <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <Calendar size={11} className="text-slate-400" />
                  Date
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {currentDateTime.dateFormatted || "Fetching..."}
                </div>
              </div>

              {/* Time */}
              <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
                <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <Clock size={11} className="text-slate-400" />
                  Time
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1 font-mono">
                  {currentDateTime.timeFormatted || "Fetching..."}
                </div>
              </div>

              {/* Billing Period (Month & Year) */}
              <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
                <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-slate-400" />
                  Billing Period
                </div>
                <div className="text-xs font-semibold text-[#8B0000] mt-1">
                  {currentDateTime.month} {currentDateTime.year}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
              <Lock size={11} className="text-slate-400 shrink-0" />
              Date, time, month, and year are locked to the system clock to prevent manipulation.
            </p>
          </div>

          {/* Row 3: Amount & Signed By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="inv-amt">Invoice Amount (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  ₹
                </span>
                <Input
                  id="inv-amt"
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-signed">Invoice Signed By *</Label>
              <Input
                id="inv-signed"
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                placeholder="Name of Signatory / Authority"
                required
              />
            </div>
          </div>

          {/* Row 4: Document Upload */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-doc">Invoice Document Upload *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="inv-file-hidden"
            />

            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-red-400 bg-slate-50/60 hover:bg-red-50/20 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100/60 text-[#8B0000] mb-2">
                  <Upload size={18} />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Click to upload or drag & drop invoice document
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  PDF, PNG, JPG, or DOC (Max: 20MB) • Stored securely on Cloudflare R2
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-red-50/50 border border-red-200/80 rounded-xl">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 rounded-lg bg-white text-red-700 shadow-2xs">
                    <FileText size={18} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for Cloudflare R2
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  className="h-8 w-8 text-slate-400 hover:text-red-700 hover:bg-white"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={15} className="shrink-0" />
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
              {loading && <Loader2 size={15} className="mr-2 animate-spin" />}
              {loading ? "Uploading to Cloudflare R2..." : "Submit Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
