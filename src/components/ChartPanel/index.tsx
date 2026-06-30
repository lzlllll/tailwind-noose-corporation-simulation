import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useGameStore } from '@/stores/gameStore';
import { generateMarketShareData, generateRevenueSourceData, generateRevenueByRegion, generateInvestmentData } from '@/services/calculationService';

interface ChartPanelProps {
  type: 'marketShare' | 'revenueSource' | 'revenueRegion' | 'investment';
}

export default function ChartPanel({ type }: ChartPanelProps) {
  const { company, competitors, products, businessLines, markets, innovations, operations, strategies, finance, isDataGenerated } = useGameStore();

  let data: { name: string; value: number; color: string }[] = [];
  let title = '';
  let emptyMessage = '等待AI生成数据';

  switch (type) {
    case 'marketShare':
      data = generateMarketShareData();
      title = '市场份额分布';
      emptyMessage = '等待AI生成公司和竞争对手数据';
      break;
    case 'revenueSource':
      data = generateRevenueSourceData();
      title = '营收来源分布';
      emptyMessage = '等待AI生成产品或业务线数据';
      break;
    case 'revenueRegion':
      data = generateRevenueByRegion();
      title = '各地区营收分布';
      emptyMessage = '等待AI生成市场区域数据';
      break;
    case 'investment':
      data = generateInvestmentData();
      title = '投入占比分布';
      emptyMessage = '等待AI生成研发、运营或战略数据';
      break;
  }

  if (!isDataGenerated || data.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-white font-medium mb-4">{title}</h3>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-text-muted text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-white font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value.toLocaleString()}元`}
            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend 
            formatter={(value) => <span className="text-text-secondary">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}