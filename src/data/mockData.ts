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

export const companyData: Company = {
  id: 'comp-001',
  name: '星辰科技集团',
  industry: '科技/互联网',
  marketValue: 25800000000,
  revenue: 8500000000,
  profit: 1200000000,
  employees: 8560,
  foundedYear: 2015,
  rating: 85,
  brandValue: 5000000000,
  marketShare: 15.8,
  isListed: false,
  creditRating: 'AA',
  creditScore: 82,
};

export const productsData: Product[] = [
  {
    id: 'prod-001',
    name: '星云OS',
    category: '操作系统',
    developmentProgress: 100,
    marketShare: 8.2,
    revenue: 2800000000,
    status: 'launched',
    description: '基于Linux内核的自研操作系统，支持多端适配',
    targetMarket: '企业级市场',
    price: 999,
    unitsSold: 2800000,
  },
  {
    id: 'prod-002',
    name: '量子数据库',
    category: '数据库',
    developmentProgress: 75,
    marketShare: 3.5,
    revenue: 850000000,
    status: 'development',
    description: '新一代分布式数据库，支持量子加密',
    targetMarket: '金融/政府',
    price: 59999,
    unitsSold: 1400,
  },
  {
    id: 'prod-003',
    name: '智云AI平台',
    category: 'AI服务',
    developmentProgress: 90,
    marketShare: 5.8,
    revenue: 1800000000,
    status: 'launched',
    description: '一站式AI开发平台，支持大模型训练',
    targetMarket: '开发者/企业',
    price: 2999,
    unitsSold: 600000,
  },
  {
    id: 'prod-004',
    name: '安全盾',
    category: '网络安全',
    developmentProgress: 100,
    marketShare: 6.1,
    revenue: 1200000000,
    status: 'launched',
    description: '全方位网络安全解决方案',
    targetMarket: '企业级市场',
    price: 15000,
    unitsSold: 80000,
  },
  {
    id: 'prod-005',
    name: '边缘计算节点',
    category: '硬件',
    developmentProgress: 45,
    marketShare: 1.2,
    revenue: 350000000,
    status: 'development',
    description: '高性能边缘计算硬件设备',
    targetMarket: 'IoT/智能制造',
    price: 12000,
    unitsSold: 29000,
  },
  {
    id: 'prod-006',
    name: '云存储Pro',
    category: '云服务',
    developmentProgress: 100,
    marketShare: 4.8,
    revenue: 1500000000,
    status: 'declining',
    description: '企业级云存储服务',
    targetMarket: '中小企业',
    price: 499,
    unitsSold: 3000000,
  },
];

export const employeesData: Employee[] = [
  { id: 'emp-001', name: '张明远', avatar: 'ZM', role: 'CEO', department: '管理层', salary: 5000000, performance: 95, hireDate: '2015-03-15', level: 'executive' },
  { id: 'emp-002', name: '李婉清', avatar: 'LW', role: 'CTO', department: '技术部', salary: 4200000, performance: 92, hireDate: '2015-05-20', level: 'executive' },
  { id: 'emp-003', name: '王建国', avatar: 'WJ', role: 'CFO', department: '财务部', salary: 3800000, performance: 88, hireDate: '2016-01-10', level: 'executive' },
  { id: 'emp-004', name: '陈思雨', avatar: 'CS', role: 'COO', department: '运营部', salary: 3500000, performance: 90, hireDate: '2017-06-08', level: 'executive' },
  { id: 'emp-005', name: '刘浩然', avatar: 'LH', role: '技术总监', department: '技术部', salary: 2800000, performance: 91, hireDate: '2016-03-22', level: 'manager' },
  { id: 'emp-006', name: '赵晓琳', avatar: 'ZX', role: '产品总监', department: '产品部', salary: 2500000, performance: 89, hireDate: '2017-01-15', level: 'manager' },
  { id: 'emp-007', name: '孙伟强', avatar: 'SW', role: '研发经理', department: '技术部', salary: 2200000, performance: 93, hireDate: '2018-05-10', level: 'manager' },
  { id: 'emp-008', name: '周雅婷', avatar: 'ZY', role: '市场总监', department: '市场部', salary: 2000000, performance: 85, hireDate: '2019-02-28', level: 'manager' },
  { id: 'emp-009', name: '吴俊杰', avatar: 'WJ', role: '高级工程师', department: '技术部', salary: 1500000, performance: 94, hireDate: '2019-08-15', level: 'senior' },
  { id: 'emp-010', name: '郑美玲', avatar: 'ZM', role: '高级产品经理', department: '产品部', salary: 1300000, performance: 90, hireDate: '2020-03-10', level: 'senior' },
  { id: 'emp-011', name: '黄志强', avatar: 'HZ', role: '资深研发工程师', department: '技术部', salary: 1400000, performance: 92, hireDate: '2019-11-20', level: 'senior' },
  { id: 'emp-012', name: '林晓燕', avatar: 'LX', role: '财务经理', department: '财务部', salary: 1200000, performance: 87, hireDate: '2020-06-05', level: 'senior' },
  { id: 'emp-013', name: '何建国', avatar: 'HJ', role: '运营经理', department: '运营部', salary: 1100000, performance: 86, hireDate: '2021-01-18', level: 'senior' },
  { id: 'emp-014', name: '马丽华', avatar: 'ML', role: '人力资源经理', department: '人事部', salary: 1000000, performance: 84, hireDate: '2021-04-12', level: 'senior' },
  { id: 'emp-015', name: '朱小明', avatar: 'ZX', role: '软件工程师', department: '技术部', salary: 800000, performance: 88, hireDate: '2022-03-25', level: 'junior' },
];

