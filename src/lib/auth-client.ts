// // src/lib/auth-client.ts

// "use server";

// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { verifyToken } from "@/lib/jwt"; // Essa função precisa existir localmente ou ser feita via fetch

// export async function getUserFromCookie() {
//   const cookieStore = cookies();
//   const token = cookieStore.get("token")?.value;

//   if (!token) return null;

//   try {
//     const user = await verifyToken(token); // Precisa decodificar e validar assinatura
//     return user;
//   } catch (error) {
//     return null;
//   }
// }

// // ✅ Para usar em páginas protegidas
// export async function requireAuth({
//   redirectToRoot = false,
// }: { redirectToRoot?: boolean } = {}) {
//   const user = await getUserFromCookie();
//   if (!user) {
//     redirect(redirectToRoot ? "/" : "/login");
//   }

//   return user;
// }
