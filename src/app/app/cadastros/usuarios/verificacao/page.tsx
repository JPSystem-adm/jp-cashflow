'use client'
import { useState } from 'react';
import { VerificaOTP } from '../_components/verificaOTP';
import { ResetaSenha } from '../_components/resetaSenha';

export default function Verificacao() {

  const [step, setStep] = useState(1);
  
  return(
     <>
      {step === 1 && (
         <VerificaOTP setStep={setStep} />
       )}
       {step === 2 && (
        <ResetaSenha />
      )}
    </>
  );
};


