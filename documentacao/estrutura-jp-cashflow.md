# Estrutura do Projeto jp-cashflow (a partir de src/)

```
\---src
    |   middleware.ts
    |   
    +---app
    |   |   globals.css
    |   |   layout.tsx
    |   |   
    |   +---(app)
    |   |   |   contextGlobal.tsx
    |   |   |   globals.css
    |   |   |   layout.tsx
    |   |   |   
    |   |   +---about
    |   |   |   |   page.tsx
    |   |   |   |   
    |   |   |   \---_components
    |   |   +---actions
    |   |   |       enviaEmail.ts
    |   |   |       excel.ts
    |   |   |       fonteActions.ts
    |   |   |       graficosActions.ts
    |   |   |       grupoActions.ts
    |   |   |       grupoAPI.ts
    |   |   |       lancamentoActions.ts
    |   |   |       orcamentoActions.ts
    |   |   |       redirecionamentos.ts
    |   |   |       saldosActions.ts
    |   |   |       selectActions.ts
    |   |   |       usarioActions.ts
    |   |   |       
    |   |   +---agendamentos
    |   |   |       page.tsx
    |   |   |       
    |   |   +---cabecalho
    |   |   |       cabecalho.tsx
    |   |   |       periodo.tsx
    |   |   |       
    |   |   +---cadastros
    |   |   |   +---fonte
    |   |   |   |   |   loading.tsx
    |   |   |   |   |   page.tsx
    |   |   |   |   |   
    |   |   |   |   \---_components
    |   |   |   |           editaFonte.tsx
    |   |   |   |           novoFonteForm.tsx
    |   |   |   |           tabelaFontes.tsx
    |   |   |   |           
    |   |   |   +---grupoDeContas
    |   |   |   |   |   page.tsx
    |   |   |   |   |   
    |   |   |   |   \---_components
    |   |   |   |           editaGrupo.tsx
    |   |   |   |           editaSubGrupo.tsx
    |   |   |   |           novoGrupoForm.tsx
    |   |   |   |           novoSubGrupo.tsx
    |   |   |   |           tabelaGrupos.tsx
    |   |   |   |           tabelaSubGrupos.tsx
    |   |   |   |           
    |   |   |   +---orcamentos
    |   |   |   |   |   page.tsx
    |   |   |   |   |   
    |   |   |   |   \---_components
    |   |   |   |           boxMesAno.tsx
    |   |   |   |           contextProvider.tsx
    |   |   |   |           OrcamentoForm.tsx
    |   |   |   |           painelControleOrcamento.tsx
    |   |   |   |           tabelaOrcamento.tsx
    |   |   |   |           
    |   |   |   +---saldos
    |   |   |   |   |   page.tsx
    |   |   |   |   |   
    |   |   |   |   \---_components
    |   |   |   |           contextSaldosProvider.tsx
    |   |   |   |           painelControleSaldo.tsx
    |   |   |   |           saldosForm.tsx
    |   |   |   |           tabelaSaldos.tsx
    |   |   |   |           
    |   |   |   \---usuarios
    |   |   |       +---cadastro
    |   |   |       |       page.tsx
    |   |   |       |       
    |   |   |       +---verificacao
    |   |   |       |       page.tsx
    |   |   |       |       
    |   |   |       \---_components
    |   |   |               novoUsuarioForm.tsx
    |   |   |               resetaSenha.tsx
    |   |   |               verificaOTP.tsx
    |   |   |               
    |   |   +---dashboard
    |   |   |   |   page.tsx
    |   |   |   |   
    |   |   |   \---_components
    |   |   |           cardConta.tsx
    |   |   |           contextDashboardProvider.tsx
    |   |   |           DashboardClient.tsx
    |   |   |           graficoBarDespesas.tsx
    |   |   |           graficoBarSubContas.tsx
    |   |   |           graficoPizzaEntradas.tsx
    |   |   |           selectContas.tsx
    |   |   |           
    |   |   +---inicio
    |   |   |       page.tsx
    |   |   |       
    |   |   +---lancamentos
    |   |   |   |   page.tsx
    |   |   |   |   
    |   |   |   \---_components
    |   |   |       |   contextLancamentoProvider.tsx
    |   |   |       |   editaLancamento.tsx
    |   |   |       |   exportarTabela.tsx
    |   |   |       |   LancamentosForm.tsx
    |   |   |       |   painelFiltros.tsx
    |   |   |       |   tabelaLancamentos.tsx
    |   |   |       |   
    |   |   |       \---querys
    |   |   |               selectFontes.tsx
    |   |   |               selectGrupos.tsx
    |   |   |               selectSubGrupos.tsx
    |   |   |               
    |   |   +---login
    |   |   |       page.tsx
    |   |   |       
    |   |   +---paginaRestrita
    |   |   |       page.tsx
    |   |   |       
    |   |   +---rodape
    |   |   |       rodape.tsx
    |   |   |       
    |   |   +---unauthorized
    |   |   |       page.tsx
    |   |   |       
    |   |   \---_components
    |   |           ActivityIcon.tsx
    |   |           ClientDrawer.tsx
    |   |           confirmationBox.tsx
    |   |           ForceLogout.tsx
    |   |           iconsForm.tsx
    |   |           iconsMenu.tsx
    |   |           loginForm.tsx
    |   |           logoutButton.tsx
    |   |           UserCircleIcon.tsx
    |   |           warningBox.tsx
    |   |           
    |   +---(public)
    |   |       layout.tsx
    |   |       page.tsx
    |   |       
    |   \---api
    |       +---login
    |       |       route.ts
    |       |       
    |       +---logout
    |       |       route.ts
    |       |       
    |       +---sendEmail
    |       |       route.ts
    |       |       
    |       +---serverRedirect
    |       |       route.ts
    |       |       
    |       \---user
    |           |   route.ts
    |           |   
    |           \---admin
    |                   route.ts
    |                   
    +---components
    |   +---providers
    |   |       auth-provider.tsx
    |   |       
    |   \---ui
    |       |   accordion.tsx
    |       |   alert-dialog.tsx
    |       |   alert.tsx
    |       |   aspect-ratio.tsx
    |       |   avatar.tsx
    |       |   badge.tsx
    |       |   breadcrumb.tsx
    |       |   button.tsx
    |       |   calendar.tsx
    |       |   card.tsx
    |       |   carousel.tsx
    |       |   checkbox.tsx
    |       |   collapsible.tsx
    |       |   command.tsx
    |       |   context-menu.tsx
    |       |   dialog.tsx
    |       |   drawer.tsx
    |       |   dropdown-menu.tsx
    |       |   form.tsx
    |       |   hover-card.tsx
    |       |   input-otp.tsx
    |       |   input.tsx
    |       |   label.tsx
    |       |   menubar.tsx
    |       |   navigation-menu.tsx
    |       |   pagination.tsx
    |       |   popover.tsx
    |       |   progress.tsx
    |       |   radio-group.tsx
    |       |   resizable.tsx
    |       |   scroll-area.tsx
    |       |   select.tsx
    |       |   separator.tsx
    |       |   sheet.tsx
    |       |   skeleton.tsx
    |       |   slider.tsx
    |       |   sonner.tsx
    |       |   switch.tsx
    |       |   table.tsx
    |       |   tabs.tsx
    |       |   textarea.tsx
    |       |   toast.tsx
    |       |   toaster.tsx
    |       |   toggle-group.tsx
    |       |   toggle.tsx
    |       |   tooltip.tsx
    |       |   use-toast.ts
    |       |   
    |       \---jp
    |           |   alerta.tsx
    |           |   labelError.tsx
    |           |   
    |           \---modal
    |                   modal-context.ts
    |                   modal-provider.tsx
    |                   modal.tsx
    |                   
    +---lib
    |       auth-client.ts
    |       auth-config.ts
    |       auth.ts
    |       db.ts
    |       decodeToken.ts
    |       estilosExcelJs.ts
    |       formatacoes.ts
    |       get-url.ts
    |       getBaseUrl.ts
    |       getToken.ts
    |       jpFuncoes.ts
    |       jwt.ts
    |       queryProvider.ts
    |       reactQuery.ts
    |       redirecionarPagina.ts
    |       retSecaoUserID.ts
    |       utils.ts
    |       
    +---middleware
    |       logger.js
    |       
    \---types
            environment.d.ts
            next-auth.d.ts
            types.ts
```
