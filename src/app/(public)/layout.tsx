export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return <>
      <html lang="pt-BR" className="light" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" type="image/x-icon" href="saldo.png"></link>
        </head>
        <body className={`flex flex-col h-screen`}>
          <div>
            {children}
          </div>
        </body>
      </html>
    </>;
  }
  