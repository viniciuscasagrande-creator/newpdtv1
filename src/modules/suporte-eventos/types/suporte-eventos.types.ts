// ==============================================================================
// FASE 1.2.4 — NOVO MÓDULO SUPORTE EVENTOS (CENTRAL DE OPERAÇÕES DE EVENTOS)
// Definições de Tipos do Domínio de Suporte, Operações, Incidentes e Infraestrutura
// ==============================================================================

/** Prioridades operacionais de chamados e incidentes */
export type PrioridadeSuporte = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'

/** Categorias operacionais detalhadas para classificação precisa */
export type CategoriaChamado =
  | 'Evento'
  | 'Ingressos'
  | 'Configuração'
  | 'Publicação'
  | 'Lotes'
  | 'Preços'
  | 'Bilheteria'
  | 'PDV'
  | 'Check-in'
  | 'Leitores'
  | 'Impressoras'
  | 'Pagamento'
  | 'Gateway'
  | 'Integração'
  | 'Marketing'
  | 'Financeiro'
  | 'Relatório'
  | 'Usuário/Acesso'
  | 'API'
  | 'Instabilidade'
  | 'Outros'

/** Estados do ciclo de vida do chamado de suporte operacional */
export type StatusChamado =
  | 'NOVO'
  | 'NAO_ATRIBUIDO'
  | 'EM_ATENDIMENTO'
  | 'AGUARDANDO_PRODUTOR'
  | 'AGUARDANDO_TERCEIROS'
  | 'RESOLVIDO'
  | 'ENCERRADO'

/** Tipos de eventos registrados na linha do tempo auditável de um chamado */
export type TipoEventoTimeline =
  | 'CRIACAO'
  | 'CLASSIFICACAO'
  | 'ATRIBUICAO'
  | 'INICIO_ATENDIMENTO'
  | 'DIAGNOSTICO'
  | 'VINCULO_INCIDENTE'
  | 'SOLUCAO_TEMPORARIA'
  | 'NORMALIZACAO'
  | 'ENCERRAMENTO'
  | 'COMENTARIO'

/** Registro individual de auditoria na timeline do chamado */
export interface EventoTimelineChamado {
  id: string
  dataHora: string
  horario: string
  titulo: string
  descricao?: string
  autorNome: string
  autorPapel: 'PRODUTOR' | 'TECNICO' | 'COORDENADOR' | 'SISTEMA'
  tipo: TipoEventoTimeline
  metadados?: Record<string, unknown>
}

/** Estrutura do Chamado de Suporte a Eventos (SUP-2026-xxxx) */
export interface ChamadoSuporte {
  id: string
  protocolo: string // Ex: SUP-2026-008421
  eventoId: string
  eventoCodigo: string // Ex: EVT-10592
  eventoNome: string
  produtorId: number
  produtorNome: string
  contatoProdutor: string
  telefoneContato?: string
  emailContato?: string
  categoria: CategoriaChamado
  prioridade: PrioridadeSuporte
  status: StatusChamado
  assunto: string
  descricao: string
  responsavelEquipe: string // Ex: 'Equipe Operações', 'Infraestrutura'
  responsavelNome?: string // Ex: 'Carlos Silva'
  incidenteRelacionadoId?: string // Ex: INC-2026-184
  criadoEm: string
  atualizadoEm: string
  sla: {
    prazoRespostaEm: string
    respostaRealizada: boolean
    prazoResolucaoEm: string
    minutosRestantes: number
    violado: boolean
    porcentagemConsumida: number // 0 a 100
  }
  timeline: EventoTimelineChamado[]
}

// -----------------------------------------------------------------------------
// EVENTOS EM OPERAÇÃO E PRONTIDÃO (READINESS)
// -----------------------------------------------------------------------------

export type StatusOperacaoEvento = 'PREPARACAO' | 'OPERANDO' | 'ATENCAO' | 'CRITICO' | 'ENCERRADO'
export type StatusSubsistema = 'ONLINE' | 'ATENCAO' | 'OFFLINE'

/** Evento ativo no radar de suporte operacional */
export interface EventoOperacao {
  id: string
  codigo: string // Ex: EVT-10592
  nome: string
  local: string
  cidade: string
  data: string
  horarioInicio: string
  horarioFim: string
  statusOperacao: StatusOperacaoEvento
  prontidaoScore: number // 0 a 100%
  publicoTotal: number
  ingressosVendidos: number
  checkinsRealizados: number
  publicoDentroEstimado: number
  taxaEntradaPorMinuto: number
  subsistemas: {
    checkin: StatusSubsistema
    bilheteria: StatusSubsistema
    pdv: StatusSubsistema
    gateways: StatusSubsistema
    conectividade: StatusSubsistema
  }
  chamadosAtivos: number
  incidentesAtivos: number
  alertasAtivos: number
}