export const financeData: Finance = {
  cash: 3500000000,
  assets: 18500000000,
  liabilities: 8200000000,
  equity: 10300000000,
  revenue: 8500000000,
  expenses: 7300000000,
  profit: 1200000000,
  debt: 4500000000,
  investments: 2800000000,
};

export const financeHistory = [
  { quarter: 'Q1', revenue: 1800000000, expenses: 1500000000, profit: 300000000 },
  { quarter: 'Q2', revenue: 2100000000, expenses: 1800000000, profit: 300000000 },
  { quarter: 'Q3', revenue: 2300000000, expenses: 2000000000, profit: 300000000 },
  { quarter: 'Q4', revenue: 2300000000, expenses: 2000000000, profit: 300000000 },
];

export const npcData: NPC[] = [
  { 
    id: 'npc-001', 
    name: '赵长风', 
    avatar: 'ZC', 
    role: '政府官员', 
    company: '工信部', 
    relationship: 65, 
    personality: '正直严谨', 
    specialty: '政策解读',
    systemPrompt: '正直官员，维护产业政策，谨慎对待利益输送。',
    memory: [],
    chatHistory: [],
    isFirstMeeting: true
  },
  { 
    id: 'npc-002', 
    name: '钱伟民', 
    avatar: 'QW', 
    role: '投资人', 
    company: '华创资本', 
    relationship: 78, 
    personality: '精明务实', 
    specialty: '资本运作',
    systemPrompt: '精明投资人，关注回报率，警惕投机行为。',
    memory: [],
    chatHistory: [],
    isFirstMeeting: true
  },
  { 
    id: 'npc-003', 
    name: '孙雅琴', 
    avatar: 'SY', 
    role: '合作伙伴', 
    company: '华为技术', 
    relationship: 82, 
    personality: '诚信可靠', 
    specialty: '技术合作',
    systemPrompt: '诚信合作者，重视技术共赢，反感背信弃义。',
    memory: [],
    chatHistory: [],
    isFirstMeeting: true
  },
  { 
    id: 'npc-004', 
    name: '李铁山', 
    avatar: 'LT', 
    role: '竞争对手', 
    company: '巨龙科技', 
    relationship: 35, 
    personality: '强硬果断', 
    specialty: '市场策略',
    systemPrompt: '强硬竞争对手，不轻易妥协，维护市场份额。',
    memory: [],
    chatHistory: [],
    isFirstMeeting: true
  },
  { 
    id: 'npc-005', 
    name: '周明远', 
    avatar: 'ZM', 
    role: '行业专家', 
    company: '中科院', 
    relationship: 70, 
    personality: '博学儒雅', 
    specialty: '技术咨询',
    systemPrompt: '儒雅学者，追求学术严谨，轻视商业投机。',
    memory: [],
    chatHistory: [],
    isFirstMeeting: true
  },
  { 
    id: 'npc-006', 
    name: '吴彩霞', 
    avatar: 'WC', 
    role: '媒体记者', 
    company: '财经周刊', 
    relationship: 55, 
    personality: '敏锐好奇', 
    specialty: '媒体关系',
    systemPrompt: '敏锐记者，追求独家消息，警惕公关套路。',
    memory: [],
    chatHistory: [],
    isFirstMeeting: true
  },
  { 
    id: 'npc-007', 
    name: '郑国强', 
    avatar: 'ZG', 
    role: '供应商', 
    company: '台积电', 
    relationship: 72, 
    personality: '稳重守信', 
    specialty: '供应链管理',
    systemPrompt: '稳重供应商，重视长期合作，反感临时变单。',
    memory: [],
    chatHistory: [],
    isFirstMeeting: true
  },
  { 
    id: 'npc-008', 
    name: '王秀英', 
    avatar: 'WX', 
    role: '客户代表', 
    company: '中国银行', 
    relationship: 85, 
    personality: '细致周到', 
    specialty: '客户服务',
    systemPrompt: '细致客户，重视服务质量，反感敷衍应付。',
    memory: [],
    chatHistory: [],
    isFirstMeeting: true
  },
];

