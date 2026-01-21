// src/app/(app)/cadastros/saldos/page.tsx

import PainelControleSaldo from "./_components/painelControleSaldo";
import TabelaSaldo from "./_components/tabelaSaldos";

export default function SaldoPage() {
  return (
    <div className="flex flex-col mb-6 min-h-[70vh] w-full max-w-[1400px] items-start px-4 pt-0 pb-4">
      <div className="flex flex-col w-full gap-4">
        <h1 className="text-sky-900 text-2xl font-bold tracking-tighter text-center">
          Saldo
        </h1>
        <p className="text-sky-800 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-center">
          Elaboração de saldos no período.
        </p>

        <div className="flex w-full justify-end">
          <PainelControleSaldo />
        </div>

        <div className="w-full">
          <TabelaSaldo />
        </div>
      </div>
    </div>
  );
}

