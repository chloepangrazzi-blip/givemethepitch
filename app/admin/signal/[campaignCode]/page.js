export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import AdminPageClient from "../../../../components/admin/AdminPageClient";
import SignalV3DashboardPage from "../../../../components/admin/SignalV3DashboardPage";
import { ADMIN_COOKIE_NAME, isAdminConfigured, isValidAdminSession } from "../../../../lib/admin-auth";
import { getSignalV3DashboardData } from "../../../../lib/signal-v3-dashboard-repository";

export const metadata = {
  title: "SIGNAL V3 · Dashboard GMTP",
};

export default async function AdminSignalCampaignPage({ params, searchParams }) {
  const { campaignCode } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value || "";
  const authenticated = isValidAdminSession(token);

  if (!authenticated) {
    return (
      <AdminPageClient
        authenticated={false}
        configured={isAdminConfigured()}
        initialData={null}
      />
    );
  }

  const wantsDemo = query?.demo === "30";

  if (wantsDemo && process.env.NODE_ENV === "production") {
    return (
      <SignalV3DashboardPage
        data={{
          state: "demo_blocked",
          campaignCode,
          campaign: null,
          error: null,
        }}
      />
    );
  }

  if (wantsDemo) {
    const { getSignalV3DemoDashboardData } = await import(
      "../../../../lib/fixtures/signal-v3-demo"
    );

    return <SignalV3DashboardPage data={getSignalV3DemoDashboardData(campaignCode)} />;
  }

  const data = await getSignalV3DashboardData(campaignCode);

  return <SignalV3DashboardPage data={data} />;
}