export const operationsData: OperationTask[] = [
  { id: 'op-001', title: '优化星云OS性能', description: '提升系统响应速度30%', priority: 'critical', status: 'in-progress', assignee: '刘浩然', dueDate: '2024-02-15', progress: 65 },
  { id: 'op-002', title: '客户满意度调研', description: '收集500家企业客户反馈', priority: 'high', status: 'in-progress', assignee: '陈思雨', dueDate: '2024-02-20', progress: 40 },
  { id: 'op-003', title: '安全漏洞修复', description: '修复云存储Pro的安全漏洞', priority: 'critical', status: 'completed', assignee: '孙伟强', dueDate: '2024-02-01', progress: 100 },
  { id: 'op-004', title: '新员工培训', description: 'Q1新员工入职培训', priority: 'medium', status: 'pending', assignee: '马丽华', dueDate: '2024-02-28', progress: 0 },
  { id: 'op-005', title: '服务器扩容', description: '为AI平台扩容1000台服务器', priority: 'high', status: 'pending', assignee: '吴俊杰', dueDate: '2024-03-01', progress: 0 },
  { id: 'op-006', title: '市场推广计划', description: '制定Q2市场推广方案', priority: 'medium', status: 'in-progress', assignee: '周雅婷', dueDate: '2024-02-25', progress: 55 },
];

export const innovationData: InnovationProject[] = [
  { 
    id: 'inn-001', 
    name: '量子计算应用研究', 
    category: '前沿技术', 
    progress: 35, 
    budget: 500000000, 
    spent: 175000000, 
    team: ['李婉清', '孙伟强', '吴俊杰'], 
    deadline: '2026-12-31', 
    impact: 95,
    progressDescription: '已完成量子比特基础架构搭建，正在进行量子纠错算法研究。目前已实现128量子比特系统的稳定运行，量子门保真度达到99.8%。',
    bottleneck: '量子纠错算法复杂度较高，需要更多算力支持。同时高端量子芯片供应受限，影响系统扩展进度。'
  },
  { 
    id: 'inn-002', 
    name: '下一代AI大模型', 
    category: '人工智能', 
    progress: 60, 
    budget: 800000000, 
    spent: 480000000, 
    team: ['刘浩然', '黄志强', '朱小明'], 
    deadline: '2025-06-30', 
    impact: 90,
    progressDescription: '模型预训练已完成70%，参数规模达到5000亿。正在进行多模态能力融合和推理优化，预计推理速度将提升3倍。',
    bottleneck: '数据标注成本高昂，训练数据质量参差不齐。算力资源紧张，GPU集群利用率已达95%，需要扩容。'
  },
  { 
    id: 'inn-003', 
    name: '隐私计算框架', 
    category: '网络安全', 
    progress: 85, 
    budget: 200000000, 
    spent: 170000000, 
    team: ['孙伟强', '郑美玲'], 
    deadline: '2024-06-30', 
    impact: 75,
    progressDescription: '核心算法已完成开发，正在进行安全性测试和性能优化。框架已通过多家金融机构的安全审计，预计Q2正式发布。',
    bottleneck: '与现有系统的集成兼容性需要进一步验证，部分合作伙伴技术栈老旧，迁移成本较高。'
  },
  { 
    id: 'inn-004', 
    name: '5G边缘计算融合', 
    category: '通信技术', 
    progress: 45, 
    budget: 350000000, 
    spent: 157500000, 
    team: ['李婉清', '吴俊杰'], 
    deadline: '2025-03-31', 
    impact: 80,
    progressDescription: '边缘节点硬件开发完成，正在进行5G协议栈与边缘计算平台的深度整合。已在3个城市进行试点部署。',
    bottleneck: '5G网络覆盖不均衡，部分地区基础设施建设滞后。边缘节点散热和功耗问题需要优化。'
  },
];

