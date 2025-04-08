// src/app/app/_components/ForceLogout.tsx
"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"

export default function ForceLogout({ user }: { user: string }) {
  useEffect(() => {
    signOut({ callbackUrl: `/app/login?user=${user}` })
  }, [user])

  return null
}
