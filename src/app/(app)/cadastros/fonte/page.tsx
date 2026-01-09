// src/app/(app)/cadastros/fonte/page.tsx

import NovoFonteForm from "./_components/novoFonteForm"
import TabelaFonte from "./_components/tabelaFontes"


export default async function Fontes() {

  return (
    <div className="flex flex-col mb-6 w-[90%] max-w-[1400px] min-w-[500px] items-start gap-4 px-4 pb-4 md:justify-center md:px-6 md:gap-5">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col w-full justify-center">
          <h1 className="text-sky-900 text-2xl font-bold tracking-tighter sm:text-2xl md:text-2xl text-center">
            Fontes
          </h1>
          <p className="text-sky-800 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-center">
            Gerenciar suas contas financeiras
          </p>
        </div>
        <div className="flex w-full justify-end">
          <NovoFonteForm />
        </div>
      </div>
      <TabelaFonte />
    </div>
  )
}
