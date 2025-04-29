// src/app/(public)/page.tsx

export default async function Home() {
  console.log("Entrou na seção HOME")
  return (
    
    <div className="text-slate-500">
      <h1>Home</h1>
      <p>Seja bem-vindo ao JP CashFlow 👋</p>
    </div>
  )
}

//import { getServerSession } from "next-auth"
//import { auth as authOptions } from "@/lib/auth-config"
//import { redirect } from "next/navigation"


  // const session = await getServerSession(authOptions)
  // // 🟡 Se estiver logado, redireciona para o dashboard
  // if (session) {
  //   redirect("/app/dashboard") // 🔁 Atualizado aqui também
  // }
  // 🟡 Se nao estiver logado, mostra a home