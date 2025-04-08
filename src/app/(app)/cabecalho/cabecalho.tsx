import Link from "next/link";
import ActivityIcon from "../_components/ActivityIcon";
import { getServerSession } from "next-auth";
import { auth as authOptions } from "@/lib/auth-config";
import UserCircleIcon from "../_components/UserCircleIcon";
import Periodo from "./periodo";

export default async function Cabecalho() {
  const session = await getServerSession(authOptions);
  
  return(
  <header className="fixed top-0 left-0 w-full h-14 px-4 bg-sky-900 border-b dark:border-gray-700 text-sky-50 z-10">
    <div className="flex items-center h-full">
      <Link
        className="flex items-center gap-2 text-xl sm:text-2xl font-semibold"
        href="#"
      >
        <ActivityIcon className="w-6 h-6 text-sky-50" />
        <span className="py-4 text-sky-50">JP Cash Flow</span>
      </Link>
      <div className="flex items-center gap-4 ml-auto">
        { session && (
          <Periodo/>
        )}
      </div>
      <div className="flex items-center gap-4 ml-auto">
        {session && (
          <Link
            className="flex items-center gap-2 text-xl sm:text-2xl font-medium py-4"
            href="#"
          >
            <UserCircleIcon
              className={`w-6 h-6 ${
                session.user.role !== "admin"
                  ? "text-blue-700"
                  : "text-green-700"
              } rounded-full`}
            />
            <span className="text-sky-50">{session.user.name}</span>
          </Link>
        )}
      </div>
    </div>

  </header>
  )
}