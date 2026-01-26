// src/app/(app)/rodape/rodape.tsx
"use client";

import Link from "next/link";
import { SocialIcon } from "react-social-icons";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "public/JPSystem_logo.png";

function shouldHideFooterOnMobile(pathname: string): boolean {
  // ✅ em lançamentos (e outras telas “de trabalho”), footer no mobile atrapalha
  // ajuste a lista se quiser esconder em mais telas
  return pathname.includes("/lancamentos");
}

export default function Rodape() {
  const pathname = usePathname();
  const hideOnMobile = shouldHideFooterOnMobile(pathname);

  return (
    <footer
      className={[
        // some no mobile em páginas específicas
        hideOnMobile ? "hidden sm:flex" : "flex",
        // fixo só em >= sm (no mobile ele some ou poderia ser não-fixo)
        "fixed bottom-0 left-0 w-full h-14 px-4 bg-sky-900 border-t dark:border-gray-700 items-center z-10",
      ].join(" ")}
    >
      <Link className="flex items-center gap-2 text-sm sm:text-lg font-semibold min-w-0" href="#">
        <Image
          priority={false}
          src={Logo}
          alt="JP System Logo"
          width={24}
          height={24}
        />
        <span className="text-sky-50 truncate">
          © 2023 JP System Ltda. All rights reserved.
        </span>
      </Link>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex space-x-4 mr-12">
          <SocialIcon
            style={{ height: 30, width: 30 }}
            url="https://www.linkedin.com/company/jpsystem/"
          />
          <SocialIcon
            url="https://react-social-icons.com"
            style={{ height: 30, width: 30 }}
            network="instagram"
          />
          <SocialIcon
            url="https://react-social-icons.com"
            style={{ height: 30, width: 30 }}
            network="twitter"
          />
          <SocialIcon
            url="https://react-social-icons.com"
            style={{ height: 30, width: 30 }}
            network="youtube"
          />
        </div>
      </div>
    </footer>
  );
}
