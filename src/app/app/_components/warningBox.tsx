"use client"

import React, { useEffect, useState } from "react"
import { 
  AlertDialog, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogOverlay, 
  AlertDialogTitle 
} from "./../../components/ui/alert-dialog"

enum tipoEnu {
  Alerta = "A",
  Sucesso = "S",
  Erro = "E",
}

interface WarningBoxProps {
  tipo: tipoEnu,
  mensagem: string,
  onCancel: () => void;
}

type formato = {
  titulo: string,
  estilo: string,
}

function WarningBox({ tipo, mensagem, onCancel }: WarningBoxProps) {
  const [formatAlerta, setFormatAlerta] = useState<formato>()

  useEffect(() => {
    retFormato(tipo);
  },[tipo]);

  function retFormato(tipo: tipoEnu){
    if(tipo == tipoEnu.Alerta){
      setFormatAlerta({
        titulo: "Atenção!",
        estilo: "text-yellow-500"
      })
    }
    if(tipo == tipoEnu.Sucesso){
      setFormatAlerta({
        titulo: "Sucesso!",
        estilo: "text-green-600"
      })
    }
    if(tipo == tipoEnu.Erro){
      setFormatAlerta({
        titulo: "Error!",
        estilo: "text-red-600"
      })
    }
  }

  return (
    <AlertDialog open={true}>
      <AlertDialogOverlay className="bg-amber-900/60"/>
      <AlertDialogContent className="bg-sky-50 w-[35rem] sm:w-[35rem] border-2 border-sky-950">
        <AlertDialogHeader>
          <AlertDialogTitle className={`text-lg mb-4 text-center ${formatAlerta?.estilo} font-semibold`}>{formatAlerta?.titulo}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-muted-foreground">
            {mensagem}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="justify-center mt-8 sm:justify-center">
          <AlertDialogCancel onClick={onCancel} className="text-lg text-sky-950 w-28 font-semibold hover:bg-amber-50 ">OK</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { WarningBox, tipoEnu }