// // src/lib/auth.ts

// import { verifyToken } from "@/lib/jwt";
// import { NextRequest } from "next/server";

// export function getTokenFromHeader(req: NextRequest): string | null {
//     const authHeader = req.headers.get("authorization");
//     if (!authHeader) return null;

//     const [scheme, token] = authHeader.split(" ");
//     if (scheme !== "Bearer" || !token) return null;
  
//     return token;
// }

// export function getUserFromToken(req: NextRequest) {
//     const token = getTokenFromHeader(req);
//     if (!token) return null;
  
//     return verifyToken(token); // Isso aqui já retorna o DecodedToken
//   }
