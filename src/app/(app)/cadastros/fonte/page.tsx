// src/app/(app)/cadastros/fonte/page.tsx

import NovoFonteForm from "./_components/novoFonteForm";
import TabelaFonte from "./_components/tabelaFontes";
import PageContainer from "@/app/(app)/_components/PageContainer";

export default function Fontes() {
  return (
    <PageContainer className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col w-full justify-center">
          <h1 className="text-sky-900 text-2xl font-bold tracking-tighter text-center">
            Fontes
          </h1>
          <p className="text-sky-800 md:text-lg text-center">
            Gerenciar suas contas financeiras
          </p>
        </div>

        <div className="flex w-full justify-end">
          <NovoFonteForm />
        </div>
      </div>
      {/* tabela com scroll horizontal quando necessário */}
      <div className="w-full min-w-0 overflow-x-auto">
        <TabelaFonte />
      </div>
    </PageContainer>
  );
}
