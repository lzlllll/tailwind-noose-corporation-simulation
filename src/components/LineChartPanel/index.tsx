import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGameStore } from '@/stores/gameStore';
import { generateRevenueTrendData, generateMarketShareTrendData } from '@/services/calculationService';

interface LineChartPanelProps {
  type: 'revenueTrend' | 'marketShareTrend';
}

export default function LineChartPanel({ type }: LineChartPanelProps) {
  const { financeHistory, company, competitors, isDataGenerated } = useGameStore();

  let data: any[] = [];
  let title = '';
  let emptyMessage = '等待AI生成数据';
  let lines: { dataKey: string; name: string; color: string }[] = [];

  switch (type) {
    case 'revenueTrend':
      data = generateRevenueTrendData();
      title = '营收趋势';
      emptyMessage = '等待AI生成财务历史数据';
      lines = [
        { dataKey: 'revenue', name: '营收', color: '#f59e0b' },
        { dataKey: 'expenses', name: '支出', color: '#ef4444' },
        { dataKey: 'profit', name: '利润', color: '#10b981' },
      ];
      break;
    case 'marketShareTrend':
      data = generateMarketShareTrendData();
      title = '市场份额趋势';
      emptyMessage = '等待AI生成公司和竞争对手数据';
      lines = [
        { dataKey: 'ourShare', name: '本企业', color: '#f59e0b' },
        { dataKey: 'competitor1Share', name: '竞争者1', color: '#3b82f6' },
        { dataKey: 'competitor2Share', name: '竞争者2', color: '#10b981' },
      ];
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
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
            formatter={(value: number) => value.toLocaleString()}
          />
          <Legend formatter={(value) => <span className="text-text-secondary">{value}</span>} />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ fill: line.color, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}