"use client";

import ExecutiveReportsPage from "@/components/commoncomponents/reports/executive-reports-page";
import GlobalLoader from "@/components/commoncomponents/globalloader";
import ManagerReportsPage from "@/components/commoncomponents/reports/manager-reports-page";
import { getUser } from "@/lib/auth";

export default function OrganizationReportsPage() {
  const user = getUser();

  if (!user) {
    return <GlobalLoader />;
  }

  return user.role === "Executive" ? (
    <ExecutiveReportsPage />
  ) : (
    <ManagerReportsPage />
  );
}
