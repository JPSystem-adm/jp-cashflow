"use client";

import {
  LuHome,
  LuBarChartBig,
  LuFileEdit,
  LuCalendarCheck,
  LuDatabase,
  LuAlignJustify,
  LuFolder,
  LuCreditCard,
  LuClipboardList,
  LuDollarSign,
  LuInfo,
} from "react-icons/lu";

import { RiFileExcel2Fill } from "react-icons/ri";

import { useSession } from "next-auth/react";

export function IconHome(props: any) {
  const { data: session } = useSession();
  return (
    <>
      <LuHome {...props} />
      {/* <span>{(session ? session.user.name : '')}</span> */}
    </>
  );
}

export function IconDashBoard(props: any) {
  return <LuBarChartBig {...props} />;
}

export function IconLancamentos(props: any) {
  return <LuFileEdit {...props} />;
}

export function IconAgenda(props: any) {
  return <LuCalendarCheck {...props} />;
}

export function IconCadastros(props: any) {
  return <LuDatabase {...props} />;
}

export function IconMenu(props: any) {
  return <LuAlignJustify {...props} />;
}

// Novos ícones adicionados:
export function IconGrupoContas(props: any) {
  return <LuFolder {...props} />;
}

export function IconContasFinanceiras(props: any) {
  return <LuCreditCard {...props} />;
}

export function IconOrcamentos(props: any) {
  return <LuClipboardList {...props} />;
}

export function IconSaldos(props: any) {
  return <LuDollarSign {...props} />;
}

export function IconAbout(props: any) {
  return <LuInfo {...props} />;
}

export function IconExcel(props: any) {
  return <RiFileExcel2Fill {...props} />;
}