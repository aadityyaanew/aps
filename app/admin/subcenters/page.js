"use client";
/**
 * app/admin/subcenters/page.js — Admin: View all subcenters
 */
import PageHeader from "@/components/common/PageHeader";
import SubcentersTable from "@/components/subcenters/SubcentersTable";
import { useSubcenters } from "@/hooks/useSubcenters";

export default function AdminSubcentersPage() {
  const { subcenters, isLoading } = useSubcenters("admin");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sub Centers"
        description={`${subcenters.length} sub center${subcenters.length !== 1 ? "s" : ""} across all centers`}
      />
      <SubcentersTable subcenters={subcenters} isLoading={isLoading} showCenter />
    </div>
  );
}
