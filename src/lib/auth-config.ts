// // src/lib/auth-config.ts

// import CredentialsProvider from "next-auth/providers/credentials";
// import { NextAuthOptions } from "next-auth";

// export const auth: NextAuthOptions = {
  
//   pages: {
//     signIn: "/login",
//   },
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         nickname: { label: "Login", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials, req) {
        
//         if (!credentials) {
//           return null;
//         }

//         try {
//           // Envia as credenciais para a API de login
//           const rotaLogin = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/public/global/auth`;
//           console.log("Rota de login : ", rotaLogin);
//           const res = await fetch(rotaLogin, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               login: credentials.nickname,
//               senha: credentials.password,
//             }),
//           });

//           if (!res.ok) {
//             return null;  // Em caso de falha na autenticação
//           }

//           const data = await res.json();

//           // Retorna os dados do usuário, incluindo o token
//           return {
//             id: data.id.toString(),
//             name: data.nome.toUpperCase(),
//             email: data.email,
//             nickname: data.login,
//             role: data.perfil,
//             token: data.token,  // ✅ Agora TypeScript aceita sem erro!
//           };

//         } catch (error) {
//           return null;
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     jwt({ token, user }) {
//       if (user) {
//         token.role = user.role;
//         token.nickname = user.nickname?.toLowerCase();
//         token.id = parseInt(user.id);
//         token.token = user.token;  // ✅ TypeScript não reclama mais
//       }
//       return token;
//     },
//     session({ session, token }) {
//       session.user = {
//         ...(session.user as any), // ⚠️ TypeScript para de reclamar
//         role: token.role,
//         nickname: token.nickname,
//         id: token.id,
//         token: token.token as string, // ✅ Agora TypeScript reconhece
//       };
//       return session;
//     },
//   },
// };
