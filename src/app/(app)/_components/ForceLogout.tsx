// src/app/(app)/_components/ForceLogout.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useGlobalContext } from "../contextGlobal";

type Props = { user: string };

export default function ForceLogout({ user }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { logout } = useGlobalContext();

  useEffect(() => {
    const currentUser = (searchParams.get("user") ?? "").toUpperCase();
    const targetUser = user.toUpperCase();

    const alreadyOnLoginWithSameUser =
      pathname === "/login" && currentUser === targetUser;

    if (alreadyOnLoginWithSameUser) {
      // só garante que está deslogado sem ficar “re-redirecionando”
      logout(`/login?user=${encodeURIComponent(user)}`);
      return;
    }

    logout(`/login?user=${encodeURIComponent(user)}`);
  }, [user, pathname, searchParams, logout]);

  return null;
}
