"use client";
/**
 * app/admin/billing/page.js — Admin Billing Dashboard & Management.
 * Features:
 * - Summary cards (Total, Pending, Approved, Rejected, Total Approved Amount)
 * - Invoice listing across all units with unit/month/year/status filters
 * - Approval & Rejection workflow with remarks
 * - Unit Billing Access control (grant/revoke) and password reset
 * - Broadcast notifications (announcements, instructions, reminders)
 * - 100% mobile responsive tabs, tables, and actions
 */
import { useState } from "react";
import useSWR from "swr";
import PageHeader from "@/components/common/PageHeader";
import AdminBillingSummary from "@/components/billing/AdminBillingSummary";
import InvoicesTable from "@/components/billing/InvoicesTable";
import UploadInvoiceDialog from "@/components/billing/UploadInvoiceDialog";
import SendNotificationDialog from "@/components/billing/SendNotificationDialog";
import UnitBillingAccessTable from "@/components/billing/UnitBillingAccessTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ReceiptText,
  Upload,
  Megaphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState("invoices"); // 'invoices' | 'units' | 'notifications'
  const [openUpload, setOpenUpload] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
  const [banner, setBanner] = useState(null);

  // 1. Invoices
  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    mutate: mutateInvoices,
  } = useSWR("/api/billing/invoices", fetcher, { revalidateOnFocus: true });

  // 2. Summary
  const {
    data: summaryData,
    isLoading: summaryLoading,
    mutate: mutateSummary,
  } = useSWR("/api/billing/invoices/summary", fetcher, { revalidateOnFocus: true });

  // 3. Units with billing access
  const {
    data: unitsData,
    isLoading: unitsLoading,
    mutate: mutateUnits,
  } = useSWR("/api/billing/units", fetcher, { revalidateOnFocus: true });

  // 4. Sent Notifications
  const {
    data: notifsData,
    isLoading: notifsLoading,
    mutate: mutateNotifs,
  } = useSWR(activeTab === "notifications" ? "/api/billing/notifications" : null, fetcher, {
    revalidateOnFocus: true,
  });

  const invoices = invoicesData?.data || [];
  const summary = summaryData?.data || {};
  const units = unitsData?.data || [];
  const notifications = notifsData?.data || [];

  const handleRefreshAll = () => {
    mutateInvoices();
    mutateSummary();
    mutateUnits();
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Billing Management"
        description="Monitor unit invoices, review submissions, control billing access, and broadcast announcements."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenNotify(true)}
              className="gap-1.5 text-xs border-slate-300 text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 h-9"
            >
              <Megaphone size={15} />
              <span>Send Notification</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setOpenUpload(true)}
              className="gap-2 bg-[#800000] hover:bg-[#6c0000] text-white shadow-sm h-9"
            >
              <Upload size={16} />
              <span>Upload Invoice</span>
            </Button>
          </div>
        }
      />

      {/* Admin Summary Cards */}
      <AdminBillingSummary summary={summary} isLoading={summaryLoading} />

      {banner && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-medium ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{banner.text}</span>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer ml-3 p-1"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Bar with mobile horizontal scroll */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none flex-nowrap">
        <Button
          variant={activeTab === "invoices" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("invoices")}
          className={`gap-1.5 text-xs font-semibold shrink-0 h-8 sm:h-9 ${
            activeTab === "invoices"
              ? "bg-[#800000] hover:bg-[#6c0000] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ReceiptText size={15} />
          <span>All Invoices ({invoices.length})</span>
        </Button>

        <Button
          variant={activeTab === "units" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("units")}
          className={`gap-1.5 text-xs font-semibold shrink-0 h-8 sm:h-9 ${
            activeTab === "units"
              ? "bg-[#800000] hover:bg-[#6c0000] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck size={15} />
          <span>Unit Access ({units.filter((u) => u.billing_access).length}/{units.length})</span>
        </Button>

        <Button
          variant={activeTab === "notifications" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("notifications")}
          className={`gap-1.5 text-xs font-semibold shrink-0 h-8 sm:h-9 ${
            activeTab === "notifications"
              ? "bg-[#800000] hover:bg-[#6c0000] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Megaphone size={15} />
          <span>Broadcast History</span>
        </Button>
      </div>

      {/* Tab 1: Invoices Table */}
      {activeTab === "invoices" && (
        <InvoicesTable
          invoices={invoices}
          isLoading={invoicesLoading}
          isAdmin={true}
          units={units}
          onInvoiceUpdated={handleRefreshAll}
        />
      )}

      {/* Tab 2: Unit Access & Security */}
      {activeTab === "units" && (
        <UnitBillingAccessTable
          units={units}
          isLoading={unitsLoading}
          onUpdated={handleRefreshAll}
        />
      )}

      {/* Tab 3: Notification Broadcasts History */}
      {activeTab === "notifications" && (
        <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Billing Broadcasts</h3>
              <p className="text-xs text-slate-500">
                Announcements and reminders sent to authorized units
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setOpenNotify(true)}
              className="bg-[#800000] hover:bg-[#6c0000] text-white text-xs gap-1.5 self-start sm:self-auto"
            >
              <Megaphone size={14} />
              New Broadcast
            </Button>
          </div>

          {notifsLoading ? (
            <LoadingSpinner />
          ) : notifications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-400">
              <Megaphone size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No Broadcasts Sent Yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Send your first announcement, instruction, or deadline reminder to units.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div key={n.id} className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize font-semibold">
                        {n.type}
                      </Badge>
                      <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    </div>
                    <span className="text-[11px] sm:text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap">{n.message}</p>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-[11px] text-slate-400">
                    <span>Target: {n.target_all_units ? "All Authorized Units" : "Specific Units"}</span>
                    <span>•</span>
                    <span>Sent to: {n.total_recipients || 0} units</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Read by: {n.read_count || 0} units</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Upload Invoice Dialog (for Admin) */}
      <UploadInvoiceDialog
        open={openUpload}
        units={units.filter((u) => u.billing_access)}
        onClose={() => setOpenUpload(false)}
        onSuccess={(newInv) => {
          handleRefreshAll();
          setBanner({
            type: "success",
            text: `Invoice #${newInv.invoice_number} submitted successfully!`,
          });
          setTimeout(() => setBanner(null), 6000);
        }}
      />

      {/* Send Notification Dialog */}
      <SendNotificationDialog
        open={openNotify}
        units={units}
        onClose={() => setOpenNotify(false)}
        onSent={() => {
          mutateNotifs();
          setBanner({
            type: "success",
            text: "Billing notification broadcasted successfully to authorized units!",
          });
          setTimeout(() => setBanner(null), 6000);
        }}
      />
    </div>
  );
}
