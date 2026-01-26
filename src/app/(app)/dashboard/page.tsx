// src/app/(app)/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./_components/DashboardClient";
import PageContainer from "@/app/(app)/_components/PageContainer";
import { decodeToken } from "@/lib/decodeToken";

function normalizeTenant(input: string): string | null {
  const t = (input ?? "").trim().toLowerCase();
  if (!t) return null;
  if (!/^[a-z0-9-]+$/i.test(t)) return null;
  return t;
}

export default async function Page() {
  const cookieStore = cookies();

  const tenant = normalizeTenant(cookieStore.get("tenant")?.value ?? "");
  const token = cookieStore.get("token")?.value;

  // ✅ se não tiver tenant, esse dashboard não deveria existir no caminho A
  // manda para público
  if (!tenant) {
    redirect("/");
  }

  const loginUrl = `/${tenant}/login?user=${encodeURIComponent(tenant)}`;

  if (!token) {
    redirect(loginUrl);
  }

  const user = decodeToken(token);

  if (!user) {
    redirect(`${loginUrl}&reason=sem-sessao`);
  }

  // ✅ se token é de outro login, força login do tenant
  if ((user.login ?? "").toUpperCase() !== tenant.toUpperCase()) {
    redirect(`${loginUrl}&reason=tenant-diferente`);
  }

  return (
    <PageContainer>
      <DashboardClient />
    </PageContainer>
  );
}
