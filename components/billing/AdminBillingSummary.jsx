"use client";
/**
 * AdminBillingSummary.jsx — Summary metric cards for Admin Billing Dashboard.
 * Total Invoices, Pending Invoices, Approved Invoices, Rejected Invoices, and Total Approved Amount.
 * Fully mobile responsive.
 */
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
} from "lucide-react";

export default function AdminBillingSummary({ summary = {}, isLoading = false }) {
  const cards = [
    {
      label: "Total Invoices",
      value: summary.total_invoices ?? 0,
      description: "All unit submissions",
      icon: FileText,
      iconBg: "bg-slate-100 text-slate-700",
      borderAccent: "border-slate-200",
    },
    {
      label: "Pending Invoices",
      value: summary.pending_invoices ?? 0,
      description: "Awaiting review",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
      borderAccent: "border-amber-200",
      valueColor: "text-amber-700",
    },
    {
      label: "Approved Invoices",
      value: summary.approved_invoices ?? 0,
      description: "Verified & approved",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      borderAccent: "border-emerald-200",
      valueColor: "text-emerald-700",
    },
    {
      label: "Rejected Invoices",
      value: summary.rejected_invoices ?? 0,
      description: "Requires revision",
      icon: XCircle,
      iconBg: "bg-rose-50 text-rose-600",
      borderAccent: "border-rose-200",
      valueColor: "text-rose-700",
    },
    {
      label: "Total Approved Amount",
      value: `₹${Number(summary.total_approved_amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      description: "Total cleared payout",
      icon: IndianRupee,
      iconBg: "bg-red-50 text-red-700",
      borderAccent: "border-red-200",
      valueColor: "text-red-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`border ${card.borderAccent || "border-slate-200"} bg-white shadow-xs hover:shadow-sm transition-all`}
          >
            <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">{card.label}</p>
                <p className={`text-lg sm:text-xl font-bold tracking-tight truncate ${card.valueColor || "text-slate-900"}`}>
                  {isLoading ? "—" : card.value}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{card.description}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg} shrink-0`}>
                <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
