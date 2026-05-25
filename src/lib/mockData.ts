import { UserRole } from "../context/AuthContext";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'blocked';
  lastSeen: string;
  password?: string;
  avatar?: string;
}

export interface Professional {
  id: string;
  name: string;
  role: 'Advogado' | 'Assistente' | 'Estagiário';
  license: string;
  email: string;
  phone: string;
}

export interface Client {
  id: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
  legalObservations?: string;
}

export interface LegalService {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  value: string;
  status: 'draft' | 'pending' | 'active' | 'completed';
  date: string;
  content?: string;
}

export interface ContractModel {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  content: string; // Template text with placeholders like {{CLIENT_NAME}}
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  lawyer: string;
  status: 'active' | 'archived' | 'pending' | 'suspended' | 'judgment' | 'completed';
  priority: 'low' | 'medium' | 'high';
  lastUpdate: string;
  pageCount?: number;
  startDate?: string;
  trialDate?: string;
  decisionDate?: string;
  court?: string;
  description?: string;
  documents?: Array<{
    id: string;
    name: string;
    uploadedAt: string;
    uploadedBy: string;
    fileSize: string;
    fileType: string;
  }>;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  displayAmount: string;
  type: 'revenue' | 'expense';
  category: string;
  date: string;
  lawyerName?: string;
  clientId?: string;
  caseId?: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  type: 'reunião' | 'audiência' | 'tarefa';
  date: string;
  time: string;
  location: string;
  client: string;
  status: 'pending' | 'completed' | 'cancelled';
  description?: string;
  lawyerName?: string;
}

// Initial Data
export interface LegalAlert {
  id: string;
  lawyerName: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'unread' | 'read';
  createdAt: string;
  senderName: string;
}

// Initial Data
export const INITIAL_ALERTS: LegalAlert[] = [
  { 
    id: '1', 
    lawyerName: 'António Bunga', 
    message: 'Cliente João Silva aguarda na recepção para o processo #0054.', 
    urgency: 'high', 
    status: 'unread', 
    createdAt: new Date().toISOString(),
    senderName: 'Rosa Silva'
  }
];

export const INITIAL_USERS: MockUser[] = [
  { id: '1', name: 'António Bunga', email: 'antonio.bunga@bungatuko.ao', role: 'admin', status: 'active', lastSeen: 'Agora mesmo', password: '123' },
  { id: '2', name: 'Maria Tuko', email: 'maria.tuko@bungatuko.ao', role: 'lawyer', status: 'active', lastSeen: 'Há 20 min', password: '123' },
  { id: '3', name: 'Rosa Silva', email: 'rosa@bungatuko.ao', role: 'assistant', status: 'active', lastSeen: 'Agora mesmo', password: '123' },
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  { id: '1', name: 'António Bunga', role: 'Advogado', license: 'OAA/1234', email: 'antonio.bunga@bungatuko.ao', phone: '+244 923 000 000' },
  { id: '2', name: 'Maria Tuko', role: 'Advogado', license: 'OAA/5678', email: 'maria.tuko@bungatuko.ao', phone: '+244 923 111 111' },
];

export const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'João Silva Domingos', nif: '102938475', email: 'joao.silva@email.com', phone: '923 456 789', address: 'Maianga, Luanda', status: 'active', createdAt: '2024-05-10' },
  { id: '2', name: 'Maria Isabel Antunes', nif: '987654321', email: 'maria.antunes@email.com', phone: '924 123 456', address: 'Talatona, Luanda', status: 'active', createdAt: '2024-05-15' },
];

export const INITIAL_SERVICES: LegalService[] = [
  { id: '1', name: 'Consultoria Jurídica', category: 'Geral', price: '25.000 Kz', description: 'Atendimento inicial para análise de caso.' },
  { id: '2', name: 'Defesa Criminal', category: 'Criminal', price: 'Varia', description: 'Acompanhamento processual criminal completo.' },
];

