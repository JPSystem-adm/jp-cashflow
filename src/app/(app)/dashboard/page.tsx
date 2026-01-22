// src/app/(app)/dashboard/page.tsx
import { cookies } from "next/headers";
import { decodeToken } from "@/lib/decodeToken";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { redirect } from "next/navigation";
import DashboardClient from "./_components/DashboardClient";
import PageContainer from "@/app/(app)/_components/PageContainer";

function readTenantCookie(): string | null {
  const t = cookies().get("tenant")?.value;
  if (!t) return null;
  if (!/^[a-z0-9-]+$/i.test(t)) return null;
  return t.toLowerCase();
}

export default async function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const tenant = readTenantCookie();

  // fallback: se não tiver tenant, manda pro público
  const loginUrl = tenant ? `${getBaseUrl()}/${tenant}/login?user=${tenant}` : `${getBaseUrl()}/login`;

  if (!token) {
    redirect(loginUrl);
  }

  const user = decodeToken(token);

  if (!user) {
    redirect(loginUrl);
  }

  // se token é de outro login, força login do tenant
  if (tenant && user.login?.toUpperCase() !== tenant.toUpperCase()) {
    redirect(`${getBaseUrl()}/${tenant}/login?user=${tenant}&reason=tenant-diferente`);
  }

  return (
    <PageContainer>
      <DashboardClient />
    </PageContainer>
  );
}
