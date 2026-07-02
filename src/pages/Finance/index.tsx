import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, PieChart, ArrowUpRight, ArrowDownRight, CreditCard, Receipt, FileText } from 'lucide-react';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import { useGameStore } from '@/stores/gameStore';
import { formatCurrency, formatPercent } from '@/lib/utils';

function SimpleBarChart({ data, labels, color = '#ffd700' }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data);

  return (
    <div className="flex items-end justify-between h-32 gap-4">
      {data.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full rounded-t-lg transition-all duration-500"
            style={{
              height: `${(value / max) * 100}%`,
              backgroundColor: color,
              minHeight: '20px'
            }}
          />
          <span className="text-text-muted text-xs">{labels[index]}</span>
          <span className="text-white text-sm font-medium">{formatCurrency(value)}</span>
        </div>
      ))}
    </div>
  );
}

const frequencyMap: Record<string, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
  quarterly: '每季度',
  yearly: '每年',
};

type TabType = 'overview' | 'cashFlow';

export default function Finance() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { finance, cashFlow, financeHistory } = useGameStore();

  if (!finance) return null;

  const tabs = [
    { id: 'overview' as TabType, label: '财务概览', icon: FileText },
    { id: 'cashFlow' as TabType, label: '现金流明细', icon: CreditCard },
  ];

  const balanceSheet = [
    { category: '流动资产', value: finance?.currentAssets || 0 },
    { category: '固定资产', value: finance?.fixedAssets || 0 },
    { category: '总资产', value: finance?.assets || 0 },
  ];

  const liabilities = [
    { category: '短期负债', value: finance?.shortTermDebt || 0 },
    { category: '长期负债', value: finance?.longTermDebt || 0 },
    { category: '总负债', value: finance?.liabilities || 0 },
  ];

  const cashFlowSummary = [];

  const incomeItems = (cashFlow || []).filter(item => item && item.type === 'income');
  const expenseItems = (cashFlow || []).filter(item => item && item.type === 'expense');

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="现金余额"
          value={formatCurrency(finance.cash)}
          unit="元"
          change={8.5}
          icon={<Wallet className="text-accent-gold" size={24} />}
          color="gold"
        />
        <StatCard
          title="总资产"
          value={formatCurrency(finance.assets)}
          unit="元"
          change={12.3}
          icon={<TrendingUp className="text-accent-green" size={24} />}
          color="green"
        />
        <StatCard
          title="总负债"
          value={formatCurrency(finance.liabilities)}
          unit="元"
          change={-3.2}
          icon={<ArrowDownRight className="text-accent-blue" size={24} />}
          color="blue"
        />
        <StatCard
          title="净资产"
          value={formatCurrency(finance.equity)}
          unit="元"
          change={18.5}
          icon={<PieChart className="text-accent-purple" size={24} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="资产负债表" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-accent-green font-semibold mb-4">资产</h4>
              <div className="space-y-3">
                {balanceSheet.map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-text-secondary">{item.category}</span>
                    <span className="text-white font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-accent-blue font-semibold mb-4">负债与权益</h4>
              <div className="space-y-3">
                {liabilities.map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-text-secondary">{item.category}</span>
                    <span className="text-white font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-accent-purple/10 rounded-lg border border-accent-purple/30">
                  <span className="text-accent-purple font-medium">所有者权益</span>
                  <span className="text-accent-purple font-semibold">{formatCurrency(finance.equity)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="现金流">
          <div className="space-y-4">
            {cashFlowSummary.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-text-secondary">{item.category}</span>
                <div className="flex items-center gap-2">
                  {item.inflow ? (
                    <ArrowUpRight className="text-accent-green" size={16} />
                  ) : (
                    <ArrowDownRight className="text-status-danger" size={16} />
                  )}
                  <span className={`font-medium ${item.inflow ? 'text-accent-green' : 'text-status-danger'}`}>
                    {item.inflow ? '+' : ''}{formatCurrency(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="季度利润趋势">
          <SimpleBarChart
            data={financeHistory.map(h => h.profit)}
            labels={financeHistory.map(h => h.quarter)}
            color="#00ff88"
          />
        </Card>

        <Card title="收入与支出对比">
          <div className="space-y-4">
            {financeHistory.map((item) => (
              <div key={item.quarter} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{item.quarter}</span>
                  <span className="text-accent-green text-sm">利润 {formatCurrency(item.profit)}</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-muted text-xs">收入</span>
                      <span className="text-accent-blue text-xs">{formatCurrency(item.revenue)}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-blue rounded-full"
                        style={{ width: `${(item.revenue / 2500000000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-muted text-xs">支出</span>
                      <span className="text-status-warning text-xs">{formatCurrency(item.expenses)}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-status-warning rounded-full"
                        style={{ width: `${(item.expenses / 2500000000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="财务健康度" className="mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-accent-green/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-accent-green text-2xl font-bold">A+</span>
            </div>
            <p className="text-text-secondary text-sm">偿债能力</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-accent-green/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-accent-green text-2xl font-bold">A</span>
            </div>
            <p className="text-text-secondary text-sm">运营效率</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-accent-blue/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-accent-blue text-2xl font-bold">B+</span>
            </div>
            <p className="text-text-secondary text-sm">盈利能力</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-accent-green/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-accent-green text-2xl font-bold">A</span>
            </div>
            <p className="text-text-secondary text-sm">成长潜力</p>
          </div>
        </div>
      </Card>
    </>
  );

  const renderCashFlow = () => (
    <>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
              <Receipt className="text-accent-green" size={24} />
            </div>
            <div>
              <p className="text-text-secondary text-sm">常态化收入</p>
              <p className="text-2xl font-bold text-accent-green">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-status-danger/20 rounded-xl flex items-center justify-center">
              <CreditCard className="text-status-danger" size={24} />
            </div>
            <div>
              <p className="text-text-secondary text-sm">常态化支出</p>
              <p className="text-2xl font-bold text-status-danger">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="常态化收入">
          <div className="space-y-3">
            {incomeItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-accent-green/5 rounded-lg border border-accent-green/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <span className="px-2 py-0.5 text-xs bg-accent-green/20 text-accent-green rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm mt-1">{item.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-text-secondary text-xs">
                      <DollarSign size={14} className="inline mr-1" />
                      {frequencyMap[item.frequency]}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-accent-green font-semibold">{formatCurrency(item.amount)}</p>
                  <p className="text-text-muted text-xs">/{frequencyMap[item.frequency]}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="常态化支出">
          <div className="space-y-3">
            {expenseItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-status-danger/5 rounded-lg border border-status-danger/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <span className="px-2 py-0.5 text-xs bg-status-danger/20 text-status-danger rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm mt-1">{item.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-text-secondary text-xs">
                      <DollarSign size={14} className="inline mr-1" />
                      {frequencyMap[item.frequency]}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-status-danger font-semibold">{formatCurrency(item.amount)}</p>
                  <p className="text-text-muted text-xs">/{frequencyMap[item.frequency]}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="现金流分析" className="mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-text-secondary text-sm mb-2">月度净流入</p>
            <p className="text-xl font-bold text-accent-green">
              {totalIncome >= totalExpense ? '+' : ''}{formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-text-secondary text-sm mb-2">收入来源数量</p>
            <p className="text-xl font-bold text-white">{incomeItems.length}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-text-secondary text-sm mb-2">支出项目数量</p>
            <p className="text-xl font-bold text-white">{expenseItems.length}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-text-secondary text-sm mb-2">利润率</p>
            <p className="text-xl font-bold text-accent-gold">{formatPercent(totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0, 1)}</p>
          </div>
        </div>
      </Card>
    </>
  );

  return (
    <div className="flex-1 p-8 overflow-auto scrollbar-thin">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">财务管理</h1>
          <p className="text-text-secondary">监控企业财务状况，分析收支数据</p>
        </div>
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                  ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'cashFlow' && renderCashFlow()}
    </div>
  );
}
