export interface Company {
  id: string;
  name: string;
  industry: string;
  marketValue: number;
  revenue: number;
  profit: number;
  employees: number;
  foundedYear: number;
  rating: number;
  brandValue: number;
  marketShare: number;
  isListed?: boolean;
  stockCode?: string;
  stockPrice?: number;
  stockExchange?: string;
  creditRating?: string;
  creditScore?: number;
  loanParameter?: number;
  performanceIndex?: number;
  marketExpectationIndex?: number;
  shareholdings?: Shareholding[];
}

export interface PersonalAsset {
  id: string;
  name: string;
  type: 'real_estate' | 'vehicle' | 'investment' | 'savings' | 'other';
  value: number;
  description?: string;
  acquisitionDate?: string;
}

export interface StockHolding {
  id: string;
  stockId: string;
  stockCode: string;
  companyName: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
  purchaseDate: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  title: string;
  personalCash: number;
  totalAssets: number;
  netWorth: number;
  personalAssets: PersonalAsset[];
  stockHoldings: StockHolding[];
}

export interface Shareholding {
  id: string;
  name: string;
  type: 'founder' | 'institution' | 'public' | 'employee' | 'other';
  shares: number;
  percentage: number;
  votingPower: number;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  developmentProgress: number;
  marketShare: number;
  revenue: number;
  status: 'development' | 'launched' | 'declining';
  description: string;
  targetMarket: string;
  price: number;
  unitsSold: number;
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  salary: number;
  performance: number;
  hireDate: string;
  level: 'junior' | 'senior' | 'manager' | 'executive';
}

export interface Finance {
  cash: number;
  assets: number;
  liabilities: number;
  equity: number;
  revenue: number;
  expenses: number;
  profit?: number;
  profitMargin?: number;
  revenueGrowth?: number;
  expenseGrowth?: number;
  cashBalance?: number;
  currentAssets?: number;
  fixedAssets?: number;
  shortTermDebt?: number;
  longTermDebt?: number;
  debt: number;
  investments: number;
}

export interface NPCMessage {
  id: string;
  sender: 'npc' | 'player';
  content: string;
  timestamp: string;
  isRead: boolean;
  replyAfterTime?: string;
}

export interface NPC {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company: string;
  relationship: number;
  personality: string;
  specialty: string;
  systemPrompt: string;
  memory: string[];
  chatHistory: NPCMessage[];
  isFirstMeeting: boolean;
  pendingReply?: {
    content: string;
    replyAfterTime: string;
  };
}

export interface OperationTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed';
  assignee: string;
  dueDate: string;
  progress: number;
}

export interface InnovationProject {
  id: string;
  name: string;
  category: string;
  progress: number;
  budget: number;
  spent: number;
  team: string[];
  deadline: string;
  impact: number;
  progressDescription: string;
  bottleneck: string;
}

export interface BusinessLine {
  id: string;
  name: string;
  description: string;
  revenue: number;
  profit: number;
  growthRate: number;
  employees: number;
  products: string[];
}

export interface Market {
  id: string;
  name: string;
  region: string;
  size: number;
  growthRate: number;
  competition: number;
  ourShare: number;
  targetShare: number;
  revenue?: number;
}

export interface Inventory {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  warehouse: string;
  lastUpdate: string;
}

export interface Factory {
  id: string;
  name: string;
  type: 'factory' | 'warehouse' | 'office' | 'data-center';
  location: string;
  capacity: number;
  utilization: number;
  employees: number;
  status: 'active' | 'maintenance' | 'expanding';
  monthlyCost: number;
}

export interface SupplyChain {
  id: string;
  name: string;
  type: 'supplier' | 'distributor' | 'partner';
  company: string;
  reliability: number;
  deliveryTime: number;
  costRating: number;
  contractStatus: 'active' | 'negotiating' | 'expired';
}

export interface Logistics {
  id: string;
  shipmentId: string;
  productName: string;
  quantity: number;
  origin: string;
  destination: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  carrier: string;
  estimatedArrival: string;
}

export interface Subsidiary {
  id: string;
  name: string;
  location: string;
  industry: string;
  foundedYear: number;
  employees: number;
  revenue: number;
  profit: number;
  ownership: number;
  status: 'wholly-owned' | 'joint-venture' | 'affiliate';
}

export interface CashFlowItem {
  id: string;
  name: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  description: string;
  date?: string;
}

export interface Strategy {
  id: string;
  name: string;
  type: 'market-expansion' | 'product-diversification' | 'cost-optimization' | 'innovation-leadership' | 'acquisition';
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  objectives: string[];
  keyMetrics: { name: string; target: number; current: number }[];
  responsible: string;
  description: string;
}

export interface ExternalNews {
  id: string;
  title: string;
  source: string;
  date: string;
  impact: 'positive' | 'negative' | 'neutral';
  summary: string;
}

export interface Competitor {
  id: string;
  name: string;
  marketShare: number;
  revenue: number;
  products: number;
  employees: number;
  strength: string;
  weakness: string;
  performanceIndex?: number;
  marketExpectationIndex?: number;
  influenceIndex?: number;
  commercialDependency?: number;
  technologyMonopoly?: number;
  playerShareholding?: number;
}

export interface Supplier {
  id: string;
  name: string;
  type: 'supplier' | 'distributor' | 'partner';
  category: string;
  contactPerson: string;
  relationshipLevel: number;
  contractValue: number;
  contractExpiry: string;
  performanceIndex?: number;
  marketExpectationIndex?: number;
  influenceIndex?: number;
  commercialDependency?: number;
  technologyMonopoly?: number;
  reliability: number;
  quality: number;
  responseTime: number;
  notes: string;
}

export interface Stock {
  id: string;
  companyId: string;
  companyName: string;
  stockCode: string;
  stockExchange: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  high52w: number;
  low52w: number;
  performanceIndex: number;
  marketExpectationIndex: number;
}

