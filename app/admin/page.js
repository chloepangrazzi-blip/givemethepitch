export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import AdminPageClient from "../../components/admin/AdminPageClient";
import { ADMIN_COOKIE_NAME, isAdminConfigured, isValidAdminSession } from "../../lib/admin-auth";
import { getAdminDashboardData } from "../../lib/admin-repository";

export const metadata = {
  title: "Admin GMTP",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value || "";
  const authenticated = isValidAdminSession(token);
  const initialData = authenticated ? await getAdminDashboardData() : null;

  return (
    <AdminPageClient
      authenticated={authenticated}
      configured={isAdminConfigured()}
      initialData={initialData}
    />
  );
}
