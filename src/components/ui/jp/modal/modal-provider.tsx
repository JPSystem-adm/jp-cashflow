// src/components/ui/jp/modal/modal-provider.tsx

"use client"

import { ModalContext } from "./modal-context"
import { useState } from "react"

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("Modal");
  const [body, setBody] = useState<string>("...texto");
  return(
    <ModalContext.Provider value={{ show, setShow, title, setTitle, body, setBody}}>
      {children}
    </ModalContext.Provider>
  );

}