export const externalNewsData: ExternalNews[] = [
  { id: 'news-001', title: '国家出台人工智能产业扶持政策', source: '新华社', date: '2024-02-10', impact: 'positive', summary: '政府将加大对AI企业的研发补贴，最高可达研发投入的30%' },
  { id: 'news-002', title: '芯片短缺问题持续缓解', source: '财经日报', date: '2024-02-08', impact: 'positive', summary: '全球芯片产能逐步恢复，供应链紧张状况得到改善' },
  { id: 'news-003', title: '数据安全法正式实施', source: '法制晚报', date: '2024-02-05', impact: 'neutral', summary: '新法规对企业数据处理提出更高要求，合规成本增加' },
  { id: 'news-004', title: '竞争对手巨龙科技发布新产品', source: '科技周刊', date: '2024-02-03', impact: 'negative', summary: '巨龙科技推出新一代数据库产品，市场竞争加剧' },
  { id: 'news-005', title: '云计算市场增速放缓', source: '行业报告', date: '2024-02-01', impact: 'negative', summary: '全球云计算市场增长率从25%降至18%，市场趋于饱和' },
];

export const competitorsData: Competitor[] = [
  { id: 'comp-001', name: '巨龙科技', marketShare: 18.5, revenue: 12000000000, products: 12, employees: 12000, strength: '品牌影响力强', weakness: '创新速度慢' },
  { id: 'comp-002', name: '华腾集团', marketShare: 15.2, revenue: 9500000000, products: 8, employees: 9000, strength: '技术积累深厚', weakness: '市场反应迟钝' },
  { id: 'comp-003', name: '云帆科技', marketShare: 10.8, revenue: 6800000000, products: 6, employees: 6500, strength: '灵活性高', weakness: '资金实力弱' },
  { id: 'comp-004', name: '天工智能', marketShare: 8.5, revenue: 5200000000, products: 5, employees: 4500, strength: 'AI技术领先', weakness: '产品线单一' },
];

export const departmentsData = [
  { id: 'dept-001', name: '管理层', head: '张明远', employees: 4, budget: 20000000 },
  { id: 'dept-002', name: '技术部', head: '李婉清', employees: 3500, budget: 3500000000 },
  { id: 'dept-003', name: '产品部', head: '赵晓琳', employees: 800, budget: 800000000 },
  { id: 'dept-004', name: '市场部', head: '周雅婷', employees: 600, budget: 600000000 },
  { id: 'dept-005', name: '运营部', head: '陈思雨', employees: 1200, budget: 1200000000 },
  { id: 'dept-006', name: '财务部', head: '王建国', employees: 200, budget: 200000000 },
  { id: 'dept-007', name: '人事部', head: '马丽华', employees: 150, budget: 150000000 },
];

export const marketTrends = [
  { name: '人工智能', value: 92, trend: 'up' },
  { name: '云计算', value: 78, trend: 'stable' },
  { name: '网络安全', value: 85, trend: 'up' },
  { name: '边缘计算', value: 65, trend: 'up' },
  { name: '量子计算', value: 45, trend: 'up' },
];

export const kpiData = [
  { name: '营收', value: 8500000000, target: 10000000000, unit: '元' },
  { name: '利润', value: 1200000000, target: 1500000000, unit: '元' },
  { name: '市场份额', value: 12.5, target: 15, unit: '%' },
  { name: '员工满意度', value: 88, target: 90, unit: '%' },
];

