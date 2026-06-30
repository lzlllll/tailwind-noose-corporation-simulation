import { useGameStore } from '@/stores/gameStore';
import { Target, TrendingUp, CheckCircle2, Clock, User, BarChart3 } from 'lucide-react';
import { safeToFixed, formatPercent } from '@/lib/utils';

const strategyTypeMap: Record<string, string> = {
  'market-expansion': '市场扩张',
  'product-diversification': '产品多元化',
  'cost-optimization': '成本优化',
  'innovation-leadership': '创新领先',
  'acquisition': '并购整合',
};

const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  'planning': { label: '规划中', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
  'in-progress': { label: '进行中', color: 'text-accent-blue', bgColor: 'bg-accent-blue/20' },
  'completed': { label: '已完成', color: 'text-accent-green', bgColor: 'bg-accent-green/20' },
};

export default function Strategy() {
  const { strategies } = useGameStore();

  const inProgressCount = strategies.filter(s => s.status === 'in-progress').length;
  const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);
  const totalSpent = strategies.reduce((sum, s) => sum + s.spent, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">发展战略</h1>
        <p className="text-text-secondary mt-1">规划企业未来发展方向，制定长期战略目标</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex items-center justify-center">
              <Target className="text-accent-blue" size={24} />
            </div>
            <div>
              <p className="text-text-secondary text-sm">战略总数</p>
              <p className="text-2xl font-bold text-white">{strategies.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent-green/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-accent-green" size={24} />
            </div>
            <div>
              <p className="text-text-secondary text-sm">进行中</p>
              <p className="text-2xl font-bold text-white">{inProgressCount}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent-gold/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-accent-gold" size={24} />
            </div>
            <div>
              <p className="text-text-secondary text-sm">预算执行率</p>
              <p className="text-2xl font-bold text-white">{formatPercent(totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0, 1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">战略列表</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-white/10 rounded-full text-text-secondary hover:text-white transition-colors">全部</button>
            <button className="px-3 py-1 text-sm bg-accent-blue/20 rounded-full text-accent-blue">进行中</button>
            <button className="px-3 py-1 text-sm bg-yellow-400/20 rounded-full text-yellow-400">规划中</button>
            <button className="px-3 py-1 text-sm bg-accent-green/20 rounded-full text-accent-green">已完成</button>
          </div>
        </div>

        <div className="space-y-4">
          {strategies.map((strategy) => {
            const status = statusMap[strategy.status];
            return (
              <div key={strategy.id} className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${status.bgColor} ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="px-2 py-1 text-xs bg-tertiary rounded-full text-text-secondary">
                        {strategyTypeMap[strategy.type]}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mt-2">{strategy.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-secondary text-sm">预算</p>
                    <p className="text-lg font-semibold text-accent-gold">{safeToFixed((strategy.budget || 0) / 100000000, 1)}亿</p>
                    <p className="text-xs text-text-secondary">已花费 {safeToFixed((strategy.spent || 0) / 100000000, 1)}亿</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text-secondary">进度</span>
                    <span className="text-white">{strategy.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${strategy.progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                      <Clock size={14} />
                      时间范围
                    </div>
                    <p className="text-sm text-white">{strategy.startDate} - {strategy.endDate}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                      <User size={14} />
                      负责人
                    </div>
                    <p className="text-sm text-white">{strategy.responsible}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                      <Target size={14} />
                      目标数量
                    </div>
                    <p className="text-sm text-white">{strategy.objectives.length} 个</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-text-secondary mb-2">战略目标</p>
                  <div className="flex flex-wrap gap-2">
                    {strategy.objectives.map((obj, idx) => (
                      <span key={idx} className="px-3 py-1 text-xs bg-accent-gold/10 text-accent-gold rounded-full">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-text-secondary mb-3">关键指标</p>
                  <div className="grid grid-cols-3 gap-3">
                    {strategy.keyMetrics.map((metric, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-text-secondary mb-1">{metric.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">{metric.current}</span>
                          <span className="text-xs text-text-secondary">/ {metric.target}</span>
                        </div>
                        <div className="progress-bar mt-2">
                          <div
                            className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full"
                            style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
