import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  MockUser, 
  Client, 
  Professional, 
  LegalService, 
  Contract, 
  ContractModel,
  Case, 
  Transaction,
  AgendaItem,
  LegalAlert,
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_PROFESSIONALS,
  INITIAL_SERVICES,
  INITIAL_CONTRACTS,
  INITIAL_MODELS,
  INITIAL_CASES,
  INITIAL_TRANSACTIONS,
  INITIAL_AGENDA,
  INITIAL_ALERTS
} from '../lib/mockData';

interface DataContextType {
  users: MockUser[];
  clients: Client[];
  professionals: Professional[];
  services: LegalService[];
  contracts: Contract[];
  contractModels: ContractModel[];
  cases: Case[];
  transactions: Transaction[];
  agenda: AgendaItem[];
  alerts: LegalAlert[];
  
  // Create
  addUser: (user: Omit<MockUser, 'id' | 'lastSeen'>) => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  addProfessional: (prof: Omit<Professional, 'id'>) => void;
  addService: (service: Omit<LegalService, 'id'>) => void;
  addContract: (contract: Omit<Contract, 'id'>) => void;
  addContractModel: (model: Omit<ContractModel, 'id'>) => void;
  addCase: (item: Omit<Case, 'id'>) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  addAgenda: (item: Omit<AgendaItem, 'id'>) => void;
  addAlert: (alert: Omit<LegalAlert, 'id' | 'createdAt' | 'status'>) => void;

