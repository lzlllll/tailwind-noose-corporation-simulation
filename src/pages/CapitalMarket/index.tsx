import { useState } from 'react';
import { TrendingUp, TrendingDown, PieChart, CreditCard, ShoppingCart, DollarSign, X, AlertCircle } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '@/components/Card';
import { useGameStore } from '@/stores/gameStore';
import { calculateStockPrices, generateShareholdingData, calculateLoanEligibility, calculateInfluenceIndex } from '@/services/calculationService';
import { StockHolding } from '@/data/mockData';
import { formatCurrency, safeToFixed, formatPercent, asArray } from '@/lib/utils';

type TabType = 'stocks' | 'shareholding' | 'credit';

interface TradeModalState {
  isOpen: boolean;
  stockId: string;
  stockCode: string;
  companyName: string;
  currentPrice: number;
  tradeType: 'buy' | 'sell';
  shares: number;
}

export default function CapitalMarket() {
  const [activeTab, setActiveTab] = useState<TabType>('stocks');
  const [tradeModal, setTradeModal] = useState<TradeModalState>({
    isOpen: false,
    stockId: '',
    stockCode: '',
    companyName: '',
    currentPrice: 0,
    tradeType: 'buy',
    shares: 0,
  });
  const { company, isDataGenerated, playerInfo, updatePersonalCash, addStockHolding, updateStockHolding, removeStockHolding } = useGameStore();

  const stocks = calculateStockPrices();
  const shareholdings = generateShareholdingData();

  const tabs = [
    { id: 'stocks' as TabType, label: '股票市场', icon: TrendingUp },
    { id: 'shareholding' as TabType, label: '持股份额', icon: PieChart },
    { id: 'credit' as TabType, label: '信用评级', icon: CreditCard },
  ];

  const openTradeModal = (stock: typeof stocks[0], tradeType: 'buy' | 'sell') => {
    setTradeModal({
      isOpen: true,
      stockId: stock.id,
      stockCode: stock.stockCode,
      companyName: stock.companyName,
      currentPrice: stock.currentPrice,
      tradeType,
      shares: 0,
    });
  };

  const closeTradeModal = () => {
    setTradeModal({
      isOpen: false,
      stockId: '',
      stockCode: '',
      companyName: '',
      currentPrice: 0,
      tradeType: 'buy',
      shares: 0,
    });
  };

  const handleBuy = () => {
    if (!playerInfo || tradeModal.shares <= 0) return;

    const totalCost = tradeModal.shares * tradeModal.currentPrice;
    if (playerInfo.personalCash < totalCost) {
      alert('流动资金不足');
      return;
    }

    const existingHolding = asArray<StockHolding>(playerInfo.stockHoldings).find(h => h.stockId === tradeModal.stockId);

    if (existingHolding) {
      const newShares = existingHolding.shares + tradeModal.shares;
      const newTotalCost = existingHolding.averagePrice * existingHolding.shares + totalCost;
      const newAveragePrice = newTotalCost / newShares;
      const newTotalValue = newShares * tradeModal.currentPrice;
      const newProfitLoss = newTotalValue - newTotalCost;
      const newProfitLossPercent = (newProfitLoss / newTotalCost) * 100;

      updateStockHolding(existingHolding.id, {
        shares: newShares,
        averagePrice: newAveragePrice,
        currentPrice: tradeModal.currentPrice,
        totalValue: newTotalValue,
        profitLoss: newProfitLossPercent >= 0 ? newProfitLoss : -Math.abs(newProfitLoss),
        profitLossPercent: newProfitLossPercent,
      });
    } else {
      const newHolding: StockHolding = {
        id: `holding-${Date.now()}`,
        stockId: tradeModal.stockId,
        stockCode: tradeModal.stockCode,
        companyName: tradeModal.companyName,
        shares: tradeModal.shares,
        averagePrice: tradeModal.currentPrice,
        currentPrice: tradeModal.currentPrice,
        totalValue: totalCost,
        profitLoss: 0,
        profitLossPercent: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
      };
      addStockHolding(newHolding);
    }

    updatePersonalCash(-totalCost);
    closeTradeModal();
  };

  const handleSell = () => {
    if (!playerInfo || tradeModal.shares <= 0) return;

    const existingHolding = asArray<StockHolding>(playerInfo.stockHoldings).find(h => h.stockId === tradeModal.stockId);
    if (!existingHolding || existingHolding.shares < tradeModal.shares) {
      alert('持仓不足');
      return;
    }

    const totalRevenue = tradeModal.shares * tradeModal.currentPrice;

    if (existingHolding.shares === tradeModal.shares) {
      removeStockHolding(existingHolding.id);
    } else {
      const newShares = existingHolding.shares - tradeModal.shares;
      const costSold = existingHolding.averagePrice * tradeModal.shares;
      const remainingCost = existingHolding.averagePrice * newShares;
      const newTotalValue = newShares * tradeModal.currentPrice;
      const newProfitLoss = newTotalValue - remainingCost;
      const newProfitLossPercent = (newProfitLoss / remainingCost) * 100;

      updateStockHolding(existingHolding.id, {
        shares: newShares,
        currentPrice: tradeModal.currentPrice,
        totalValue: newTotalValue,
        profitLoss: newProfitLossPercent >= 0 ? newProfitLoss : -Math.abs(newProfitLoss),
        profitLossPercent: newProfitLossPercent,
      });
    }

    updatePersonalCash(totalRevenue);
    closeTradeModal();
  };

  const creditRatingInfo: Record<string, { color: string; description: string }> = {
    'AAA': { color: 'text-accent-gold', description: '信用极好，贷款资质最优' },
    'AA+': { color: 'text-accent-gold', description: '信用很好，贷款资质优秀' },
    'AA': { color: 'text-accent-green', description: '信用良好，贷款资质较好' },
    'AA-': { color: 'text-accent-green', description: '信用较好，贷款资质中等偏上' },
    'A+': { color: 'text-accent-blue', description: '信用一般，贷款资质中等' },
    'A': { color: 'text-accent-blue', description: '信用尚可，贷款资质较低' },
    'BBB': { color: 'text-status-warning', description: '信用一般偏下，贷款资质较差' },
    'BB': { color: 'text-status-warning', description: '信用偏低，贷款资质很差' },
    'B': { color: 'text-status-danger', description: '信用差，贷款资质极差' },
  };

  return (
    <div className="flex-1 p-8 overflow-auto scrollbar-thin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">资本市场</h1>
        <p className="text-text-secondary">
          {isDataGenerated
            ? '追踪股票市场动态，管理股权结构和信用评级'
            : '等待AI生成企业数据'
          }
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-transparent'
                }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'stocks' && (
        <div className="space-y-6">
          {company?.isListed && (() => {
            const playerStock = stocks.find(s => s.id === 'stock-player');
            const displayPrice = playerStock ? playerStock.currentPrice : (company.stockPrice || 0);
            const displayChange = playerStock ? playerStock.changePercent : 0;
            const displayMarketCap = playerStock ? playerStock.marketCap : (company.marketValue || 0);
            const displayPERatio = playerStock ? playerStock.peRatio : 0;
            return (
              <Card title="本企业股票">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-text-muted text-sm mb-1">股票代码</p>
                    <p className="text-white text-xl font-bold">{company.stockCode || '--'}</p>
                    <p className="text-text-muted text-xs">{company.stockExchange}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-text-muted text-sm mb-1">当前股价</p>
                    <p className="text-accent-green text-xl font-bold">
                      ¥{safeToFixed(displayPrice, 2)}
                    </p>
                    <p className={`text-xs mt-1 ${displayChange >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                      {displayChange >= 0 ? '+' : ''}{safeToFixed(displayChange, 2)}%
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-text-muted text-sm mb-1">市值</p>
                    <p className="text-white text-xl font-bold">
                      {formatCurrency(displayMarketCap)}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-text-muted text-sm mb-1">市盈率</p>
                    <p className="text-white text-xl font-bold">{safeToFixed(displayPERatio, 2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-muted text-xs">表现指数</span>
                      <span className="text-accent-green font-medium">{safeToFixed(company.performanceIndex, 0)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full">
                      <div
                        className="h-full bg-accent-green rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, company.performanceIndex || 0))}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-muted text-xs">市场预期指数</span>
                      <span className="text-accent-gold font-medium">{safeToFixed(company.marketExpectationIndex, 0)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full">
                      <div
                        className="h-full bg-accent-gold rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, company.marketExpectationIndex || 0))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })()}

          <Card title="其他上市公司">
            {!isDataGenerated || (stocks || []).length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="mx-auto text-text-muted mb-4" size={48} />
                <p className="text-text-secondary">等待AI生成竞争对手和上下游厂商数据</p>
                <p className="text-text-muted text-sm mt-2">
                  股价将根据表现指数和市场预期指数自动计算
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-text-muted text-sm border-b border-white/10">
                      <th className="text-left pb-3">股票代码</th>
                      <th className="text-left pb-3">公司名称</th>
                      <th className="text-left pb-3">交易所</th>
                      <th className="text-right pb-3">最新价</th>
                      <th className="text-right pb-3">涨跌幅</th>
                      <th className="text-right pb-3">市值</th>
                      <th className="text-right pb-3">市盈率</th>
                      <th className="text-center pb-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stocks || []).map((stock) => {
                      const holding = asArray<StockHolding>(playerInfo?.stockHoldings).find(h => h.stockId === stock.id);
                      return (
                        <tr key={stock.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 text-accent-gold font-medium">{stock.stockCode}</td>
                          <td className="py-3 text-white">{stock.companyName}</td>
                          <td className="py-3 text-text-secondary">{stock.stockExchange}</td>
                          <td className="py-3 text-right text-white font-medium">
                            ¥{safeToFixed(stock.currentPrice, 2)}
                          </td>
                          <td className={`py-3 text-right font-medium ${(stock.changePercent || 0) >= 0 ? 'text-status-success' : 'text-status-danger'
                            }`}>
                            <div className="flex items-center justify-end gap-1">
                              {(stock.changePercent || 0) >= 0
                                ? <TrendingUp size={14} />
                                : <TrendingDown size={14} />
                              }
                              {(stock.changePercent || 0) >= 0 ? '+' : ''}{safeToFixed(stock.changePercent, 2)}%
                            </div>
                          </td>
                          <td className="py-3 text-right text-text-secondary">
                            {formatCurrency(stock.marketCap)}
                          </td>
                          <td className="py-3 text-right text-text-secondary">
                            {safeToFixed(stock.peRatio, 2)}
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openTradeModal(stock, 'buy')}
                                disabled={!playerInfo}
                                className="px-3 py-1 text-xs bg-accent-green/20 text-accent-green rounded hover:bg-accent-green/30 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                买入
                              </button>
                              <button
                                onClick={() => openTradeModal(stock, 'sell')}
                                disabled={!playerInfo || !holding}
                                className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                卖出
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {(stocks || []).length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="表现指数分布">
                <div className="grid grid-cols-2 gap-4">
                  {stocks.slice(0, 6).map((stock) => (
                    <div key={stock.id} className="p-3 bg-white/5 rounded-lg">
                      <p className="text-white text-sm font-medium mb-2">{stock.companyName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted text-xs">表现指数</span>
                        <span className="text-accent-green font-medium">{stock.performanceIndex}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full mt-1">
                        <div
                          className="h-full bg-accent-green rounded-full"
                          style={{ width: `${stock.performanceIndex}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-text-muted text-xs">市场预期</span>
                        <span className="text-accent-gold font-medium">{stock.marketExpectationIndex}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full mt-1">
                        <div
                          className="h-full bg-accent-gold rounded-full"
                          style={{ width: `${stock.marketExpectationIndex}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="52周价格区间">
                <div className="space-y-3">
                  {stocks.slice(0, 6).map((stock) => (
                    <div key={stock.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm">{stock.companyName}</span>
                        <span className="text-text-muted text-xs">{stock.stockCode}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                        <span>¥{safeToFixed(stock.low52w, 2)}</span>
                        <span>¥{safeToFixed(stock.high52w, 2)}</span>
                      </div>
                      <div className="relative w-full h-2 bg-white/10 rounded-full">
                        <div
                          className="absolute h-full bg-accent-gold/50 rounded-full"
                          style={{
                            left: `${stock.high52w && stock.low52w && stock.high52w !== stock.low52w ? (((stock.currentPrice || 0) - (stock.low52w || 0)) / ((stock.high52w || 0) - (stock.low52w || 0))) * 100 : 0}%`,
                            width: '4px',
                            transform: 'translateX(-50%)'
                          }}
                        />
                      </div>
                      <p className="text-center text-white text-sm mt-2">
                        当前: ¥{safeToFixed(stock.currentPrice, 2)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'shareholding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="股权结构">
            {!isDataGenerated || (shareholdings || []).length === 0 ? (
              <div className="text-center py-12">
                <PieChart className="mx-auto text-text-muted mb-4" size={48} />
                <p className="text-text-secondary">等待AI生成股权结构数据</p>
              </div>
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={shareholdings}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {shareholdings.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value}%`}
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      formatter={(value) => <span className="text-text-secondary">{value}</span>}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="股东详情">
            {!isDataGenerated || (shareholdings || []).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-muted">等待数据生成</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shareholdings.map((sh, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{sh.name}</span>
                      <span className="text-accent-gold font-bold">{sh.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full mb-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${sh.value}%`, backgroundColor: sh.color }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-text-muted mb-2">
                      <span>持股数: {formatCurrency(sh.shares)}股</span>
                      <span>类型: {sh.type}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-text-muted text-xs">影响力指数</span>
                      <span className={`font-bold text-xs ${sh.influence >= 80 ? 'text-accent-gold' : sh.influence >= 50 ? 'text-accent-green' : 'text-text-secondary'}`}>
                        {sh.influence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'credit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="信用评级">
            {!isDataGenerated || !company?.creditRating ? (
              <div className="text-center py-12">
                <CreditCard className="mx-auto text-text-muted mb-4" size={48} />
                <p className="text-text-secondary">等待AI生成信用评级</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`text-7xl font-bold mb-4 ${creditRatingInfo[company.creditRating]?.color || 'text-white'}`}>
                  {company.creditRating}
                </div>
                <p className="text-text-secondary text-lg mb-4">
                  {creditRatingInfo[company.creditRating]?.description || '暂无评级'}
                </p>
                <div className="p-4 bg-white/5 rounded-lg inline-block">
                  <p className="text-text-muted text-sm">贷款资质参数</p>
                  <p className="text-accent-gold text-2xl font-bold mt-1">
                    {calculateLoanEligibility(
                      company.creditRating || 'A',
                      company.creditScore || 50,
                      company.marketValue || 0
                    )}
                  </p>
                  <p className="text-text-muted text-xs mt-1">参数越高，贷款额度越大</p>
                </div>
              </div>
            )}
          </Card>

          <Card title="评级说明">
            <div className="space-y-3">
              {Object.entries(creditRatingInfo).slice(0, 5).map(([rating, info]) => (
                <div key={rating} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className={`font-bold ${info.color}`}>{rating}</span>
                  <span className="text-text-secondary text-sm">{info.description}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-text-muted text-sm mb-2">信用评分</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-status-danger via-status-warning to-accent-gold rounded-full"
                    style={{ width: `${company?.creditScore || 0}%` }}
                  />
                </div>
                <span className="text-white font-bold">{company?.creditScore || '--'}</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-text-muted text-sm mb-2">公司市值</p>
              <p className="text-white text-xl font-bold">{formatCurrency(company?.marketValue || 0)}</p>
            </div>
          </Card>
        </div>
      )}

      {/* 交易弹窗 */}
      {tradeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeTradeModal} />
          <div className="relative w-[400px] bg-secondary/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {tradeModal.tradeType === 'buy'
                  ? <ShoppingCart className="w-5 h-5 text-accent-green" />
                  : <DollarSign className="w-5 h-5 text-red-400" />
                }
                <span className="text-white font-bold">
                  {tradeModal.tradeType === 'buy' ? '买入' : '卖出'} {tradeModal.companyName}
                </span>
              </div>
              <button onClick={closeTradeModal} className="p-1 hover:bg-white/10 rounded">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-text-muted text-xs">股票代码</p>
                  <p className="text-accent-gold font-medium">{tradeModal.stockCode}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-text-muted text-xs">当前价格</p>
                  <p className="text-white font-medium">¥{safeToFixed(tradeModal.currentPrice, 2)}</p>
                </div>
              </div>

              {playerInfo && (
                <div className="p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">可用资金</span>
                    <span className="text-accent-gold font-bold">
                      {formatCurrency(playerInfo.personalCash)}
                    </span>
                  </div>
                  {tradeModal.tradeType === 'sell' && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-text-secondary text-sm">持有股数</span>
                      <span className="text-white font-medium">
                        {(playerInfo && asArray<StockHolding>(playerInfo.stockHoldings).find(h => h.stockId === tradeModal.stockId)?.shares) || 0}股
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="text-text-secondary text-sm mb-2 block">交易数量（股）</label>
                <input
                  type="number"
                  value={tradeModal.shares}
                  onChange={(e) => setTradeModal(prev => ({ ...prev, shares: parseInt(e.target.value) || 0 }))}
                  min={0}
                  max={tradeModal.tradeType === 'sell'
                    ? (playerInfo ? asArray<StockHolding>(playerInfo.stockHoldings).find(h => h.stockId === tradeModal.stockId)?.shares || 0 : 0)
                    : Math.floor((playerInfo?.personalCash || 0) / tradeModal.currentPrice)
                  }
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-gold"
                />
              </div>

              <div className="p-3 bg-white/5 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">交易金额</span>
                  <span className="text-white font-bold">
                    ¥{(tradeModal.shares * tradeModal.currentPrice).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeTradeModal}
                  className="flex-1 px-4 py-2 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10"
                >
                  取消
                </button>
                <button
                  onClick={tradeModal.tradeType === 'buy' ? handleBuy : handleSell}
                  disabled={tradeModal.shares <= 0 || !playerInfo}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${tradeModal.tradeType === 'buy'
                    ? 'bg-accent-green text-primary hover:bg-accent-green/80'
                    : 'bg-red-500 text-white hover:bg-red-500/80'
                    }`}
                >
                  确认{tradeModal.tradeType === 'buy' ? '买入' : '卖出'}
                </button>
              </div>

              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-status-warning mt-0.5" />
                  <p className="text-text-muted text-xs">
                    大额交易可能引起市场关注，AI将根据购买比例确定市场反应和次日股价走势
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}