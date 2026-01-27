// src/app/(app)/_components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Boxes, Menu } from "lucide-react";
import { useMemo } from "react";
import { normalizeTenant, readCookie, withTenant } from "@/lib/tenantClient";

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname.endsWith("/dashboard");
  if (href === "/lancamentos") return pathname.includes("/lancamentos");
  if (href === "/cadastros") return pathname.includes("/cadastros");
  return false;
}

export default function BottomNav() {
  const pathname = usePathname();

  const tenant = useMemo(() => normalizeTenant(readCookie("tenant")), []);

  const items: Item[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/lancamentos", label: "Lançamentos", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/cadastros", label: "Cadastros", icon: <Boxes className="h-5 w-5" /> },
    { href: "/about", label: "Mais", icon: <Menu className="h-5 w-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-6xl">
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          const href = withTenant(tenant, it.href);

          return (
            <Link
              key={it.href}
              href={href}
              className={[
                "flex-1 py-2",
                "flex flex-col items-center justify-center gap-1",
                active ? "text-sky-900" : "text-slate-600",
              ].join(" ")}
            >
              {it.icon}
              <span className="text-[11px] font-semibold">{it.label}</span>
            </Link>
          );
        })}
      </div>

      {/* safe-area iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
