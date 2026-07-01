import { useGameStore } from '@/stores/gameStore';
import { Stock, Shareholding, Competitor, Supplier } from '@/data/mockData';

export interface CalculatedMetrics {
  profit: number;
  profitMargin: number;
  cashBalance: number;
  revenueGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
  marketShareGrowth: number;
  employeeGrowth: number;
  productGrowth: number;
  roi: number;
}

export interface MarketShareData {
  name: string;
  value: number;
  color: string;
}

export interface RevenueSourceData {
  name: string;
  value: number;
  color: string;
}

export interface InvestmentData {
  name: string;
  value: number;
  color: string;
}

export interface RevenueTrendData {
  month: string;
  revenue: number;
  profit: number;
  expenses: number;
}

export interface MarketShareTrendData {
  month: string;
  ourShare: number;
  competitor1Share: number;
  competitor2Share: number;
}

export function calculateAllMetrics(): CalculatedMetrics {
  const store = useGameStore.getState();
  const finance = store.finance;
  const company = store.company;
  const employees = store.employees;
  const products = store.products;
  const financeHistory = store.financeHistory;

  if (!finance) {
    return {
      profit: 0,
      profitMargin: 0,
      cashBalance: 0,
      revenueGrowth: 0,
      expenseGrowth: 0,
      profitGrowth: 0,
      marketShareGrowth: 0,
      employeeGrowth: 0,
      productGrowth: 0,
      roi: 0,
    };
  }

  const profit = finance.revenue - finance.expenses;
  const profitMargin = finance.revenue > 0 ? (profit / finance.revenue) * 100 : 0;
  const cashBalance = finance.cash + finance.investments - finance.debt;

  const lastQuarter = (financeHistory || []).length > 0 ? financeHistory[financeHistory.length - 1] : null;
  const revenueGrowth = lastQuarter && lastQuarter.revenue > 0
    ? ((finance.revenue - lastQuarter.revenue) / lastQuarter.revenue) * 100
    : 0;
  const expenseGrowth = lastQuarter && lastQuarter.expenses > 0
    ? ((finance.expenses - lastQuarter.expenses) / lastQuarter.expenses) * 100
    : 0;
  const profitGrowth = lastQuarter && lastQuarter.profit > 0
    ? ((profit - lastQuarter.profit) / lastQuarter.profit) * 100
    : 0;

  const marketShareGrowth = company && company.marketShare > 0
    ? company.marketShare
    : 0;

  const employeeGrowth = (employees || []).length > 0 ? employees.length : 0;
  const productGrowth = (products || []).length > 0 ? products.length : 0;

  const roi = finance.investments > 0
    ? (profit / finance.investments) * 100
    : 0;

  return {
    profit,
    profitMargin,
    cashBalance,
    revenueGrowth,
    expenseGrowth,
    profitGrowth,
    marketShareGrowth,
    employeeGrowth,
    productGrowth,
    roi,
  };
}

export function checkMonthChange(newTime: string, previousTime: string): boolean {
  if (!previousTime) return false;

  const newDate = new Date(newTime);
  const prevDate = new Date(previousTime);

  return newDate.getMonth() !== prevDate.getMonth() ||
    newDate.getFullYear() !== prevDate.getFullYear();
}

export function generateMonthlyCashFlow() {
  const store = useGameStore.getState();
  const finance = store.finance;

  if (!finance) return;

  const monthlyIncome = finance.revenue / 12;
  const monthlyExpense = finance.expenses / 12;
  const monthlyProfit = monthlyIncome - monthlyExpense;

  const newCashFlowItem = {
    id: `cf-${Date.now()}`,
    name: monthlyProfit >= 0 ? '月度营收' : '月度支出',
    type: monthlyProfit >= 0 ? 'income' as const : 'expense' as const,
    category: monthlyProfit >= 0 ? '月度营收' : '月度支出',
    amount: Math.abs(monthlyProfit),
    frequency: 'monthly' as const,
    description: `本月结余: ${monthlyProfit >= 0 ? '+' : '-'}${Math.abs(monthlyProfit).toLocaleString()}元`,
    date: new Date().toISOString().split('T')[0],
  };

  store.setCashFlow([...store.cashFlow, newCashFlowItem]);

  const newCash = finance.cash + monthlyProfit;
  store.setFinance({
    ...finance,
    cash: newCash,
  });
}

