// src/components/ui/jp/modal/modal.tsx

"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

import { useContext } from "react";

import { ModalContext } from "./modal-context";
import { Button } from "../../button";


export default function Modal() {
  const { show, setShow, title, setTitle, body, setBody } = useContext(ModalContext);

  return(
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-md bg-white border-4">
      <div className="m-6 flex flex-col gap-4">

        <DialogHeader className="m-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {body}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button  onClick={() => setShow(false)} type="button" variant="default">
              Close
            </Button>
        </DialogFooter>
      </div>
      </DialogContent>
    </Dialog>
  )
}