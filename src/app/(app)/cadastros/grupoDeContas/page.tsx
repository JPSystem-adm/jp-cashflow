// src/app/(app)/cadastros/grupoDeContas/page.tsx
import NovoGrupoForm from "./_components/novoGrupoForm";
import TabelaGrupos from "./_components/tabelaGrupos";
import PageContainer from "@/app/(app)/_components/PageContainer";

export default async function GrupoDeContas() {
  return (
    <PageContainer className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col w-full justify-center">
          <h1 className="text-sky-900 text-xl sm:text-2xl font-bold tracking-tighter text-center">
            Grupos de contas
          </h1>
          <p className="text-sky-800 text-sm sm:text-base lg:text-lg text-center">
            Gerenciar o plano de contas para o controle financeiro
          </p>
        </div>

        <div className="flex w-full justify-center sm:justify-end mt-2 sm:mt-6">
          <NovoGrupoForm />
        </div>
      </div>

      {/* tabela com scroll horizontal quando necessário */}
      <div className="w-full min-w-0 overflow-x-auto">
        <TabelaGrupos />
      </div>
    </PageContainer>
  );
}