export function generateMarketShareData(): MarketShareData[] {
  const store = useGameStore.getState();
  const company = store.company;
  const competitors = store.competitors;

  if (!company && (competitors || []).length === 0) {
    return [];
  }

  const data: MarketShareData[] = [];

  if (company) {
    data.push({
      name: company.name || '本企业',
      value: company.marketShare || 0,
      color: '#f59e0b',
    });
  }

  competitors.forEach((comp, index) => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'];
    data.push({
      name: comp.name,
      value: comp.marketShare,
      color: colors[index % colors.length],
    });
  });

  return data;
}

export function generateRevenueSourceData(): RevenueSourceData[] {
  const store = useGameStore.getState();
  const products = store.products;
  const businessLines = store.businessLines;

  if ((products || []).length === 0 && (businessLines || []).length === 0) {
    return [];
  }

  const data: RevenueSourceData[] = [];
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'];

  if ((businessLines || []).length > 0) {
    businessLines.forEach((bl, index) => {
      data.push({
        name: bl.name,
        value: bl.revenue,
        color: colors[index % colors.length],
      });
    });
  } else if ((products || []).length > 0) {
    products.forEach((prod, index) => {
      data.push({
        name: prod.name,
        value: prod.revenue,
        color: colors[index % colors.length],
      });
    });
  }

  return data;
}

export function generateRevenueByRegion(): RevenueSourceData[] {
  const store = useGameStore.getState();
  const markets = store.markets;

  if ((markets || []).length === 0) {
    return [];
  }

  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

  return markets.map((market, index) => ({
    name: market.region || market.name,
    value: market.revenue || 0,
    color: colors[index % colors.length],
  }));
}

export function generateInvestmentData(): InvestmentData[] {
  const store = useGameStore.getState();
  const innovations = store.innovations;
  const operations = store.operations;
  const strategies = store.strategies;

  const data: InvestmentData[] = [];
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'];

  const totalRdBudget = innovations.reduce((sum, inn) => sum + inn.budget, 0);
  const totalOperationsBudget = operations.reduce((sum, op) => sum + (op.priority === 'critical' || op.priority === 'high' ? 100000 : 50000), 0);
  const totalStrategyBudget = strategies.reduce((sum, st) => sum + st.budget, 0);

  if (totalRdBudget > 0) {
    data.push({
      name: '研发投入',
      value: totalRdBudget,
      color: colors[0],
    });
  }

  if (totalOperationsBudget > 0) {
    data.push({
      name: '运营投入',
      value: totalOperationsBudget,
      color: colors[1],
    });
  }

  if (totalStrategyBudget > 0) {
    data.push({
      name: '战略投入',
      value: totalStrategyBudget,
      color: colors[2],
    });
  }

  const finance = store.finance;
  if (finance && finance.investments > 0) {
    const other = finance.investments - totalRdBudget - totalOperationsBudget - totalStrategyBudget;
    if (other > 0) {
      data.push({
        name: '其他投入',
        value: other,
        color: colors[3],
      });
    }
  }

  return data;
}

export function generateRevenueTrendData(): RevenueTrendData[] {
  const store = useGameStore.getState();
  const financeHistory = store.financeHistory;

  if ((financeHistory || []).length === 0) {
    return [];
  }

  return financeHistory.map((fh) => ({
    month: fh.quarter,
    revenue: fh.revenue,
    profit: fh.profit,
    expenses: fh.expenses,
  }));
}

export function generateMarketShareTrendData(): MarketShareTrendData[] {
  const store = useGameStore.getState();
  const company = store.company;
  const competitors = store.competitors;

  if (!company && (competitors || []).length === 0) {
    return [];
  }

  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  const baseShare = company?.marketShare || 20;

  return months.map((month, index) => ({
    month,
    ourShare: baseShare + (Math.random() * 5 - 2),
    competitor1Share: competitors[0]?.marketShare || 15 + (Math.random() * 3 - 1),
    competitor2Share: competitors[1]?.marketShare || 10 + (Math.random() * 3 - 1),
  }));
}

