"use client";
/**
 * app/center/billing/page.js — Unit Billing Panel.
 * Access control, billing password authentication, invoice upload with Cloudflare R2,
 * and invoice status tracking with admin remarks.
 */
import { useState } from "react";
import useSWR from "swr";
import PageHeader from "@/components/common/PageHeader";
import BillingAuthGate from "@/components/billing/BillingAuthGate";
import InvoicesTable from "@/components/billing/InvoicesTable";
import UploadInvoiceDialog from "@/components/billing/UploadInvoiceDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Lock,
  ShieldAlert,
  ReceiptText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function CenterBillingPage() {
  const [openUpload, setOpenUpload] = useState(false);
  const [banner, setBanner] = useState(null);

  // Fetch unit billing status
  const {
    data: statusData,
    isLoading: statusLoading,
    mutate: mutateStatus,
  } = useSWR("/api/billing/status", fetcher, { revalidateOnFocus: true });

  // Fetch unit invoices
  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    mutate: mutateInvoices,
  } = useSWR("/api/billing/invoices", fetcher, { revalidateOnFocus: true });

  if (statusLoading) {
    return <LoadingSpinner />;
  }

  const billingStatus = statusData?.data || {};
  const invoices = invoicesData?.data || [];

  // If unit does not have billing access granted by Admin
  if (!billingStatus.hasAccess) {
    return (
      <div className="max-w-2xl mx-auto my-16">
        <Card className="border-red-200 bg-red-50/30 shadow-xs">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-[#8B0000]">
              <ShieldAlert size={28} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">Billing Access Restricted</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Billing access has not been activated for your unit. Please contact the Head Office /
                Administrator to authorize invoice submissions and billing management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <BillingAuthGate
      unitId={billingStatus.unitId}
      hasPassword={billingStatus.hasPassword}
      onUnlocked={() => {
        mutateInvoices();
      }}
    >
      {({ onLock }) => (
        <div className="space-y-6">
          <PageHeader
            title="Billing & Invoices"
            description="Upload and track monthly invoices. Verified invoices are approved by administration."
            action={
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLock}
                  className="gap-1.5 text-xs border-slate-300 text-slate-600 hover:text-red-700 hover:bg-red-50"
                  title="Lock billing session"
                >
                  <Lock size={14} />
                  Lock Session
                </Button>

                <Button
                  onClick={() => setOpenUpload(true)}
                  className="gap-2 bg-[#800000] hover:bg-[#6c0000] text-white shadow-sm"
                >
                  <Upload size={16} />
                  Upload Invoice
                </Button>
              </div>
            }
          />

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
                className="text-slate-400 hover:text-slate-700 cursor-pointer ml-3"
              >
                ✕
              </button>
            </div>
          )}

          {/* Invoices Listing Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Submitted Invoices</h2>
              <span className="text-xs text-slate-500 font-medium">
                {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"} recorded
              </span>
            </div>

            <InvoicesTable
              invoices={invoices}
              isLoading={invoicesLoading}
              isAdmin={false}
              onInvoiceUpdated={() => mutateInvoices()}
            />
          </div>

          <UploadInvoiceDialog
            open={openUpload}
            onClose={() => setOpenUpload(false)}
            onSuccess={(newInv) => {
              mutateInvoices();
              setBanner({
                type: "success",
                text: `Invoice #${newInv.invoice_number} submitted successfully and assigned 'Pending' status.`,
              });
              setTimeout(() => setBanner(null), 7000);
            }}
          />
        </div>
      )}
    </BillingAuthGate>
  );
}
