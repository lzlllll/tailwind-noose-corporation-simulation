import { useState } from 'react';
import { Activity, CheckCircle, Clock, AlertCircle, AlertTriangle, User, Calendar, Plus, Search, Factory, Truck, Link2, Building2 } from 'lucide-react';
import Card from '@/components/Card';
import { useGameStore } from '@/stores/gameStore';
import { formatCurrency } from '@/lib/utils';

const priorityColors = {
  low: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: '低', icon: Clock },
  medium: { bg: 'bg-accent-blue/20', text: 'text-accent-blue', label: '中', icon: AlertCircle },
  high: { bg: 'bg-status-warning/20', text: 'text-status-warning', label: '高', icon: AlertTriangle },
  critical: { bg: 'bg-status-danger/20', text: 'text-status-danger', label: '紧急', icon: AlertTriangle },
};

const statusColors = {
  pending: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: '待处理' },
  'in-progress': { bg: 'bg-accent-blue/20', text: 'text-accent-blue', label: '进行中' },
  completed: { bg: 'bg-accent-green/20', text: 'text-accent-green', label: '已完成' },
};

const factoryTypeMap: Record<string, { label: string; color: string; icon: typeof Factory }> = {
  factory: { label: '工厂', color: 'bg-accent-gold/20 text-accent-gold', icon: Factory },
  warehouse: { label: '仓库', color: 'bg-accent-blue/20 text-accent-blue', icon: Building2 },
  office: { label: '办公区', color: 'bg-accent-green/20 text-accent-green', icon: Building2 },
  'data-center': { label: '数据中心', color: 'bg-accent-purple/20 text-accent-purple', icon: Server },
};

const factoryStatusMap: Record<string, { label: string; color: string }> = {
  active: { label: '运营中', color: 'bg-accent-green/20 text-accent-green' },
  maintenance: { label: '维护中', color: 'bg-yellow-400/20 text-yellow-400' },
  expanding: { label: '扩建中', color: 'bg-accent-blue/20 text-accent-blue' },
};

const supplyChainTypeMap: Record<string, { label: string; color: string }> = {
  supplier: { label: '供应商', color: 'bg-accent-green/20 text-accent-green' },
  distributor: { label: '分销商', color: 'bg-accent-blue/20 text-accent-blue' },
  partner: { label: '合作伙伴', color: 'bg-accent-purple/20 text-accent-purple' },
};

const logisticsStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待发货', color: 'bg-text-muted/20 text-text-muted' },
  'in-transit': { label: '运输中', color: 'bg-accent-blue/20 text-accent-blue' },
  delivered: { label: '已送达', color: 'bg-accent-green/20 text-accent-green' },
  delayed: { label: '延迟', color: 'bg-status-danger/20 text-status-danger' },
};

import { Server } from 'lucide-react';

type TabType = 'tasks' | 'factories' | 'supplyChain' | 'logistics';