export const businessLinesData: BusinessLine[] = [
  { id: 'bl-001', name: '操作系统业务', description: '企业级操作系统研发与服务', revenue: 2800000000, profit: 840000000, growthRate: 15.2, employees: 1200, products: ['星云OS'] },
  { id: 'bl-002', name: '数据库业务', description: '分布式数据库与数据管理解决方案', revenue: 850000000, profit: 255000000, growthRate: 28.5, employees: 600, products: ['量子数据库'] },
  { id: 'bl-003', name: 'AI服务业务', description: '人工智能平台与大模型服务', revenue: 1800000000, profit: 540000000, growthRate: 42.3, employees: 800, products: ['智云AI平台'] },
  { id: 'bl-004', name: '网络安全业务', description: '企业级网络安全解决方案', revenue: 1200000000, profit: 360000000, growthRate: 12.8, employees: 500, products: ['安全盾'] },
  { id: 'bl-005', name: '硬件业务', description: '边缘计算设备与智能硬件', revenue: 350000000, profit: 70000000, growthRate: 35.6, employees: 400, products: ['边缘计算节点'] },
  { id: 'bl-006', name: '云服务业务', description: '云计算基础设施与存储服务', revenue: 1500000000, profit: 300000000, growthRate: 8.2, employees: 600, products: ['云存储Pro'] },
];

export const marketsData: Market[] = [
  { id: 'mkt-001', name: '中国市场', region: '中国大陆', size: 50000000000, growthRate: 18.5, competition: 75, ourShare: 15.2, targetShare: 18 },
  { id: 'mkt-002', name: '东南亚市场', region: '东南亚', size: 12000000000, growthRate: 25.3, competition: 60, ourShare: 8.5, targetShare: 12 },
  { id: 'mkt-003', name: '欧洲市场', region: '欧盟', size: 35000000000, growthRate: 12.8, competition: 85, ourShare: 5.2, targetShare: 8 },
  { id: 'mkt-004', name: '北美市场', region: '美国/加拿大', size: 60000000000, growthRate: 10.5, competition: 90, ourShare: 3.8, targetShare: 6 },
  { id: 'mkt-005', name: '日韩市场', region: '日本/韩国', size: 18000000000, growthRate: 15.2, competition: 80, ourShare: 6.5, targetShare: 10 },
];

export const inventoryData: Inventory[] = [
  { id: 'inv-001', productName: '边缘计算节点EC-1000', sku: 'EC-1000-A', quantity: 1200, unitCost: 8500, unitPrice: 12000, warehouse: '深圳仓储中心', lastUpdate: '2024-02-10' },
  { id: 'inv-002', productName: '边缘计算节点EC-2000', sku: 'EC-2000-B', quantity: 850, unitCost: 15000, unitPrice: 22000, warehouse: '上海仓储中心', lastUpdate: '2024-02-08' },
  { id: 'inv-003', productName: '安全网关SG-5000', sku: 'SG-5000-C', quantity: 2300, unitCost: 3200, unitPrice: 4500, warehouse: '北京仓储中心', lastUpdate: '2024-02-09' },
  { id: 'inv-004', productName: '数据存储阵列DS-8000', sku: 'DS-8000-D', quantity: 450, unitCost: 28000, unitPrice: 38000, warehouse: '深圳仓储中心', lastUpdate: '2024-02-07' },
  { id: 'inv-005', productName: 'AI加速卡AI-3000', sku: 'AI-3000-E', quantity: 680, unitCost: 45000, unitPrice: 62000, warehouse: '杭州仓储中心', lastUpdate: '2024-02-10' },
];

export const factoriesData: Factory[] = [
  { id: 'fac-001', name: '深圳生产基地', type: 'factory', location: '深圳', capacity: 500000, utilization: 85, employees: 1500, status: 'active', monthlyCost: 8500000 },
  { id: 'fac-002', name: '上海数据中心', type: 'data-center', location: '上海', capacity: 20000, utilization: 92, employees: 120, status: 'active', monthlyCost: 12000000 },
  { id: 'fac-003', name: '北京总部大厦', type: 'office', location: '北京', capacity: 3000, utilization: 78, employees: 2500, status: 'active', monthlyCost: 5000000 },
  { id: 'fac-004', name: '杭州研发中心', type: 'office', location: '杭州', capacity: 1500, utilization: 95, employees: 1400, status: 'active', monthlyCost: 3500000 },
  { id: 'fac-005', name: '武汉仓储物流中心', type: 'warehouse', location: '武汉', capacity: 1000000, utilization: 68, employees: 300, status: 'active', monthlyCost: 2000000 },
  { id: 'fac-006', name: '成都新工厂', type: 'factory', location: '成都', capacity: 300000, utilization: 0, employees: 0, status: 'expanding', monthlyCost: 1500000 },
];

