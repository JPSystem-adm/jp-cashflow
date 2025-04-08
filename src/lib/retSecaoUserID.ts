import { getServerSession } from "next-auth"
import { auth as authOptions } from "@/lib/auth-config";

 async function retId() {
   const session = await getServerSession(authOptions);
  if(session) {
    return session?.user.id || 0;
  }else{
    return 0;
  }

 }
 const retorno =  retId();
export default retorno ;