'use server'

export async function DerecionarPara(rota: string) {
  return {
    redirect: {
      destination: rota,
      permanent: false,
    },
  };
}
