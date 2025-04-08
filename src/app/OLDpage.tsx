// src/app/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootRedirect() {
  const router = useRouter()

  // ✅ Verifica se tem subdomínio ou nao
  useEffect(() => {
    const host = window.location.host
    const isLocalhost = host.includes("localhost")
    const parts = host.split(".")
    const subdomain =
      isLocalhost ? (parts.length === 2 ? parts[0] : null) : parts.length > 2 ? parts[0] : null

    // 👉 Se nao tem subdomínio ou subdomínio é 'www', manda pra home  
    if (!subdomain || subdomain === "www") {
      router.replace("/home")
    } 
    // 👉 Se tem subdomínio valido, manda para o app
    else {
      router.replace("/")
    }
  }, [router])

  return null
}

