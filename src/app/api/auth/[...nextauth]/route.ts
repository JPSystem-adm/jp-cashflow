// src/app/api/auth/[...nextauth]/route.ts

import {auth as authOptions} from '@/lib/auth-config'
import NextAuth from "next-auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

//###############################################
// Todo o codigo que ficava aqui eu migrei para o 
// arquivo auth-config.ts que está na pasta @/lib
//###############################################