/** Itens de verificação da Prontidão Operacional antes do evento */
export interface ItemProntidaoEvento {
  id: string
  eventoId: string
  chave: string
  titulo: string
  categoria: 'CONFIGURACAO' | 'COMERCIAL' | 'EQUIPAMENTOS' | 'CONECTIVIDADE' | 'EQUIPE'
  status: 'CONCLUIDO' | 'ATENCAO' | 'PENDENTE' | 'FALHA'
  obrigatorio: boolean
  detalhe?: string
  rotaAcao?: string
}

// -----------------------------------------------------------------------------
// OPERAÇÃO TÉCNICA: PORTÕES, CHECK-IN E EQUIPAMENTOS
// -----------------------------------------------------------------------------

export interface MonitorPortaoCheckin {
  id: string
  eventoId: string
  numero: string // '01', '02', '03'
  nome: string // 'Portão 01 - Principal'
  checkins: number
  taxaSucesso: number // Ex: 98%
  status: 'OPERANDO' | 'ATENCAO' | 'CRITICO'
  leitoresTotal: number
  leitoresOnline: number
  vazaoPorMinuto: number
}

export type TipoEquipamento = 'LEITOR' | 'PDV' | 'IMPRESSORA' | 'TERMINAL' | 'ROTEADOR'

export interface EquipamentoOperacional {
  id: string
  codigo: string // Ex: 'CHK-0042'
  tipo: TipoEquipamento
  eventoId: string
  eventoNome: string
  portaoOuLocal: string // Ex: 'Portão 04'
  status: 'ONLINE' | 'ATENCAO' | 'OFFLINE'
  ultimoSinal: string
  nivelBateria?: number // Ex: 68
  versaoApp: string // Ex: 'v4.8.2'
  ultimaSincronizacao: string
  ipRede?: string
  modelo?: string
}

// -----------------------------------------------------------------------------
// INCIDENTES E GESTÃO DE PROBLEMAS (ITIL OPERACIONAL)
// -----------------------------------------------------------------------------

export type SeveridadeIncidente = 'CRITICO' | 'GRAVE' | 'MODERADO' | 'RECORRENTE'
export type StatusIncidente = 'DETECTADO' | 'INVESTIGACAO' | 'CONTINGENCIA' | 'ESTABILIZADO' | 'RESOLVIDO'

export interface IncidenteOperacional {
  id: string
  protocolo: string // Ex: INC-2026-184
  titulo: string
  descricao: string
  servicoAfetado: string // Ex: 'Ticket Validation API', 'Gateway PIX'
  severidade: SeveridadeIncidente
  status: StatusIncidente
  iniciadoEm: string
  resolvidoEm?: string
  eventosImpactadosIds: string[]
  eventosImpactadosTotal: number
  portoesImpactadosTotal: number
  leitoresImpactadosTotal: number
  chamadosRelacionadosTotal: number
  timeline: {
    id: string
    horario: string
    descricao: string
    responsavel: string
  }[]
}

export type StatusProblema = 'INVESTIGACAO' | 'CAUSA_RAIZ' | 'SOLUCAO_TEMPORARIA' | 'CORRECAO_DEFINITIVA'

export interface ProblemaConhecido {
  id: string
  protocolo: string // Ex: PRB-2026-041
  titulo: string
  descricao: string
  incidentesRelacionadosIds: string[]
  incidentesContagem: number
  status: StatusProblema
  causaRaiz?: string
  solucaoTemporaria?: string
  correcaoDefinitiva?: string
  atualizadoEm: string
}

// -----------------------------------------------------------------------------
// POLÍTICAS DE SLA E AUDITORIA
// -----------------------------------------------------------------------------

export interface PoliticaSlaPrioridade {
  prioridade: PrioridadeSuporte
  tempoPrimeiraRespostaMinutos: number
  tempoResolucaoMinutos: number
  rotuloResposta: string
  rotuloResolucao: string
}

export interface RegistroAuditoriaOperacional {
  id: string
  protocolo: string // AUD-984522
  dataHora: string
  usuarioNome: string
  usuarioPapel: string
  acao: string
  entidadeTipo: 'CHAMADO' | 'INCIDENTE' | 'PROBLEMA' | 'EQUIPAMENTO' | 'SLA'
  entidadeId: string
  valorAnterior?: string
  valorNovo?: string
  motivo?: string
}

// -----------------------------------------------------------------------------
// RESUMO DE INDICADORES DO DASHBOARD OPERACIONAL
// -----------------------------------------------------------------------------

export interface DashboardOperacionalResumo {
  eventosAoVivo: number
  chamadosAbertos: number
  incidentesCriticos: number
  slaDentroPercent: number
  checkinTotal: number
  pdvsOffline: number
  alertasAtivos: number
  pendenciasTotais: number
}