export const supplyChainData: SupplyChain[] = [
  { id: 'sc-001', name: '芯片供应商', type: 'supplier', company: '台积电', reliability: 95, deliveryTime: 21, costRating: 75, contractStatus: 'active' },
  { id: 'sc-002', name: '硬件代工厂', type: 'supplier', company: '富士康', reliability: 92, deliveryTime: 14, costRating: 80, contractStatus: 'active' },
  { id: 'sc-003', name: '华东地区分销商', type: 'distributor', company: '神州数码', reliability: 88, deliveryTime: 7, costRating: 65, contractStatus: 'active' },
  { id: 'sc-004', name: '海外代理商', type: 'distributor', company: 'TechGlobal', reliability: 85, deliveryTime: 28, costRating: 60, contractStatus: 'negotiating' },
  { id: 'sc-005', name: '技术合作伙伴', type: 'partner', company: '华为技术', reliability: 98, deliveryTime: 3, costRating: 90, contractStatus: 'active' },
];

export const logisticsData: Logistics[] = [
  { id: 'log-001', shipmentId: 'SHP-2024-0001', productName: '边缘计算节点EC-1000', quantity: 200, origin: '深圳', destination: '北京', status: 'delivered', carrier: '顺丰速运', estimatedArrival: '2024-02-08' },
  { id: 'log-002', shipmentId: 'SHP-2024-0002', productName: 'AI加速卡AI-3000', quantity: 50, origin: '深圳', destination: '杭州', status: 'in-transit', carrier: '京东物流', estimatedArrival: '2024-02-12' },
  { id: 'log-003', shipmentId: 'SHP-2024-0003', productName: '安全网关SG-5000', quantity: 150, origin: '上海', destination: '广州', status: 'in-transit', carrier: '德邦物流', estimatedArrival: '2024-02-13' },
  { id: 'log-004', shipmentId: 'SHP-2024-0004', productName: '数据存储阵列DS-8000', quantity: 20, origin: '深圳', destination: '新加坡', status: 'pending', carrier: 'DHL', estimatedArrival: '2024-02-18' },
  { id: 'log-005', shipmentId: 'SHP-2024-0005', productName: '边缘计算节点EC-2000', quantity: 80, origin: '深圳', destination: '成都', status: 'delayed', carrier: '中通快递', estimatedArrival: '2024-02-15' },
];

export const subsidiariesData: Subsidiary[] = [
  { id: 'sub-001', name: '星辰软件技术有限公司', location: '北京', industry: '软件', foundedYear: 2015, employees: 3500, revenue: 4200000000, profit: 630000000, ownership: 100, status: 'wholly-owned' },
  { id: 'sub-002', name: '星辰云服务有限公司', location: '上海', industry: '云计算', foundedYear: 2017, employees: 1800, revenue: 2100000000, profit: 315000000, ownership: 100, status: 'wholly-owned' },
  { id: 'sub-003', name: '星辰智能硬件有限公司', location: '深圳', industry: '硬件', foundedYear: 2019, employees: 1200, revenue: 850000000, profit: 127500000, ownership: 100, status: 'wholly-owned' },
  { id: 'sub-004', name: '星辰东南亚科技有限公司', location: '新加坡', industry: '科技', foundedYear: 2021, employees: 600, revenue: 650000000, profit: 97500000, ownership: 75, status: 'joint-venture' },
  { id: 'sub-005', name: '星辰欧洲研究院', location: '慕尼黑', industry: '研发', foundedYear: 2022, employees: 200, revenue: 150000000, profit: -50000000, ownership: 100, status: 'wholly-owned' },
];

