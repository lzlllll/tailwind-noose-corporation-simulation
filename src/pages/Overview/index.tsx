import { Building2, Users, TrendingUp, Award, ArrowRight } from 'lucide-react';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import ChartPanel from '@/components/ChartPanel';
import LineChartPanel from '@/components/LineChartPanel';
import { useGameStore } from '@/stores/gameStore';
import { formatCurrency } from '@/lib/utils';

function CircularProgress({ value, size = 120, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#00ff88" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{value}%</span>
        <span className="text-xs text-text-secondary">完成度</span>
      </div>
    </div>
  );
}

export default function Overview() {
  const { setCurrentPage, company, finance, employees, products, isDataGenerated, gameTime } = useGameStore();

  const formatGameTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 p-8 overflow-auto scrollbar-thin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">集团概览</h1>
        <p className="text-text-secondary">
          {isDataGenerated
            ? `当前时间：${formatGameTime(gameTime)}`
            : '等待AI生成企业数据，请在右侧输入您的决策开始游戏'
          }
        </p>
      </div>

      {isDataGenerated ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="市值"
              value={company ? formatCurrency(company.marketValue) : '--'}
              unit="元"
              change={12.5}
              icon={<Building2 className="text-accent-gold" size={24} />}
              color="gold"
            />
            <StatCard
              title="营收"
              value={finance ? formatCurrency(finance.revenue) : '--'}
              unit="元"
              change={finance?.revenueGrowth || 0}
              icon={<TrendingUp className="text-accent-green" size={24} />}
              color="green"
            />
            <StatCard
              title="利润"
              value={finance ? formatCurrency(finance.profit) : '--'}
              unit="元"
              change={finance?.profitMargin || 0}
              icon={<Award className="text-accent-blue" size={24} />}
              color="blue"
            />
            <StatCard
              title="员工数"
              value={(employees || []).length > 0 ? employees.length.toString() : '--'}
              unit="人"
              change={5.8}
              icon={<Users className="text-accent-purple" size={24} />}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <LineChartPanel type="revenueTrend" />
            <LineChartPanel type="marketShareTrend" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <ChartPanel type="marketShare" />
            <ChartPanel type="revenueSource" />
            <ChartPanel type="revenueRegion" />
            <ChartPanel type="investment" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="核心产品表现">
              {(products || []).length > 0 ? (
                <div className="space-y-4">
                  {(products || []).slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-gold/20 to-accent-green/20 rounded-lg flex items-center justify-center">
                          <span className="text-accent-gold font-semibold text-sm">{product.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-text-secondary text-xs">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-accent-green font-semibold">{formatCurrency(product.revenue)}</p>
                        <p className="text-text-muted text-xs">市场份额 {product.marketShare}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-muted">等待AI生成产品数据</p>
                </div>
              )}
              <button
                onClick={() => setCurrentPage('/products')}
                className="w-full py-3 text-accent-gold hover:bg-accent-gold/10 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                查看全部产品 <ArrowRight size={16} />
              </button>
            </Card>

            <Card title="企业信息">
              {company ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent-gold/10 to-transparent rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-gold to-accent-green rounded-xl flex items-center justify-center">
                      <span className="text-primary font-bold text-2xl">{company.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{company.name}</h3>
                      <p className="text-text-secondary">{company.industry}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-text-muted text-xs">成立年份</p>
                      <p className="text-white font-semibold">{company.foundedYear}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-text-muted text-xs">品牌价值</p>
                      <p className="text-white font-semibold">{formatCurrency(company.brandValue)}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-text-muted text-xs">市场份额</p>
                      <p className="text-white font-semibold">{company.marketShare}%</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-text-muted text-xs">企业评级</p>
                      <p className="text-white font-semibold">A+ ({company.rating}分)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-muted">等待AI生成企业数据</p>
                </div>
              )}
            </Card>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-accent-gold/20 to-accent-green/20 rounded-full flex items-center justify-center mb-6">
            <Building2 className="text-accent-gold" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">等待生成数据</h2>
          <p className="text-text-secondary text-center max-w-md mb-6">
            请在右侧正文面板输入您的决策，AI将根据您的决策生成企业数据并开始游戏
          </p>
          <p className="text-text-muted text-sm">
            例如："我创立了一家科技公司，专注于AI和云计算"
          </p>
        </div>
      )}
    </div>
  );
}