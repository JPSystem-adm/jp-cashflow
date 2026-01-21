// src/app/(app)/dashboard/page.tsx
import { cookies } from "next/headers";
import { decodeToken } from "@/lib/decodeToken";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { redirect } from "next/navigation";
import DashboardClient from "./_components/DashboardClient";
import PageContainer from "@/app/(app)/_components/PageContainer";

export default async function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.log("🔴 Dashboard | Sem token. Redirecionando...");
    redirect(`${getBaseUrl()}/login`);
  }

  const user = decodeToken(token);

  if (!user) {
    console.log("🔴 Dashboard | Token inválido. Redirecionando...");
    redirect(`${getBaseUrl()}/login`);
  }

  console.log("🟢 Dashboard | Usuário autenticado:", user.login);

  return (
    <PageContainer>
      <DashboardClient />
    </PageContainer>
  );
}
