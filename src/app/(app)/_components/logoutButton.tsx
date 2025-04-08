"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function LogoutButton(props: any) {
  return (
    <Button {...props} onClick={() => signOut({ callbackUrl: "/" })}>
      {props.text}
    </Button>
  )
}
