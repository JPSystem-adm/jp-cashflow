// // src/app/(app)/actions/saldosActions.ts

// //"use server";

// import { tyErro, tyResult, tySaldo, tySaldos } from "@/types/types";
// import { retPeriodoAnterior } from "@/lib/formatacoes";
// import { RetSomatoriasPeriodo } from "./graficosActions";
// //import { console } from "inspector";
// //import { cookies } from "next/headers";
// import { getTokenFromCookie } from "@/lib/getToken";

// const API_URL = process.env.NEXT_PUBLIC_BASEURL_API
// type tySomatoriasPeriodo = {
//   FonteId: number;
//   Fonte: string;
//   Tipo: string;
//   saldoId: number;
//   valorInicial: number;
//   valorPeriodo: number;
//   saldoAtual: number;
// }
// export async function SaldosFontesPorPeriodo(periodoId: number, userId: number): Promise<tySaldos[]> {
//   //const token = cookies().get("token")?.value;
//   const token = getTokenFromCookie();
//   if (!token) {
//     console.error("Token não encontrado.");
//     return [];
//   }
//   const res = await fetch(`${API_URL}/api/private/restrita/saldo/fontes?periodoId=${periodoId}&userId=${userId}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) return [];
//   return res.json();
// }

// export async function RetSaldos(periodoId: number | undefined): Promise<tySaldo[]> {
//   const token = getTokenFromCookie();
//   if (!token) {
//     console.error("Token não encontrado.");
//     return [];
//   }

//   const res = await fetch(`${API_URL}/api/private/restrita/saldo?periodoId=${periodoId}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) return [];
//   return res.json();
// }

// export async function CriarSaldos(periodo: string, usuarioId: number): Promise<tyResult> {
//   console.log("CriarSaldos-Actions: ", periodo, usuarioId);

//   const token = getTokenFromCookie();
//   if (!token) {
//     console.error("Token não encontrado.");
//     return { status: "Erro", menssagem: "Token não encontrado." };
//   }
//   //const token =  getTokenFromCookie();
//   const periodoAnterior = await retPeriodoAnterior(periodo);
//   console.log("CriarSaldos periodoAnterior", periodoAnterior);
//   const periodoAtualId = await RetIdPeriodo(periodo);
//   console.log("CriarSaldos periodoAtualId", periodoAtualId);
//   const periodoAnteriorId = await RetIdPeriodo(periodoAnterior);
//   console.log("CriarSaldos periodoAnteriorId", periodoAnteriorId);

//   try {
    
//     const retSaldos:tySomatoriasPeriodo[] = await RetSomatoriasPeriodo(periodoAnteriorId, "inicializacao");

//     console.log("CriarSaldos retSaldos", retSaldos);

//     let response: Response[] = [];

//     if (retSaldos.length > 0) {
//       response = await Promise.all(
//         retSaldos.map((saldo): Promise<Response>   =>
//           fetch(`${API_URL}/api/private/restrita/saldo`, {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               periodoId: periodoAtualId,
//               fonteId: saldo.FonteId,
//               valor: saldo.saldoAtual,
//             }),
//           })
//         )
//       );
//     } else {
//       const saldosAntigos: tySaldos[] = await SaldosFontesPorPeriodo(periodoAnteriorId, usuarioId);
//       response = await Promise.all(
//         saldosAntigos.map(saldo =>
//           fetch(`${API_URL}/api/private/restrita/saldo`, {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               periodoId: periodoAtualId,
//               fonteId: saldo.fonteId,
//               valor: saldo.totFonte,
//             }),
//           })
//         )
//       );
//     }
//     return { status: "Sucesso", dados: response };
//   } catch (error) {
//     const erro = error as tyErro;
//     return { status: "Erro", menssagem: erro.code|| "Erro ao criar saldos", dados: erro };
//   }
// }

// export async function fontesAtivas(periodoID: number, usuarioId: number | undefined): Promise<number> {
//   const token = getTokenFromCookie();
//   if (!token) {
//     console.error("Token não encontrado.");
//     return 0;
//   }

//   const res = await fetch(`${API_URL}/api/private/restrita/saldo/fontesAtivas?periodoId=${periodoID}&userId=${usuarioId}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) return 0;
//   const count = await res.json();
//   return count;
// }
// export async function RetIdPeriodo(periodoNome: string): Promise<number> {
//   const token = getTokenFromCookie();
//   if (!token) {
//     console.error("Token não encontrado.");
//     return 0;
//   }

//   try {
//     const res = await fetch(`${API_URL}/api/private/restrita/periodo/retIdPeriodo`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ periodo: periodoNome }),
//     });

//     if (!res.ok) {
//       console.error("Erro ao buscar o ID do período");
//       return 0;
//     }

//     const json = await res.json();
//     return json.periodoId ?? 0;
//   } catch (error) {
//     console.error("Erro inesperado:", error);
//     return 0;
//   }
// }

// export async function AtualizaSaldo(saldoId: number, valor: number): Promise<tyResult> {
//   const token = getTokenFromCookie();
//   if (!token) {
//     console.error("Token não encontrado.");
//     return { status: "Erro", menssagem: "Token não encontrado." };
//   }

//   try {
//     const res = await fetch(`${API_URL}/api/private/restrita/saldo/${saldoId}`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ valor }),
//     });

//     const json = await res.json();
//     if (!res.ok) throw new Error(json.error || "Erro desconhecido");
//     return { status: "Sucesso", dados: json };
//   } catch (error) {
//     const erro = error as tyErro;
//     return { status: "Erro", menssagem: erro.code|| "Erro ao atualizar saldo" };
//   }
// }

// export async function AtualizaSaldos(periodoID: number, usuarioId: number | undefined): Promise<tyResult> {
//   const token = getTokenFromCookie();
//   if (!token) {
//     console.error("Token não encontrado.");
//     return { status: "Erro", menssagem: "Token não encontrado." };
//   }

//   const res = await fetch(`${API_URL}/api/private/restrita/saldo/atualiza?periodoId=${periodoID}&userId=${usuarioId}`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!res.ok) {
//     const erro = await res.json();
//     return { status: "Erro", menssagem: erro.message|| "Erro ao atualizar saldo" };
//   }
//   const dados = await res.json();
//   return { status: "Sucesso", dados };
// }


