// Storage em memória para MVP — sem dependência de AsyncStorage

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'tecnico' | 'engenharia' | 'admin';
}

export type TipoNota = 'Combustível' | 'Hospedagem' | 'Alimentação' | 'Pedágio' | 'Outros';

export interface NotaReembolso {
  id: string;
  tipo: TipoNota;
  valor: string;
  descricao: string;
  fotoUri: string;
  fotoBase64: string;   // base64 para uso no PDF
  extraviada: boolean;
  dataHora: string;
}

export interface RelatorioReembolso {
  id: string;
  tecnico: string;
  clientes: string;
  acompanhantes: string;
  periodo: string;
  observacoes: string;
  notas: NotaReembolso[];
  dataCriacao: string;
  gerado: boolean;
  usuarioId: string;
}

export type MotivoVisita =
  | 'Assistência Técnica'
  | 'Manutenção'
  | 'Instalação'
  | 'Demonstração'
  | 'Treinamento';

export interface DiaHoras {
  id: string;
  data: string;
  horaInicioDeslocamento: string;
  horaFimDeslocamento: string;
  horaInicioAtendimento: string;
  horaFimAtendimento: string;
}

export interface PecaOS {
  id: string;
  descricao: string;
  codigo: string;
  quantidade: string;
  valorUnitario: string;
}

export interface OrdemServico {
  id: string;
  numeroOS: string;
  dataAbertura: string;
  cidade: string;
  cliente: string;
  contato: string;
  chassi: string;
  modelo: string;
  emGarantia: boolean;
  fimGarantia: string;
  motivoVisita: MotivoVisita;
  kmRodados: string;
  diasHoras: DiaHoras[];
  descricaoServico: string;
  fotosAtendimento: { id: string; uri: string; base64: string }[];
  pecas: PecaOS[];
  assinaturaTecnico: string;
  assinaturaCliente: string;
  dataAssinatura: string;
  tecnico: string;
  usuarioId: string;
  gerada: boolean;
}

// ─── Estado em memória ────────────────────────────────────────────────────────

let usuarioAtual: Usuario | null = null;
let relatorios: RelatorioReembolso[] = [];
let ordens: OrdemServico[] = [];

// ─── Auth ─────────────────────────────────────────────────────────────────────

const USUARIOS: Usuario[] = [
  { id: '1', nome: 'Administrador', email: 'admin', perfil: 'admin' },
];

const SENHAS: Record<string, string> = {
  'admin': 'admin',
};

export function login(email: string, senha: string): Usuario | null {
  const senhaCorreta = SENHAS[email.toLowerCase()];
  if (senhaCorreta && senhaCorreta === senha) {
    const usuario = USUARIOS.find(u => u.email === email.toLowerCase());
    if (usuario) { usuarioAtual = usuario; return usuario; }
  }
  return null;
}

export function getUsuarioLogado(): Usuario | null {
  return usuarioAtual;
}

export function logout(): void {
  usuarioAtual = null;
}

// ─── Reembolso ────────────────────────────────────────────────────────────────

export function salvarRelatorio(relatorio: RelatorioReembolso): void {
  const idx = relatorios.findIndex(r => r.id === relatorio.id);
  if (idx >= 0) relatorios[idx] = relatorio;
  else relatorios.push(relatorio);
}

export function getRelatorios(usuarioId: string): RelatorioReembolso[] {
  return [...relatorios].filter(r => r.usuarioId === usuarioId).reverse();
}

export function getRelatorioById(id: string): RelatorioReembolso | null {
  return relatorios.find(r => r.id === id) || null;
}

// ─── OS ───────────────────────────────────────────────────────────────────────

export function salvarOS(os: OrdemServico): void {
  const idx = ordens.findIndex(o => o.id === os.id);
  if (idx >= 0) ordens[idx] = os;
  else ordens.push(os);
}

export function getOrdens(usuarioId: string): OrdemServico[] {
  return [...ordens].filter(o => o.usuarioId === usuarioId).reverse();
}

export function getOSById(id: string): OrdemServico | null {
  return ordens.find(o => o.id === id) || null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function gerarId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

export function gerarNumeroOS(): string {
  return Math.floor(30000 + Math.random() * 10000).toString();
}

export function calcularTotalPecas(pecas: PecaOS[]): number {
  return pecas.reduce((acc, p) => {
    const qty = parseFloat(p.quantidade.replace(',', '.')) || 0;
    const vl = parseFloat(p.valorUnitario.replace(',', '.')) || 0;
    return acc + qty * vl;
  }, 0);
}

export function calcularTotalNotas(notas: NotaReembolso[]): number {
  return notas.reduce((acc, n) => acc + (parseFloat(n.valor.replace(',', '.')) || 0), 0);
}
