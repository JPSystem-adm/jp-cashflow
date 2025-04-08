"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmationBoxProps {
  title: string;
  menssage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationBox({
  title,
  menssage,
  onConfirm,
  onCancel,
}: ConfirmationBoxProps) {
  return (
    
    <AlertDialog open={true}>
      <AlertDialogOverlay className="bg-amber-900/60"/>
      <AlertDialogContent className="bg-sky-50">
      
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg text-amber-800 font-semibold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {menssage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-lg text-amber-950 font-semibold hover:bg-amber-50 " onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="text-lg text-sky-950 font-semibold bg-white hover:bg-amber-50 " onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
