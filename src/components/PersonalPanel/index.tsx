import { X, Wallet, Building, TrendingUp, Home, Car, PiggyBank, Briefcase } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { formatCurrency, safeToFixed } from '@/lib/utils';

const assetTypeIcons = {
  real_estate: Home,
  vehicle: Car,
  investment: TrendingUp,
  savings: PiggyBank,
  other: Briefcase,
};

const assetTypeLabels = {
  real_estate: '房产',
  vehicle: '车辆',
  investment: '投资',
  savings: '存款',
  other: '其他',
};

export default function PersonalPanel() {
  const { playerInfo, personalPanelOpen, setPersonalPanelOpen } = useGameStore();

  if (!personalPanelOpen || !playerInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setPersonalPanelOpen(false)}
      />
      <div className="relative w-[480px] max-h-[90vh] bg-secondary/95 backdrop-blur-lg border-l border-white/10 shadow-2xl overflow-hidden animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-gold to-accent-green rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{playerInfo.name}</h2>
              <p className="text-sm text-text-secondary">{playerInfo.title}</p>
            </div>
          </div>
          <button
            onClick={() => setPersonalPanelOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* 资产概览 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-text-secondary mb-1">流动资金</p>
              <p className="text-lg font-bold text-accent-gold">{formatCurrency(playerInfo.personalCash)}</p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-text-secondary mb-1">资产总值</p>
              <p className="text-lg font-bold text-white">{formatCurrency(playerInfo.totalAssets)}</p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-text-secondary mb-1">净资产</p>
              <p className="text-lg font-bold text-accent-green">{formatCurrency(playerInfo.netWorth)}</p>
            </div>
          </div>

          {/* 个人资产列表 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-accent-gold" />
              个人资产
            </h3>
            {playerInfo.personalAssets.length > 0 ? (
              <div className="space-y-2">
                {playerInfo.personalAssets.map(asset => {
                  const Icon = assetTypeIcons[asset.type];
                  return (
                    <div key={asset.id} className="glass-card p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-tertiary rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-accent-gold" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{asset.name}</p>
                          <p className="text-xs text-text-secondary">{assetTypeLabels[asset.type]}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white">{formatCurrency(asset.value)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-4 rounded-lg text-center">
                <p className="text-sm text-text-secondary">暂无个人资产记录</p>
              </div>
            )}
          </div>

          {/* 持股列表 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-gold" />
              股票持仓
            </h3>
            {playerInfo.stockHoldings.length > 0 ? (
              <div className="space-y-2">
                {playerInfo.stockHoldings.map(holding => {
                  const profitColor = holding.profitLoss >= 0 ? 'text-accent-green' : 'text-red-400';
                  return (
                    <div key={holding.id} className="glass-card p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-white">{holding.companyName}</p>
                          <p className="text-xs text-text-secondary">{holding.stockCode}</p>
                        </div>
                        <p className="text-sm font-semibold text-white">{formatCurrency(holding.totalValue)}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">
                          {holding.shares}股 · 成本 {safeToFixed(holding.averagePrice, 2)}
                        </span>
                        <span className={profitColor}>
                          {holding.profitLoss >= 0 ? '+' : ''}{formatCurrency(holding.profitLoss)}
                          ({(holding.profitLossPercent || 0) >= 0 ? '+' : ''}{safeToFixed(holding.profitLossPercent, 2)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-4 rounded-lg text-center">
                <p className="text-sm text-text-secondary">暂无股票持仓</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}