export default function Operations() {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { operations, factories, supplyChain, logistics } = useGameStore();

  const tabs = [
    { id: 'tasks' as TabType, label: '任务', icon: Activity },
    { id: 'factories' as TabType, label: '工厂/设施', icon: Factory },
    { id: 'supplyChain' as TabType, label: '供应链', icon: Link2 },
    { id: 'logistics' as TabType, label: '物流', icon: Truck },
  ];

  const filteredTasks = operations.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: operations.length,
    pending: operations.filter(t => t.status === 'pending').length,
    inProgress: operations.filter(t => t.status === 'in-progress').length,
    completed: operations.filter(t => t.status === 'completed').length,
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelectedStatus('all');
  };

  const renderTasks = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-accent-gold/20 rounded-xl flex items-center justify-center mb-3">
            <Activity className="text-accent-gold" size={24} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-text-secondary text-sm">总任务数</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-text-muted/20 rounded-xl flex items-center justify-center mb-3">
            <Clock className="text-text-muted" size={24} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.pending}</p>
          <p className="text-text-secondary text-sm">待处理</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-accent-blue/20 rounded-xl flex items-center justify-center mb-3">
            <AlertCircle className="text-accent-blue" size={24} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
          <p className="text-text-secondary text-sm">进行中</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-accent-green/20 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle className="text-accent-green" size={24} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.completed}</p>
          <p className="text-text-secondary text-sm">已完成</p>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="搜索任务或负责人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedStatus === status
                ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                : 'bg-white/5 text-text-secondary hover:bg-white/10'
                }`}
            >
              {status === 'all' ? '全部' : statusColors[status as keyof typeof statusColors].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const PriorityIcon = priorityColors[task.priority]?.icon || AlertCircle;
          const taskPriority = priorityColors[task.priority] || { bg: 'bg-white/10', text: 'text-white', label: task.priority };
          const taskStatus = statusColors[task.status] || { bg: 'bg-white/10', text: 'text-white', label: task.status };
          return (
            <Card key={task.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${taskPriority.bg}`}>
                    <PriorityIcon className={taskPriority.text} size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${taskPriority.bg} ${taskPriority.text}`}>
                        {taskPriority.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${taskStatus.bg} ${taskStatus.text}`}>
                        {taskStatus.label}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm">{task.description}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-6 ml-auto">
                  <div className="flex items-center gap-2">
                    <User className="text-text-muted" size={18} />
                    <span className="text-text-secondary text-sm">{task.assignee}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-text-muted" size={18} />
                    <span className="text-text-secondary text-sm">{task.dueDate}</span>
                  </div>
                </div>
              </div>

              {task.status !== 'completed' && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary text-sm">进度</span>
                    <span className="text-white text-sm">{task.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16">
          <Activity className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-text-secondary">未找到匹配的任务</p>
        </div>
      )}
    </>
  );

  const renderFactories = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {factories.map((factory) => {
        const typeInfo = factoryTypeMap[factory.type];
        const statusInfo = factoryStatusMap[factory.status];
        const TypeIcon = typeInfo.icon;
        return (
          <Card key={factory.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
                  <TypeIcon className={typeInfo.color.replace('/20', '')} size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{factory.name}</h3>
                  <p className="text-text-secondary text-sm">{factory.location}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white font-semibold">{factory.capacity.toLocaleString()}</p>
                <p className="text-text-muted text-xs">产能</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white font-semibold">{factory.employees}</p>
                <p className="text-text-muted text-xs">员工数</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-accent-gold font-semibold">{formatCurrency(factory.monthlyCost)}</p>
                <p className="text-text-muted text-xs">月成本</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">利用率</span>
                <span className="text-white">{factory.utilization}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`h-full rounded-full ${factory.utilization >= 80 ? 'bg-accent-green' : factory.utilization >= 60 ? 'bg-accent-gold' : 'bg-accent-blue'}`}
                  style={{ width: `${factory.utilization}%` }}
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderSupplyChain = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {supplyChain.map((item) => {
        const typeInfo = supplyChainTypeMap[item.type];
        return (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
                  <Link2 className={typeInfo.color.replace('/20', '')} size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <p className="text-text-secondary text-sm">{item.company}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-accent-green font-semibold">{item.reliability}%</p>
                <p className="text-text-muted text-xs">可靠性</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-accent-blue font-semibold">{item.deliveryTime}天</p>
                <p className="text-text-muted text-xs">交付周期</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-accent-gold font-semibold">{item.costRating}%</p>
                <p className="text-text-muted text-xs">成本评级</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">合同状态</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.contractStatus === 'active' ? 'bg-accent-green/20 text-accent-green' :
                item.contractStatus === 'negotiating' ? 'bg-accent-blue/20 text-accent-blue' :
                  'bg-status-danger/20 text-status-danger'
                }`}>
                {item.contractStatus === 'active' ? '生效中' : item.contractStatus === 'negotiating' ? '谈判中' : '已过期'}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderLogistics = () => (
    <div className="glass-card p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">运单号</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">产品名称</th>
              <th className="text-right py-3 px-4 text-text-secondary text-sm font-medium">数量</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">起运地</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">目的地</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">承运商</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">预计到达</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {logistics.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-4 px-4 text-accent-gold font-medium">{item.shipmentId}</td>
                <td className="py-4 px-4 text-white">{item.productName}</td>
                <td className="py-4 px-4 text-right text-white font-medium">{item.quantity}</td>
                <td className="py-4 px-4 text-text-secondary text-sm">{item.origin}</td>
                <td className="py-4 px-4 text-text-secondary text-sm">{item.destination}</td>
                <td className="py-4 px-4 text-text-secondary text-sm">{item.carrier}</td>
                <td className="py-4 px-4 text-text-secondary text-sm">{item.estimatedArrival}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${logisticsStatusMap[item.status].color}`}>
                    {logisticsStatusMap[item.status].label}
                  </span>
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
        <h1 className="text-3xl font-bold text-white mb-2">运营管理</h1>
        <p className="text-text-secondary">管理日常运营任务，监控效率指标</p>
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

      {activeTab === 'tasks' && renderTasks()}
      {activeTab === 'factories' && renderFactories()}
      {activeTab === 'supplyChain' && renderSupplyChain()}
      {activeTab === 'logistics' && renderLogistics()}
    </div>
  );
}
