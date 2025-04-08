"use server"

import { tyErro, tyResult, tyUsuario, tyVerificacao } from "@/types/types"
import prisma from "@/lib/db"
import { error } from "console"
import { geraCodigoAleatorio } from "@/lib/jpFuncoes"


export async function NovoUsuario(data: tyUsuario) {
  let retorno = {
    status: 0,
    menssage: "Vazio",
  }
  try {
    //Inicio da Transação
    const novoUsuario = await prisma.$transaction(async (prisma) => {
      //cria o novo usuario
      const usuario = await prisma.user.create({
        data: {
          login: data.login,
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          perfil: data.perfil,
        },
      });
      //cria o Grupo de Entradas
      const grupo1 = await prisma.grupo.create({
        data: {
          nome: "ENTRADA",
          descricao: "Grupo para contas de entrada",
          tipo: "C",
          ativo: true,
          userId: usuario.id,
        },
      });
      //cria o Grupo de Tranferências
      const grupo2 = await prisma.grupo.create({
        data: {
          nome: "TRANSFERENCIAS",
          descricao: "Grupo para contas de transferências",
          tipo: "M",
          ativo: true,
          userId: usuario.id,
        },
      });
      retorno.status = 1
      retorno.menssage = `Cadastro do usuario ${usuario.nome} efetuado com sucesso<br />
                          Login: ${usuario.login}<br />
                          Email: ${usuario.email}<br />
                          Id: ${usuario.id}`
    }) 
    
  } catch (err: any) {
    if (err.code === "P2002") {
      retorno.status = 0
      retorno.menssage = "O email ou login já está cadastrado para outro usuário!"
    } else {
      retorno.status = 0
      retorno.menssage = `Ocorreu um erro inesperado no servidor: ${err.menssage}`
    }
  }
  return retorno
}

//Essa função é apenas para desenvolvimento e
//Cria um usuario Administrador
export async function CreateUsuarioAdmin() {
  let retorno = {
    status: 0,
    menssage: "Vazio",
  }
  try {
    const { id } = await prisma.user.create({
      data: {
        login: "jpsystem",
        nome: "JP-System",
        email: "jpsystem@gmail.com",
        senha: "123456",
        perfil: "admin",
        // dtToken: data.dtToken,
      },
    })
    retorno.status = 1
    retorno.menssage = `Cadastro do usuario ${id} efetuado com sucesso`
  } catch (err: any) {
    if (err.code === "P2002") {
      retorno.status = 0
      retorno.menssage = "O email já está cadastrado para outro usuário!"
    } else {
      retorno.status = 0
      retorno.menssage = err.menssage
    }
  }
  return retorno
}

export async function IncluirCodVerificacao(login?: string, email?: string){
  let codigo = geraCodigoAleatorio();
  try {    
    const retorno = await prisma.user.updateMany({
      where: {
        ...login && {login: login},
        ...email && {email: email},
      },
      data: {
        codVerificacao: codigo,
        dtVerificacao: new Date()
      }
    })

    if(retorno.count === 0){  
      codigo = "NADA";
    }
  } catch (error) {
    codigo = "ERRO";
  }finally {
    return codigo;
  }
}

// export async function ValidaCodigo(codigo: string, email: string): Promise<tyVerificacao | boolean> {
//   try {

//     const result:tyVerificacao[] = await prisma.$queryRaw`
//       SELECT
//         id,
//         login,
//         email,
//         nome, 
//         TIMESTAMPDIFF(MINUTE, dtVerificacao, NOW()) AS minutos_passados
//       FROM 
//         user
//       WHERE 
//         email = ${email} AND codVerificacao = ${codigo}
//     `
//     if(result){
//       if(result[0].minutos_passados < 10){
//         return result[0];
//       }else{  
//         return false;
//       }
//     }else{
//       return false;
//     }
//   } catch (error) {
//     return false;
//   }
// }

export async function RetUsuarioPorLoginOuEmail(login?: string, email?: string): Promise<tyVerificacao | boolean> {
  try {

    const result:tyVerificacao[] = await prisma.$queryRaw`
      SELECT
        id,
        (login),
        email,
        nome, 
        TIMESTAMPDIFF(MINUTE, dtVerificacao, NOW()) AS minutos_passados
      FROM 
        cashFlow.User
      WHERE 
        login = ${login} OR email = ${email};
    `
    if (result.length > 0) {
      return result[0];
    } else {
      return false;
    }

  } catch (error) {
    return false;
  }
}

//Essa função altera os dados do subGrupo
export async function AlteraSenha(data: { id: number, senha: string,  confirmaSenha: string}) {
  const result:tyResult = <tyResult>{ status: ""};
  const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/public/restrita/alteraSenha`
  try {
    const response = await fetch(urlAPI, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: data.id,
        senha: data.senha,
      }),
    });

    if (!response.ok) {
      const erroApi = await response.json();
      return {
        status: "Erro",
        menssagem: erroApi.message || "Erro ao alterar senha",
      };
    }

    const dados = await response.json();

    return {
      status: "Sucesso",
      dados,
    };

    // const fonte = await prisma.user.update({
    //   where: {id: data.id},
    //   data: {
    //     senha: data.senha,
    //   },
    // })
    // result.status = "Sucesso"
    // result.dados = fonte
    // return result     
  } catch (err) {
    const erro = <tyErro>err;
    return {
      status: "Erro",
      menssagem: erro.code + " Erro inesperado ao alterar senha" || "Erro inesperado ao alterar senha",
    };
    // const erro = <tyErro>err;
    // result.status = "Erro"
    // result.menssagem = erro.code
    // return result
  }
}