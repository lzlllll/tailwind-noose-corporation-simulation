import {
  LayoutDashboard,
  Package,
  Activity,
  Users,
  DollarSign,
  Lightbulb,
  Globe,
  Users2,
  Compass,
  TrendingUp,
  Wallet,
  ChevronRight
} from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { formatCurrency } from '@/lib/utils';

const navItems = [
  { id: '/', label: '集团概览', icon: LayoutDashboard },
  { id: '/strategy', label: '发展战略', icon: Compass },
  { id: '/products', label: '产品和业务', icon: Package },
  { id: '/operations', label: '运营', icon: Activity },
  { id: '/organization', label: '组织', icon: Users },
  { id: '/finance', label: '财务', icon: DollarSign },
  { id: '/capital', label: '资本市场', icon: TrendingUp },
  { id: '/innovation', label: '创新', icon: Lightbulb },
  { id: '/external', label: '外部', icon: Globe },
  { id: '/npc', label: 'NPC', icon: Users2 },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, playerInfo, setPersonalPanelOpen, company } = useGameStore();

  return (
    <aside className="w-64 bg-secondary/80 backdrop-blur-lg border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-green rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-lg">星</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{company?.name || '集团管理系统'}</h1>
            <p className="text-xs text-text-secondary">集团管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`nav-item w-full text-left ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => setPersonalPanelOpen(true)}
          className="glass-card p-4 w-full text-left hover:bg-white/5 transition-colors cursor-pointer group"
          disabled={!playerInfo}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-green rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {playerInfo?.name || '玩家'}
                </p>
                <p className="text-xs text-text-secondary">
                  {playerInfo?.title || '董事长'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-text-secondary">流动资金</span>
            <span className="text-sm font-semibold text-accent-gold">
              {playerInfo ? formatCurrency(playerInfo.personalCash) : '0'}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
