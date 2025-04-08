import Link from "next/link";
import { SocialIcon } from "react-social-icons";
import Image from "next/image";
import ActivityIcon from "../_components/ActivityIcon";
import { getServerSession } from "next-auth";
import { auth as authOptions } from "@/lib/auth-config";
import LogoutButton from "../_components/logoutButton";
import Logo from "public/JPSystem_logo.png";

export default async function Rodape() {
  const session = await getServerSession(authOptions);

  return (
    <footer className="fixed bottom-0 left-0 w-full h-14 px-4 bg-sky-900 border-t dark:border-gray-700 flex items-center z-10">
      <Link
        className="flex items-center gap-2 text-sm sm:text-lg font-semibold"
        href="#"
      >
        <Image
          priority={false}
          src={Logo}
          alt="JP System Logo"
          width={24} // Ajuste o tamanho conforme necessário
          height={24} // Ajuste o tamanho conforme necessário
        />
        <span className="text-sky-50">
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
        {session && (
          <LogoutButton
            size="lg"
            text="Logout"
            variant="outline"
            className={`
              bg-sky-800  
              text-sky-50 
              border-r 
              border-sky-50`}
          />
        )}
      </div>
    </footer>
  );
}
