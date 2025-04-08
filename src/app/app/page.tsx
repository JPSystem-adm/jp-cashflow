// src/app/app/page.tsx

import { getServerSession } from "next-auth"
import { auth as authOptions } from "@/lib/auth-config"
import { redirect } from "next/navigation"
import { headers } from "next/headers"


export default async function Page() {
  // 🟡 Se estiver logado, redireciona para o dashboard
  const session = await getServerSession(authOptions)
  if (session) {
    redirect("/app/dashboard")
  } 
  // 👉 Se não estiver logado redireciona para o login passando o subdomínio 
  else {
    const headersList = headers()
    // Capturar o subdomínio para preencher no login
    const host = headersList.get("host") || "localhost:3000"
    
    const isLocalhost = host.includes("localhost")
    const parts = host.split(".")
    const subdomain = isLocalhost ? parts[0] : parts.length > 2 ? parts[0] : ""

    redirect(`/app/login?user=${subdomain}`)
  }

  return null
}