export const INITIAL_CONTRACTS: Contract[] = [
  { id: 'C-2024-001', clientId: '1', clientName: 'João Silva Domingos', service: 'Defesa Criminal', value: '500.000 Kz', status: 'active', date: '12/05/2024' },
];

export const INITIAL_MODELS: ContractModel[] = [
  { 
    id: '1', 
    title: 'Contrato de Prestação de Serviços Jurídicos - Geral', 
    category: 'Civil', 
    lastUpdated: '10/05/2024',
    content: 'Pelo presente instrumento particular de contrato de prestação de serviços jurídicos, de um lado {{CLIENT_NAME}}, portador do NIF {{CLIENT_NIF}}, residente em {{CLIENT_ADDRESS}}, doravante denominado CONTRATANTE...'
  },
  { 
    id: '2', 
    title: 'Procuração Ad Judicia', 
    category: 'Judicial', 
    lastUpdated: '12/05/2024',
    content: 'OUTORGANTE: {{CLIENT_NAME}}, NIF {{CLIENT_NIF}}, com sede/residência em {{CLIENT_ADDRESS}}...'
  },
];

export const INITIAL_CASES: Case[] = [
  { 
    id: '1', 
    caseNumber: '0054/24.1', 
    title: 'Recurso de Apelação Cível', 
    clientId: '1', 
    clientName: 'João Silva Domingos', 
    lawyer: 'António Bunga', 
    status: 'active', 
    priority: 'high', 
    lastUpdate: 'Há 2 horas',
    documents: [
      { id: 'doc1', name: 'Peticao_Inicial_Assinada.pdf', uploadedAt: '2026-05-12', uploadedBy: 'António Bunga', fileSize: '1.4 MB', fileType: 'application/pdf' },
      { id: 'doc2', name: 'Doc_Identificacao_Cliente.pdf', uploadedAt: '2026-05-13', uploadedBy: 'Rosa Silva', fileSize: '450 KB', fileType: 'application/pdf' }
    ]
  },
  { id: '2', caseNumber: '0089/24.3', title: 'Ação de Divórcio Litigioso', clientId: '2', clientName: 'Maria Isabel Antunes', lawyer: 'Maria Tuko', status: 'active', priority: 'medium', lastUpdate: 'Há 5 horas', documents: [] },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Honorários Processo 0054/24', amount: 250000, displayAmount: '250.000 Kz', type: 'revenue', category: 'Honorários', date: '2024-05-10', lawyerName: 'António Bunga' },
  { id: '2', description: 'Renda do Escritório - Maio', amount: 150000, displayAmount: '150.000 Kz', type: 'expense', category: 'Infraestrutura', date: '2024-05-05' },
  { id: '3', description: 'Papelaria e Consumíveis', amount: 15000, displayAmount: '15.000 Kz', type: 'expense', category: 'Administrativo', date: '2024-05-12' },
  { id: '4', description: 'Consultoria Dr. João', amount: 50000, displayAmount: '50.000 Kz', type: 'revenue', category: 'Consultoria', date: '2024-05-15', lawyerName: 'Maria Tuko' },
];

export const INITIAL_AGENDA: AgendaItem[] = [
  { id: '1', title: 'Audiência de Julgamento', type: 'audiência', date: '2024-05-20', time: '09:00', location: 'Tribunal da Comarca de Luanda', client: 'João Silva Domingos', status: 'pending', lawyerName: 'António Bunga' },
  { id: '2', title: 'Reunião de Alinhamento', type: 'reunião', date: '2024-05-18', time: '14:30', location: 'Escritório Central', client: 'Maria Isabel Antunes', status: 'pending', lawyerName: 'Maria Tuko' },
  { id: '3', title: 'Análise de Provas', type: 'tarefa', date: '2024-05-19', time: '10:00', location: 'Escritório', client: 'João Silva Domingos', status: 'pending', lawyerName: 'António Bunga' },
];
