import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const obterMesAno = () => {
  const anoAtual = new Date().getFullYear();
  const mesAno = [];
  for (let ano = anoAtual; ano <= anoAtual + 5; ano++) {
    for (let mes = 0; mes < meses.length; mes++) {
      mesAno.push(`${meses[mes]}/${ano}`);
    }
  }
  return mesAno;
};

const BoxMesAno = () => {
  const [mesAnoSelecionado, setMesAnoSelecionado] = useState("");

  const handleChangeMesAno = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMesAnoSelecionado(e.target.value);
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="space-x-4 p-4">
        <select
          className="form-select block px-3 py-1.5 text-base 
           font-normal text-sky-900 bg-white bg-clip-padding bg-no-repeat
           border border-solid border-sky-900 rounded transition ease-in-out m-0 
           focus:text-sky-800 focus:bg-white focus:border-sky-700 focus:outline-none"
          value={mesAnoSelecionado}
          onChange={handleChangeMesAno}
        >
          <option>Selecione o Mês/Ano</option>
          {obterMesAno().map((mesAno, index) => (
            <option key={index} value={mesAno}>
              {mesAno}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BoxMesAno;
