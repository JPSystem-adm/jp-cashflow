import NovoGrupoForm from "./_components/novoGrupoForm"
import TabelaGrupos from "./_components/tabelaGrupos"
import { getServerSession } from "next-auth"
import { auth as authOptions } from "@/lib/auth-config"

export default async function GrupoDeContas() {
  
  //Carregar variavei de secao
  const session = await getServerSession(authOptions)

  return (
    
    <div className="flex flex-col mb-6 w-[90%] max-w-[1400px] min-w-[500px] items-start gap-4 px-4 pb-4 md:justify-center md:px-6 md:gap-5">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col w-full justify-center">
          <h1 className="text-sky-900 text-2xl font-bold tracking-tighter text-center">
            Grupos de contas
          </h1>
          <p className="text-sky-800 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-center">
            Gerenciar o plano de contas para o controle financeiro
          </p>
        </div>
        {/* <div className="flex w-full justify-end"> */}
        <div className="justify-items-center flex w-full justify-end content-center mt-6">
          <NovoGrupoForm />
        </div>
      <TabelaGrupos userIdSession={session?.user.id} />
      </div>
    </div>
  )
}
