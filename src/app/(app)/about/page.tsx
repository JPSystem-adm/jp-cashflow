// src/app/(app)/about/page.tsx

import packageJson from "../../../../package.json";
import { getFusoLocal } from "@/lib/formatacoes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { FaReact, FaNodeJs, FaDatabase } from "react-icons/fa";
import { SiTypescript, SiTailwindcss, SiPrisma, SiMysql } from "react-icons/si";

type StackItem = {
  key: string;
  name: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
};

function retDataAtualISO(): string {
  return new Date().toISOString();
}

export default async function About() {
  const dadosGeoolocalizacao = getFusoLocal();

  const stack: StackItem[] = [
    {
      key: "react",
      name: "React",
      desc: "UI moderna e componentizada",
      Icon: FaReact,
      iconClass: "text-sky-600",
    },
    {
      key: "ts",
      name: "TypeScript",
      desc: "Tipagem forte e segurança",
      Icon: SiTypescript,
      iconClass: "text-blue-700",
    },
    {
      key: "tailwind",
      name: "Tailwind",
      desc: "Estilização responsiva e produtiva",
      Icon: SiTailwindcss,
      iconClass: "text-cyan-600",
    },
    {
      key: "node",
      name: "Node.js",
      desc: "Base do runtime",
      Icon: FaNodeJs,
      iconClass: "text-green-700",
    },
    {
      key: "prisma",
      name: "Prisma",
      desc: "ORM e produtividade",
      Icon: SiPrisma,
      iconClass: "text-fuchsia-700",
    },
    {
      key: "mysql",
      name: "MySQL",
      desc: "Persistência de dados",
      Icon: SiMysql,
      iconClass: "text-orange-700",
    },
    {
      key: "db",
      name: "Banco de Dados",
      desc: "Modelagem e integridade",
      Icon: FaDatabase,
      iconClass: "text-slate-700",
    },
  ];

  return (
    <div className="w-full flex justify-center">
      <main className="w-full max-w-6xl px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Hero */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-sky-900">
                Sobre o JP Cash Flow
              </h1>
              <p className="text-slate-600 sm:text-lg">
                Sistema de controle financeiro desenvolvido para oferecer clareza,
                organização e segurança na gestão das suas finanças.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge className="bg-sky-50 text-sky-900 border border-sky-200">
                  {packageJson.name}
                </Badge>
                <Badge className="bg-amber-50 text-amber-900 border border-amber-200">
                  v{packageJson.version}
                </Badge>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-xs text-slate-500">Data/Hora (ISO)</div>
              <div className="font-mono text-xs sm:text-sm text-slate-700 break-all">
                {retDataAtualISO()}
              </div>
            </div>
          </div>
        </section>

        <div className="h-6" />

        {/* Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stack */}
          <Card className="lg:col-span-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-sky-900">
                Stack e Tecnologias Utilizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stack.map(({ key, name, desc, Icon, iconClass }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition"
                  >
                    <div className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                      <Icon className={`h-6 w-6 ${iconClass}`} />
                    </div>

                    <div>
                      <div className="font-semibold text-slate-900">{name}</div>
                      <div className="text-sm text-slate-600">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                <div className="font-semibold text-sky-900">
                  Sobre o Produto
                </div>
                <p className="text-sky-900/90 text-sm sm:text-base mt-1">
                  O JP Cash Flow é um produto desenvolvido com foco em
                  simplicidade operacional, segurança de dados e arquitetura moderna,
                  utilizando boas práticas de desenvolvimento web.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Institucional */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-sky-900">
                Desenvolvido por
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="font-semibold text-slate-900">
                  JPSystem Ltda
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Empresa especializada em desenvolvimento de sistemas web,
                  soluções SaaS e arquitetura moderna em nuvem.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Website</div>
                <a
                  href="https://www.jpsystem.com.br"
                  target="_blank"
                  className="font-semibold text-sky-700 hover:underline break-words"
                >
                  www.jpsystem.com.br
                </a>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Contato</div>
                <a
                  href="mailto:jpsystem@gmail.com"
                  className="font-semibold text-sky-700 hover:underline break-words"
                >
                  jpsystem@gmail.com
                </a>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Time Zone</div>
                <div className="font-semibold text-slate-900">
                  {dadosGeoolocalizacao.timeZone}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">
                  Diferença de Horas
                </div>
                <div className="font-semibold text-slate-900">
                  {dadosGeoolocalizacao.diferencaEmHoras}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="h-6" />

        <footer className="text-center text-xs sm:text-sm text-slate-500">
          JP Cash Flow — Produto oficial da JPSystem Ltda
        </footer>
      </main>
    </div>
  );
}