  // Update
  updateUser: (id: string, data: Partial<MockUser>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  updateProfessional: (id: string, data: Partial<Professional>) => void;
  updateContract: (id: string, data: Partial<Contract>) => void;
  updateContractModel: (id: string, data: Partial<ContractModel>) => void;
  updateCase: (id: string, data: Partial<Case>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  updateAgenda: (id: string, data: Partial<AgendaItem>) => void;
  updateAlert: (id: string, data: Partial<LegalAlert>) => void;

  // Delete
  deleteUser: (id: string) => void;
  deleteClient: (id: string) => void;
  deleteProfessional: (id: string) => void;
  deleteService: (id: string) => void;
  deleteContract: (id: string) => void;
  deleteContractModel: (id: string) => void;
  deleteCase: (id: string) => void;
  deleteTransaction: (id: string) => void;
  deleteAgenda: (id: string) => void;
  deleteAlert: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<MockUser[]>(() => {
    const saved = localStorage.getItem('bt_users');
    if (saved) {
      const parsed = JSON.parse(saved) as MockUser[];
      // Migrate: ensure passwords exist for old data
      return parsed.map(user => ({
        ...user,
        password: user.password || '123'
      }));
    }
    return INITIAL_USERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('bt_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem('bt_professionals');
    return saved ? JSON.parse(saved) : INITIAL_PROFESSIONALS;
  });

  const [services, setServices] = useState<LegalService[]>(() => {
    const saved = localStorage.getItem('bt_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem('bt_contracts');
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });

  const [contractModels, setContractModels] = useState<ContractModel[]>(() => {
    const saved = localStorage.getItem('bt_contract_models');
    return saved ? JSON.parse(saved) : INITIAL_MODELS;
  });

  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('bt_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bt_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [agenda, setAgenda] = useState<AgendaItem[]>(() => {
    const saved = localStorage.getItem('bt_agenda');
    return saved ? JSON.parse(saved) : INITIAL_AGENDA;
  });

  const [alerts, setAlerts] = useState<LegalAlert[]>(() => {
    const saved = localStorage.getItem('bt_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  useEffect(() => {
    localStorage.setItem('bt_users', JSON.stringify(users));
    localStorage.setItem('bt_clients', JSON.stringify(clients));
    localStorage.setItem('bt_professionals', JSON.stringify(professionals));
    localStorage.setItem('bt_services', JSON.stringify(services));
    localStorage.setItem('bt_contracts', JSON.stringify(contracts));
    localStorage.setItem('bt_contract_models', JSON.stringify(contractModels));
    localStorage.setItem('bt_cases', JSON.stringify(cases));
    localStorage.setItem('bt_transactions', JSON.stringify(transactions));
    localStorage.setItem('bt_agenda', JSON.stringify(agenda));
    localStorage.setItem('bt_alerts', JSON.stringify(alerts));
  }, [users, clients, professionals, services, contracts, contractModels, cases, transactions, agenda, alerts]);

  // Generic helpers
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addUser = (data: Omit<MockUser, 'id' | 'lastSeen'>) => {
    setUsers([...users, { ...data, id: generateId(), lastSeen: 'Agora mesmo' }]);
  };

  const addClient = (data: Omit<Client, 'id'>) => {
    setClients([...clients, { 
      ...data, 
      id: generateId(), 
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
      status: data.status || 'active'
    } as Client]);
  };

  const addProfessional = (data: Omit<Professional, 'id'>) => {
    setProfessionals([...professionals, { ...data, id: generateId() }]);
  };

  const addService = (data: Omit<LegalService, 'id'>) => {
    setServices([...services, { ...data, id: generateId() }]);
  };

  const addContract = (data: Omit<Contract, 'id'>) => {
    const id = `C-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setContracts([...contracts, { ...data, id }]);
  };

  const addContractModel = (data: Omit<ContractModel, 'id'>) => {
    setContractModels([...contractModels, { ...data, id: generateId() }]);
  };

  const addCase = (data: Omit<Case, 'id'>) => {
    setCases([...cases, { ...data, id: generateId() }]);
  };

  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    setTransactions([...transactions, { ...data, id: generateId() }]);
  };

  const addAgenda = (data: Omit<AgendaItem, 'id'>) => {
    setAgenda([...agenda, { ...data, id: generateId() }]);
  };

  const addAlert = (data: Omit<LegalAlert, 'id' | 'createdAt' | 'status'>) => {
    setAlerts([...alerts, { ...data, id: generateId(), createdAt: new Date().toISOString(), status: 'unread' }]);
  };

  const updateUser = (id: string, data: Partial<MockUser>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const updateProfessional = (id: string, data: Partial<Professional>) => {
    setProfessionals(professionals.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const updateContract = (id: string, data: Partial<Contract>) => {
    setContracts(contracts.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const updateContractModel = (id: string, data: Partial<ContractModel>) => {
    setContractModels(contractModels.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const updateCase = (id: string, data: Partial<Case>) => {
    setCases(cases.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const updateAgenda = (id: string, data: Partial<AgendaItem>) => {
    setAgenda(agenda.map(item => item.id === id ? { ...item, ...data } : item));
  };

  const updateAlert = (id: string, data: Partial<LegalAlert>) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteUser = (id: string) => setUsers(users.filter(u => u.id !== id));
  const deleteClient = (id: string) => setClients(clients.filter(c => c.id !== id));
  const deleteProfessional = (id: string) => setProfessionals(professionals.filter(p => p.id !== id));
  const deleteService = (id: string) => setServices(services.filter(s => s.id !== id));
  const deleteContract = (id: string) => setContracts(contracts.filter(c => c.id !== id));
  const deleteContractModel = (id: string) => setContractModels(contractModels.filter(m => m.id !== id));
  const deleteCase = (id: string) => setCases(cases.filter(c => c.id !== id));
  const deleteTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));
  const deleteAgenda = (id: string) => setAgenda(agenda.filter(item => item.id !== id));
  const deleteAlert = (id: string) => setAlerts(alerts.filter(a => a.id !== id));

  return (
    <DataContext.Provider value={{ 
      users, clients, professionals, services, contracts, contractModels, cases, transactions, agenda, alerts,
      addUser, addClient, addProfessional, addService, addContract, addContractModel, addCase, addTransaction, addAgenda, addAlert,
      updateUser, updateClient, updateProfessional, updateContract, updateContractModel, updateCase, updateTransaction, updateAgenda, updateAlert,
      deleteUser, deleteClient, deleteProfessional, deleteService, deleteContract, deleteContractModel, deleteCase, deleteTransaction, deleteAgenda, deleteAlert
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