export const cashFlowData: CashFlowItem[] = [
  { id: 'cf-001', name: '产品销售收入', type: 'income', category: '主营业务收入', amount: 6800000000, frequency: 'monthly', description: '各产品线产品销售及服务收入' },
  { id: 'cf-002', name: '订阅服务收入', type: 'income', category: '主营业务收入', amount: 1200000000, frequency: 'monthly', description: '云计算及SaaS服务订阅收入' },
  { id: 'cf-003', name: '授权许可收入', type: 'income', category: '其他业务收入', amount: 350000000, frequency: 'quarterly', description: '软件授权及技术许可收入' },
  { id: 'cf-004', name: '投资收益', type: 'income', category: '投资收益', amount: 150000000, frequency: 'quarterly', description: '金融投资及股权收益' },
  { id: 'cf-005', name: '员工薪酬支出', type: 'expense', category: '人力成本', amount: 2800000000, frequency: 'monthly', description: '全体员工工资、奖金及福利' },
  { id: 'cf-006', name: '研发投入', type: 'expense', category: '研发成本', amount: 2100000000, frequency: 'monthly', description: '研发项目投入及设备采购' },
  { id: 'cf-007', name: '市场营销费用', type: 'expense', category: '销售费用', amount: 950000000, frequency: 'monthly', description: '广告宣传、渠道及促销费用' },
  { id: 'cf-008', name: '基础设施成本', type: 'expense', category: '运营成本', amount: 750000000, frequency: 'monthly', description: '数据中心、服务器及网络费用' },
  { id: 'cf-009', name: '原材料采购', type: 'expense', category: '原材料成本', amount: 450000000, frequency: 'monthly', description: '硬件产品原材料采购' },
  { id: 'cf-010', name: '管理费用', type: 'expense', category: '管理成本', amount: 250000000, frequency: 'monthly', description: '办公场地、行政及差旅费用' },
];

export const strategiesData: Strategy[] = [
  {
    id: 'str-001',
    name: '全球化市场扩张',
    type: 'market-expansion',
    status: 'in-progress',
    progress: 45,
    budget: 1500000000,
    spent: 675000000,
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    objectives: ['进入欧洲和北美市场', '建立海外销售网络', '本地化团队建设'],
    keyMetrics: [
      { name: '海外营收占比', target: 30, current: 15 },
      { name: '海外员工数', target: 1000, current: 450 },
      { name: '海外客户数', target: 500, current: 280 },
    ],
    responsible: '周雅婷',
    description: '通过在欧洲和北美设立子公司，建立本地化销售和服务团队，逐步扩大国际市场份额。'
  },
  {
    id: 'str-002',
    name: 'AI产品矩阵建设',
    type: 'product-diversification',
    status: 'in-progress',
    progress: 60,
    budget: 2000000000,
    spent: 1200000000,
    startDate: '2023-06-01',
    endDate: '2025-06-30',
    objectives: ['完善AI产品线', '推出行业解决方案', '建立AI生态系统'],
    keyMetrics: [
      { name: 'AI产品线数量', target: 8, current: 5 },
      { name: 'AI业务营收', target: 3000000000, current: 1800000000 },
      { name: '生态合作伙伴', target: 100, current: 65 },
    ],
    responsible: '赵晓琳',
    description: '围绕智云AI平台，打造覆盖多个行业的AI解决方案，构建完整的AI产品矩阵和生态系统。'
  },
  {
    id: 'str-003',
    name: '成本优化计划',
    type: 'cost-optimization',
    status: 'completed',
    progress: 100,
    budget: 200000000,
    spent: 185000000,
    startDate: '2022-01-01',
    endDate: '2023-12-31',
    objectives: ['降低运营成本15%', '优化供应链效率', '提升资源利用率'],
    keyMetrics: [
      { name: '成本降低率', target: 15, current: 18 },
      { name: '供应链效率', target: 85, current: 92 },
      { name: '资源利用率', target: 80, current: 88 },
    ],
    responsible: '陈思雨',
    description: '通过流程优化、自动化和供应商整合，实现运营成本的显著降低。'
  },
  {
    id: 'str-004',
    name: '前沿技术领跑',
    type: 'innovation-leadership',
    status: 'in-progress',
    progress: 35,
    budget: 3000000000,
    spent: 1050000000,
    startDate: '2023-01-01',
    endDate: '2027-12-31',
    objectives: ['量子计算商业化', '下一代AI突破', '隐私计算领先'],
    keyMetrics: [
      { name: '研发投入占比', target: 25, current: 22 },
      { name: '专利数量', target: 500, current: 280 },
      { name: '技术影响力', target: 90, current: 78 },
    ],
    responsible: '李婉清',
    description: '在量子计算、AI大模型和隐私计算等前沿领域保持技术领先，打造核心竞争力。'
  },
];
