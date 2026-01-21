// src/app/(app)/_components/PageContainer.tsx

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /**
   * Largura máxima do conteúdo (tailwind max-w-*)
   * default: "max-w-6xl"
   */
  maxWidthClassName?: string;
  /**
   * Padding vertical padrão
   * default: "py-4 sm:py-6"
   */
  paddingYClassName?: string;
  /**
   * Padding horizontal padrão
   * default: "px-4 sm:px-6 lg:px-8"
   */
  paddingXClassName?: string;
  /**
   * Classe extra opcional
   */
  className?: string;
};

export default function PageContainer({
  children,
  maxWidthClassName = "max-w-6xl",
  paddingYClassName = "py-4 sm:py-6",
  paddingXClassName = "px-4 sm:px-6 lg:px-8",
  className = "",
}: Props) {
  return (
    <div className={`w-full ${paddingYClassName}`}>
      <div className={`w-full mx-auto ${maxWidthClassName} ${paddingXClassName} ${className}`}>
        {children}
      </div>
    </div>
  );
}
