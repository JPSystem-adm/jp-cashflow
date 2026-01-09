// src/app/(app)/lancamentos/page.tsx

import TabelaLancamentos from "./_components/tabelaLancamentos";
import { LancamentoProvider } from "./_components/contextLancamentoProvider";
import PainelFiltros from "./_components/painelFiltros";

export default async function LancamentosPage() {
  return (
    <LancamentoProvider>
      <div className="overflow-x-auto min-w-screen w-[90%] min-h-screen max-w-[1400px] min-w-[500px]">
        <div className="justify-items-center flex flex-col md:justify-center md:px-6 md:gap-5">
          <div className="flex flex-col w-full gap-4">
            <h1 className="text-2xl font-bold tracking-tighter text-center text-sky-900">
              Grupos de Lançamentos
            </h1>
            <p className="mb-6 text-sky-800 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-center">
              Gerenciar os lançamentos para o controle financeiro
            </p>
          </div>
        </div>
        <PainelFiltros />
        <div className="items-center">
          <TabelaLancamentos />
        </div>
      </div>
    </LancamentoProvider>
  );
}
