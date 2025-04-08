import { tyVerificacao } from "@/types/types";

/**
 * Gera um codigo aleatorio entre 1000 e 9999
 * @returns Uma string de 4 digitos
 * @author JP
 */
export function geraCodigoAleatorio(): string {
  const codigo = Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
  return codigo ;
}

/**
 * Valida se o input é um email ou login
 * @param {string} input O valor a ser validado
 * @returns {string} 'email' se for um email, 'login' caso contrário
 * @author JP
 */
export function validarTipoLogin(input: string): string {
  // Regex para validar email
  const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegExp.test(input)) {
    return 'email';
  } else {
    return 'login';
  }
}

/**
 * Montar o email de redefinicao de senha, a partir do modelo.
 * @param {tyVerificacao} dados Dados do usuário e código de verificação
 * @returns {string} Script HTML com o Email de redefinicao de senha 
 * @author JP
*/
export async function montaEmailVerificacao(dados: tyVerificacao): Promise<string> {

  // let arquivo = await fetch('./public/emailRedefinirSenha.html')
  // .then((r) => r.text())
  // .then((text) => {
  //   return text
  // } )
  let arquivo = corpo;
  arquivo = arquivo.replace('#{parNome}',dados.nome);
  arquivo = arquivo.replace('#{parCodigo}',dados.codigo || "");

  return arquivo
}

const corpo:string = `
<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    <meta http-equiv='X-UA-Compatible' content='IE=edge' />
    <style type='text/css'>
      body,
      table,
      td,
      a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table {
        border-collapse: collapse !important;
      }
      body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }
      @media screen and (max-width: 525px) {
        .wrapper {
          width: 100% !important;
          max-width: 100% !important;
        }
        .responsive-table {
          width: 100% !important;
        }
        .padding {
          padding: 10px 5% 15px 5% !important;
        }
        .section-padding {
          padding: 0 15px 50px 15px !important;
        }
      }  
      .destaque{
        padding: 0 0 0 0;
        font-size: 16px;
        font-weight: bold;
        line-height: 25px;
        color: #00F; 
      }
      .aviso{
        padding: 0 0 0 0;
        font-size: 16px;
        font-weight: bold;
        line-height: 25px;
        color: #F00; 
      }
      .codigo{
        padding: 5px;
        font-size: 32px;
        font-weight: bold;
        line-height: 35px;
        color: #00F; 
      }
      .form-container {
        margin-bottom: 24px;
        padding: 20px;
        border: 1px dashed #ccc;
      }
      .form-heading {
        color: #2a2a2a;
        font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        font-weight: 400;
        text-align: left;
        line-height: 20px;
        font-size: 18px;
        margin: 0 0 8px;
        padding: 0;
      }
      .form-answer {
        color: #2a2a2a;
        font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        font-weight: 300;
        text-align: left;
        line-height: 20px;
        font-size: 16px;
        margin: 0 0 24px;
        padding: 0;
      }
      div[style*='margin: 16px 0;'] {
        margin: 0 !important;
      }
    </style>
  </head>
  <body style='margin: 0 !important; padding: 0 !important; background: #fff'>
    <div
      style='
        display: none;
        font-size: 1px;
        color: #fefefe;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      '
    ></div>
    <table border='0' cellpadding='0' cellspacing='0' width='100%'>
      <tr>
        <td
          bgcolor='#ffffff'
          align='center'
          style='padding: 10px 15px 30px 15px'
          class='section-padding'
        >
          <table
            border='0'
            cellpadding='0'
            cellspacing='0'
            width='100%'
            style='max-width: 500px'
            class='responsive-table'
          >
            <tr>
              <td>
                <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                  <tr>
                    <td>
                      <table
                        width='100%'
                        border='0'
                        cellspacing='0'
                        cellpadding='0'
                      >
                        <tr>
                          <td
                            style='
                              padding: 0 0 0 0;
                              font-size: 16px;
                              line-height: 25px;
                              color: #232323;
                            '
                            class='padding message-content'
                          >
                            <h2>🔑Redefinir sua senha!</h2>
                            <div class='form-container'>
                              <p>Olá <span class='destaque'>#{parNome},</p>
                              <p>Este é o codigo de verificação para alteração de sua senha.</p>
                              <p><span class='codigo'>#{parCodigo}</span>.</p>
                              <p class='aviso'>Este código tem validade de 10 minutos.</p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`