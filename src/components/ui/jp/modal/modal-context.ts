// src/components/ui/jp/modal/modal-context.ts

"use client"

import { createContext } from "react"

interface ModalContext {
  show: boolean;
  setShow: (value: boolean) => void;
  title: string;
  setTitle: (value: string) => void;
  body: string;
  setBody: (value: string) => void;
}

export const ModalContext = createContext({
  show: false,
  title: "Modal",
  body: "...texto"
} as ModalContext)