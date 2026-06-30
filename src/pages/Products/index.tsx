import { useState } from 'react';
import { Package, TrendingUp, Target, Clock, Plus, Search, Filter, Eye, BarChart2, ShoppingCart, Warehouse } from 'lucide-react';
import Card from '@/components/Card';
import { useGameStore } from '@/stores/gameStore';
import { formatCurrency, safeToFixed } from '@/lib/utils';

const statusColors = {
  development: { bg: 'bg-accent-blue/20', text: 'text-accent-blue', label: '开发中' },
  launched: { bg: 'bg-accent-green/20', text: 'text-accent-green', label: '已上线' },
  declining: { bg: 'bg-status-danger/20', text: 'text-status-danger', label: '下滑中' },
};

type TabType = 'products' | 'businessLines' | 'markets' | 'inventory';

export default function Products() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { products, businessLines, markets, inventory } = useGameStore();

  const tabs = [
    { id: 'products' as TabType, label: '产品', icon: Package },
    { id: 'businessLines' as TabType, label: '业务线', icon: BarChart2 },
    { id: 'markets' as TabType, label: '市场', icon: Target },
    { id: 'inventory' as TabType, label: '库存', icon: Warehouse },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelectedStatus('all');
  };

  const renderProducts = () => (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="搜索产品名称或分类..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-text-muted" size={20} />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-gold/50 transition-colors"
          >
            <option value="all">全部状态</option>
            <option value="development">开发中</option>
            <option value="launched">已上线</option>
            <option value="declining">下滑中</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-gold/20 to-accent-green/20 rounded-xl flex items-center justify-center">
                  <Package className="text-accent-gold" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="text-text-secondary text-sm">{product.category}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[product.status].bg} ${statusColors[product.status].text}`}>
                {statusColors[product.status].label}
              </span>
            </div>

            <p className="text-text-secondary text-sm mb-4 line-clamp-2">{product.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-accent-green" size={16} />
                  <span className="text-text-secondary text-sm">市场份额</span>
                </div>
                <span className="text-white font-medium">{product.marketShare}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="text-accent-blue" size={16} />
                  <span className="text-text-secondary text-sm">目标市场</span>
                </div>
                <span className="text-white text-sm">{product.targetMarket}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-accent-purple" size={16} />
                  <span className="text-text-secondary text-sm">研发进度</span>
                </div>
                <span className="text-white text-sm">{product.developmentProgress}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary text-sm">研发进度</span>
                <span className="text-white text-sm">{product.developmentProgress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${product.developmentProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-accent-green font-semibold">{formatCurrency(product.revenue)}</p>
                <p className="text-text-muted text-xs">年营收</p>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Eye className="text-text-secondary" size={18} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-text-secondary">未找到匹配的产品</p>
        </div>
      )}
    </>
  );

  const renderBusinessLines = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {businessLines.map((line) => (
        <Card key={line.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center">
                <BarChart2 className="text-accent-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{line.name}</h3>
                <p className="text-text-secondary text-sm">{line.description}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${line.growthRate >= 20 ? 'bg-accent-green/20 text-accent-green' : line.growthRate >= 10 ? 'bg-accent-blue/20 text-accent-blue' : 'bg-yellow-400/20 text-yellow-400'}`}>
              {line.growthRate >= 0 ? '+' : ''}{line.growthRate}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-accent-green font-semibold">{formatCurrency(line.revenue)}</p>
              <p className="text-text-muted text-xs">营收</p>
            </div>
            <div>
              <p className="text-accent-gold font-semibold">{formatCurrency(line.profit)}</p>
              <p className="text-text-muted text-xs">利润</p>
            </div>
            <div>
              <p className="text-white font-semibold">{line.employees}</p>
              <p className="text-text-muted text-xs">员工数</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {line.products.map((product, idx) => (
              <span key={idx} className="px-3 py-1 text-xs bg-white/10 rounded-full text-text-secondary">
                {product}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  const renderMarkets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {markets.map((market) => (
        <Card key={market.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                <Target className="text-accent-green" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{market.name}</h3>
                <p className="text-text-secondary text-sm">{market.region}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-tertiary text-text-secondary">
              {formatCurrency(market.size)}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">市场份额</span>
                <span className="text-white">{market.ourShare}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="h-full bg-accent-gold rounded-full"
                  style={{ width: `${market.ourShare}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">目标份额</span>
                <span className="text-white">{market.targetShare}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="h-full bg-accent-blue rounded-full"
                  style={{ width: `${market.targetShare}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-accent-green text-sm">+{market.growthRate}%</p>
              <p className="text-text-muted text-xs">增长率</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-yellow-400 text-sm">{market.competition}%</p>
              <p className="text-text-muted text-xs">竞争度</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-accent-blue text-sm">{safeToFixed(market.targetShare > 0 ? ((market.ourShare || 0) / (market.targetShare || 1)) * 100 : 0, 0)}%</p>
              <p className="text-text-muted text-xs">目标完成</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderInventory = () => (
    <div className="glass-card p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">产品名称</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">SKU</th>
              <th className="text-right py-3 px-4 text-text-secondary text-sm font-medium">库存数量</th>
              <th className="text-right py-3 px-4 text-text-secondary text-sm font-medium">成本价</th>
              <th className="text-right py-3 px-4 text-text-secondary text-sm font-medium">售价</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">仓库</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">更新时间</th>
              <th className="text-right py-3 px-4 text-text-secondary text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="text-accent-gold" size={18} />
                    <span className="text-white">{item.productName}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-text-secondary text-sm">{item.sku}</td>
                <td className="py-4 px-4 text-right text-white font-medium">{item.quantity.toLocaleString()}</td>
                <td className="py-4 px-4 text-right text-text-secondary text-sm">{item.unitCost.toLocaleString()}</td>
                <td className="py-4 px-4 text-right text-accent-green text-sm">{item.unitPrice.toLocaleString()}</td>
                <td className="py-4 px-4 text-text-secondary text-sm">{item.warehouse}</td>
                <td className="py-4 px-4 text-text-secondary text-sm">{item.lastUpdate}</td>
                <td className="py-4 px-4 text-right">
                  <button className="px-3 py-1 text-sm bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors">
                    盘点
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-auto scrollbar-thin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">产品和业务</h1>
        <p className="text-text-secondary">管理和监控公司所有产品线的开发与运营状况</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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

      {activeTab === 'products' && renderProducts()}
      {activeTab === 'businessLines' && renderBusinessLines()}
      {activeTab === 'markets' && renderMarkets()}
      {activeTab === 'inventory' && renderInventory()}
    </div>
  );
}
