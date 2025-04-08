"use client"

import React, { useState } from 'react';
import {Button} from "../../../components/ui/button"
import {WarningBox, tipoEnu } from '../_components/warningBox';

// enum tipoEnu {
//   Alerta = "A",
//   Sucesso = "S",
//   Erro = "E",
// }

export default function Page() {

  //Variavel para a caixa de confirmação (ConfirmationBox)
  const [showAlerta, setShowAlerta] = useState(false);

  //Variavel para a caixa de confirmação (ConfirmationBox)
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);

  //Variavel para a caixa de confirmação (ConfirmationBox)
  const [mensagem, setMensagem] = useState("Menssagem default");

    // Função para excluir um grupo
    const handleAlerta = async (tipo: tipoEnu, mensagem: string) => {
      setTipo(tipo);
      setMensagem(mensagem);
      setShowAlerta(true);
    }

      //Função para cancelar a exclusão
  const handleCancel=()=>{
    console.log("Exclusão cancelada!")
    setShowAlerta(false);
  };

  return (
    <div>
      { showAlerta && (
          <WarningBox
            tipo={tipo}
            mensagem={mensagem}
            onCancel={handleCancel}
          />
        )
      }
      <h1>Página para testes de componentes</h1>
      <div className="flex flex-column align-justify">
        <Button onClick={() => handleAlerta(tipoEnu.Alerta, "Minha menssagem de alerta!")} >Alerta</Button>
        <Button onClick={() => handleAlerta(tipoEnu.Sucesso, "Minha menssagem de sucesso!")} >Sucesso</Button>
        <Button onClick={() => handleAlerta(tipoEnu.Erro, "Minha menssagem de erro!")} >Erro</Button>
      </div>
    </div>
    
  )
}