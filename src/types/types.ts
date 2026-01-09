export type tyUsuario = {
  key:           number,
  id:            number,
  email:         string,
  nome:          string,
  senha:         string,
  perfil:        string,
  login:         string,
  token?:        string,
  dtToken?:      Date,
  confirmaSenha: string,
};

export type tyGrupo = {
  key?:       number,
  id?:        number,
  nome:       string,
  descricao?: string,
  tipo?:      tipoGrupo,
  ativo:      boolean,
  userId?:    number,
}

export type tyGrupoSubGrupo = {
  nome: string
  descricao?: string
  tipo?: "C" | "D" | "M"
  ativo?: boolean
  subGrupos?: { nome: string; descricao?: string }[]
}

export type tyFonte = {
  id?:        number;
  nome:       string;
  descricao?: string;
  tipo:       tipoFonte;
  ativo:      boolean;
  userId?:    number,
}

export type tySubGrupo = {
  key?:       number,
  id?:        number,
  nome:       string,
  descricao?: string,
  ativo?:     boolean,
  grupoId?:   number,
  acao?:      string,
}

export type tyGrupoLista = {
  id?:            number,
  nome?:          string,
  descricao?:     string,
  tipo?:          tipoGrupo, 
  tipoDesc?:      string, 
  ativo?:         boolean,
  userId?:        number,
  qtdSubGrupos?:  number,
}

export type tySelects = {
  id?:            number,
  nome?:          string,
}

export type tyErro = {
  name?:          string, 
  code?:          string,
  clientVersion?: string, 
  meta?: {
    modelName?: string, 
    target?:    string
  } 
}

export type tyResult = {
  status?:    string,
  menssagem?: string,
  dados?: {},
}
export type tyOrcamento = {
  orcamentoId?: number,
  valor?:       number,
  nomeGrupo?:   string,
  tipoGrupo?:   string,
  grupoId?:     number,
  periodoId?:   number,
}

export type tySaldo = {
  saldoId?:    number,
  valor?:     number,    
  nomeFonte?: string,
  tipoFonte?: string,
  fonteId?:   number,
  periodoId?: number,      
};


export enum tipoGrupo{
  Debito = "D",
  Credito = "C",
  Movimento = "M",
}

export enum tipoFonte{
  Aplicacao = "A",
  Credito = "C",
  Movimentacao = "M",
}

export type tyLancamento = {
  lancamentoId?: number,
  periodoId?: number,
  periodo?: string,
  valor?: number,
  //dtLancamento?: Date,
  dtLancamento?: string;
  descricao?: string,
  operacao?: string, // Pode ser D-Debito C-Crédito ou M-Movimento
  grupoId?: number,
  grupo?: string,
  subGrupoId?: number,
  subGrupo?: string,
  fonteId?: number,
  fonteIdD: number | null,
  fontes?: string,
}

export type tySaldos = {
  fonteId: number,
  fonteNome: string,
  periodoId: number,
  userId: number,
  totFonte: number
}

export type tyDespesaGrafico = {
  GrupoID: number;
  Grupo: string;
  valorOrcado: number;
  valorReal: number;
}

export type tyEntradasGrafico = {
  SubGrupoID: number;
  SubGrupo: string;
  valorReal: number;
}

export type tySubGruposGrafico = {
  SubGrupoID: number;
  SubGrupo: string;
  valorReal: number;
}

export type tySomatoriasPeriodo = {
  FonteId: number;
  Fonte: string;
  Tipo: string;
  saldoId: number;
  valorInicial: number;
  valorPeriodo: number;
  saldoAtual: number;
}

export type tyVerificacao= {
  id:               number,
  login:            string,
  email:            string,
  nome:             string,
  minutos_passados: number,
  codigo?:          string,
}