export function calculateStockPrices(): Stock[] {
  const store = useGameStore.getState();
  const competitors = store.competitors;
  const suppliers = store.suppliers;

  const stocks: Stock[] = [];

  competitors.forEach((comp, index) => {
    if (comp.performanceIndex !== undefined && comp.marketExpectationIndex !== undefined) {
      const basePrice = 10 + comp.marketShare * 2;
      const performanceFactor = comp.performanceIndex / 100;
      const expectationFactor = comp.marketExpectationIndex / 100;

      const currentPrice = basePrice * (0.7 + performanceFactor * 0.5 + expectationFactor * 0.3);
      const previousClose = currentPrice * (1 + (Math.random() * 0.06 - 0.03));
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      const marketCap = currentPrice * (comp.revenue / currentPrice * 10);
      const peRatio = currentPrice / (comp.revenue * 0.1 / (comp.revenue / currentPrice * 10));

      stocks.push({
        id: `stock-comp-${index}`,
        companyId: comp.id,
        companyName: comp.name,
        stockCode: `600${100 + index}`,
        stockExchange: '上交所',
        currentPrice: Math.round(currentPrice * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 100000000),
        marketCap: Math.round(marketCap),
        peRatio: Math.round(peRatio * 100) / 100,
        high52w: Math.round(currentPrice * 1.5 * 100) / 100,
        low52w: Math.round(currentPrice * 0.6 * 100) / 100,
        performanceIndex: comp.performanceIndex,
        marketExpectationIndex: comp.marketExpectationIndex,
      });
    }
  });

  suppliers.forEach((sup, index) => {
    if (sup.performanceIndex !== undefined && sup.marketExpectationIndex !== undefined && sup.type === 'supplier') {
      const basePrice = 5 + sup.quality * 0.1;
      const performanceFactor = sup.performanceIndex / 100;
      const expectationFactor = sup.marketExpectationIndex / 100;

      const currentPrice = basePrice * (0.7 + performanceFactor * 0.5 + expectationFactor * 0.3);
      const previousClose = currentPrice * (1 + (Math.random() * 0.06 - 0.03));
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      const marketCap = currentPrice * 10000000;

      stocks.push({
        id: `stock-sup-${index}`,
        companyId: sup.id,
        companyName: sup.name,
        stockCode: `002${200 + index}`,
        stockExchange: '深交所',
        currentPrice: Math.round(currentPrice * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 50000000),
        marketCap: Math.round(marketCap),
        peRatio: Math.round((currentPrice / (sup.contractValue / 10000000)) * 100) / 100,
        high52w: Math.round(currentPrice * 1.4 * 100) / 100,
        low52w: Math.round(currentPrice * 0.5 * 100) / 100,
        performanceIndex: sup.performanceIndex,
        marketExpectationIndex: sup.marketExpectationIndex,
      });
    }
  });

  return stocks;
}

export function calculateInfluenceIndex(
  playerShareholding: number,
  commercialDependency: number,
  technologyMonopoly: number
): number {
  const shareholdingFactor = playerShareholding * 0.4;
  const dependencyFactor = commercialDependency * 0.3;
  const monopolyFactor = technologyMonopoly * 0.3;

  return Math.min(100, Math.max(0, Math.round(shareholdingFactor + dependencyFactor + monopolyFactor)));
}

export function calculateLoanEligibility(creditRating: string, creditScore: number, marketValue: number): number {
  const ratingMultipliers: Record<string, number> = {
    'AAA': 1.5,
    'AA+': 1.4,
    'AA': 1.3,
    'AA-': 1.2,
    'A+': 1.1,
    'A': 1.0,
    'BBB': 0.8,
    'BB': 0.6,
    'B': 0.4,
  };

  const ratingMultiplier = ratingMultipliers[creditRating] || 0.5;
  const scoreFactor = creditScore / 100;
  const marketFactor = Math.log10(marketValue + 1) / 10;

  return Math.min(100, Math.max(0, Math.round((ratingMultiplier * scoreFactor * 50 + marketFactor * 50) * 100)));
}

export function generateShareholdingData(): { name: string; value: number; color: string; type: string; shares: number; influence: number }[] {
  const store = useGameStore.getState();
  const company = store.company;

  if (!company) {
    return [];
  }

  const shareholdings = store.shareholdings || [];

  if (shareholdings.length === 0) {
    return [];
  }

  const sortedByShare = [...shareholdings].sort((a, b) => b.percentage - a.percentage);

  const influenceRanks = sortedByShare.map((sh, index) => {
    let influence = 100 - index * 15;
    if (sh.type === 'founder') influence += 20;
    else if (sh.type === 'institution') influence += 10;
    return Math.min(100, Math.max(0, influence));
  });

  return shareholdings.map((sh, index) => {
    const colorMap: Record<string, string> = {
      founder: '#f59e0b',
      institution: '#3b82f6',
      public: '#10b981',
      employee: '#8b5cf6',
      other: '#6b7280',
    };

    return {
      name: sh.name,
      value: sh.percentage,
      color: colorMap[sh.type] || '#6b7280',
      type: sh.type,
      shares: sh.shares,
      influence: influenceRanks[index],
    };
  });
}