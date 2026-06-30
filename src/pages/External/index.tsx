import { useState } from 'react';
import { Globe, TrendingUp, TrendingDown, Minus, Newspaper, Users, AlertCircle, ChevronRight } from 'lucide-react';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import { externalNewsData, competitorsData, marketTrends } from '@/data/mockData';

function formatCurrency(value: number): string {
  if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿';
  } else if (value >= 10000) {
    return (value / 10000).toFixed(0) + '万';
  }
  return value.toFixed(0);
}

const impactColors = {
  positive: { bg: 'bg-accent-green/20', text: 'text-accent-green', icon: TrendingUp, label: '利好' },
  negative: { bg: 'bg-status-danger/20', text: 'text-status-danger', icon: TrendingDown, label: '利空' },
  neutral: { bg: 'bg-text-muted/20', text: 'text-text-muted', icon: Minus, label: '中性' },
};

export default function External() {
  const [selectedNews, setSelectedNews] = useState<string | null>(null);

  const marketStats = {
    totalMarketSize: 68000000000,
    growthRate: 18.5,
    competitors: competitorsData.length,
    avgMarketShare: competitorsData.reduce((sum, c) => sum + c.marketShare, 0) / competitorsData.length,
  };

  return (
    <div className="flex-1 p-8 overflow-auto scrollbar-thin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">外部环境</h1>
        <p className="text-text-secondary">监控市场动态、竞争对手和政策法规</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="市场规模" 
          value={formatCurrency(marketStats.totalMarketSize)} 
          unit="元"
          change={marketStats.growthRate}
          icon={<Globe className="text-accent-gold" size={24} />}
          color="gold"
        />
        <StatCard 
          title="增长率" 
          value={marketStats.growthRate} 
          unit="%"
          change={3.2}
          icon={<TrendingUp className="text-accent-green" size={24} />}
          color="green"
        />
        <StatCard 
          title="竞争对手" 
          value={marketStats.competitors} 
          unit="家"
          change={0}
          icon={<Users className="text-accent-blue" size={24} />}
          color="blue"
        />
        <StatCard 
          title="平均份额" 
          value={marketStats.avgMarketShare} 
          unit="%"
          change={-1.5}
          icon={<AlertCircle className="text-accent-purple" size={24} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="市场动态">
            <div className="space-y-4">
              {externalNewsData.map((news) => {
                const ImpactIcon = impactColors[news.impact].icon;
                return (
                  <div 
                    key={news.id}
                    onClick={() => setSelectedNews(selectedNews === news.id ? null : news.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedNews === news.id ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${impactColors[news.impact].bg}`}>
                          <ImpactIcon className={impactColors[news.impact].text} size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium">{news.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${impactColors[news.impact].bg} ${impactColors[news.impact].text}`}>
                              {impactColors[news.impact].label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Newspaper className="text-text-muted" size={14} />
                            <span className="text-text-muted text-sm">{news.source}</span>
                            <span className="text-text-muted text-sm">· {news.date}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`text-text-muted transition-transform ${selectedNews === news.id ? 'rotate-90' : ''}`} size={20} />
                    </div>
                    {selectedNews === news.id && (
                      <div className="mt-4 p-4 bg-white/5 rounded-lg animate-fade-in">
                        <p className="text-text-secondary">{news.summary}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="竞争对手">
            <div className="space-y-4">
              {competitorsData.map((competitor) => (
                <div key={competitor.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{competitor.name}</h4>
                    <span className="text-accent-blue text-sm">{competitor.marketShare}%</span>
                  </div>
                  <div className="progress-bar mb-3">
                    <div 
                      className="h-full bg-accent-blue rounded-full"
                      style={{ width: `${competitor.marketShare}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">营收: {formatCurrency(competitor.revenue)}</span>
                    <span className="text-text-muted">{competitor.employees}人</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-accent-green text-xs">优势:</span>
                      <span className="text-text-secondary text-xs">{competitor.strength}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-status-danger text-xs">劣势:</span>
                      <span className="text-text-secondary text-xs">{competitor.weakness}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="行业趋势">
            <div className="space-y-4">
              {marketTrends.map((trend) => (
                <div key={trend.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary text-sm">{trend.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${trend.trend === 'up' ? 'bg-accent-green/20 text-accent-green' : 'bg-text-muted/20 text-text-muted'}`}>
                      {trend.trend === 'up' ? '上升' : '稳定'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${trend.value}%` }}
                      />
                    </div>
                    <span className="text-white text-sm w-6">{trend.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="政策法规">
            <div className="space-y-3">
              {[
                { name: '数据安全法', status: 'active', impact: 'medium' },
                { name: '人工智能伦理规范', status: 'draft', impact: 'high' },
                { name: '反垄断法修订', status: 'active', impact: 'low' },
                { name: '外商投资法', status: 'active', impact: 'medium' },
              ].map((policy) => (
                <div key={policy.name} className="flex items-center justify-between p-2">
                  <span className="text-text-secondary text-sm">{policy.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      policy.status === 'active' 
                        ? 'bg-accent-green/20 text-accent-green' 
                        : 'bg-status-warning/20 text-status-warning'
                    }`}>
                      {policy.status === 'active' ? '生效中' : '草案'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      policy.impact === 'high' 
                        ? 'bg-status-danger/20 text-status-danger' 
                        : policy.impact === 'medium'
                        ? 'bg-status-warning/20 text-status-warning'
                        : 'bg-accent-green/20 text-accent-green'
                    }`}>
                      {policy.impact === 'high' ? '高影响' : policy.impact === 'medium' ? '中影响' : '低影响'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
