import { getServerSession } from "next-auth"
import { auth as authOptions } from "@/lib/auth-config"
import { AppProvider } from "./_components/contextProvider";
import PainelControleOrcamento from "./_components/painelControleOrcamento";
import TabelaOrcamento from "./_components/tabelaOrcamento";

export default async function Orcamento() {
  //Carregar variavei de secao
  const session = await getServerSession(authOptions)

  return (
    <AppProvider userId={session?.user.id}>
      <div className="flex flex-col mb-6 min-h-[70vh] w-[90%] max-w-[1400px] min-w-[500px] items-start px-4 pt-0 pb-6">
        <div className="flex flex-col w-full gap-4">
          <h1 className="text-sky-900 text-2xl font-bold tracking-tighter text-center">
            Orçamento
          </h1>
          <p className="text-sky-800 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-center">
            Elaboração de orçamentos no período
          </p>
          <div className="flex w-full justify-end">
            <PainelControleOrcamento />
          </div>
          <div>
            <TabelaOrcamento />
          </div>
        </div>
      </div>
    </AppProvider>
  );
}
