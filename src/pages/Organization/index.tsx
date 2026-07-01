import { useState } from 'react';
import { Users, Building2, Briefcase, Award, Search, Plus, ChevronRight, Building, Globe } from 'lucide-react';
import Card from '@/components/Card';
import { useGameStore } from '@/stores/gameStore';
import { formatCurrency } from '@/lib/utils';

const levelColors = {
  executive: { bg: 'bg-accent-gold/20', text: 'text-accent-gold', label: '高管' },
  manager: { bg: 'bg-accent-blue/20', text: 'text-accent-blue', label: '经理' },
  senior: { bg: 'bg-accent-green/20', text: 'text-accent-green', label: '资深' },
  junior: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: '初级' },
};

const subsidiaryStatusMap: Record<string, { label: string; color: string }> = {
  'wholly-owned': { label: '全资子公司', color: 'bg-accent-green/20 text-accent-green' },
  'joint-venture': { label: '合资公司', color: 'bg-accent-blue/20 text-accent-blue' },
  'affiliate': { label: '关联公司', color: 'bg-accent-purple/20 text-accent-purple' },
};

type TabType = 'departments' | 'management' | 'employees' | 'subsidiaries';

export default function Organization() {
  const [activeTab, setActiveTab] = useState<TabType>('departments');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const { employees, departmentsData, subsidiaries } = useGameStore();

  const tabs = [
    { id: 'departments' as TabType, label: '部门', icon: Building2 },
    { id: 'management' as TabType, label: '管理层', icon: Award },
    { id: 'employees' as TabType, label: '员工', icon: Users },
    { id: 'subsidiaries' as TabType, label: '子公司', icon: Building },
  ];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || employee.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const managementEmployees = (employees || []).filter(e => e.level === 'executive' || e.level === 'manager');

  const stats = {
    total: (employees || []).length,
    executives: (employees || []).filter(e => e.level === 'executive').length,
    managers: (employees || []).filter(e => e.level === 'manager').length,
    seniors: (employees || []).filter(e => e.level === 'senior').length,
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelectedDepartment('all');
  };

  const renderDepartments = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">组织架构</h2>
        <div className="space-y-2">
          {departmentsData.map((dept) => (
            <div key={dept.id} className="border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedDept(expandedDept === dept.id ? null : dept.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="text-accent-blue" size={20} />
                  <div className="text-left">
                    <p className="text-white font-medium">{dept.name}</p>
                    <p className="text-text-muted text-xs">{dept.head} · {dept.employees}人</p>
                  </div>
                </div>
                <ChevronRight
                  className={`text-text-muted transition-transform ${expandedDept === dept.id ? 'rotate-90' : ''}`}
                  size={20}
                />
              </button>
              {expandedDept === dept.id && (
                <div className="p-4 bg-white/5 border-t border-white/10">
                  <p className="text-text-secondary text-sm">部门预算: {formatCurrency(dept.budget)}</p>
                  <div className="mt-3 progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min((dept.employees / 1000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">部门概览</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {departmentsData.map((dept) => (
              <div key={dept.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                    <Building2 className="text-accent-blue" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{dept.name}</p>
                    <p className="text-text-muted text-xs">{dept.head}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-xs">员工数</span>
                  <span className="text-white font-semibold">{dept.employees}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderManagement = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">高管团队</h2>
        <div className="space-y-4">
          {managementEmployees.filter(e => e.level === 'executive').map((employee) => (
            <div key={employee.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-accent-gold/30 to-accent-green/30 rounded-full flex items-center justify-center">
                <span className="text-accent-gold font-bold text-lg">{employee.avatar}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold">{employee.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent-gold/20 text-accent-gold">高管</span>
                </div>
                <p className="text-accent-blue text-sm">{employee.role}</p>
                <p className="text-text-muted text-xs">{employee.department}</p>
              </div>
              <div className="text-right">
                <p className="text-accent-green font-semibold">{formatCurrency(employee.salary)}</p>
                <p className="text-text-muted text-xs">年薪</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">中层管理</h2>
        <div className="grid grid-cols-2 gap-4">
          {managementEmployees.filter(e => e.level === 'manager').map((employee) => (
            <div key={employee.id} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent-blue/20 rounded-full flex items-center justify-center">
                  <span className="text-accent-blue font-semibold">{employee.avatar}</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{employee.name}</p>
                  <p className="text-text-muted text-xs">{employee.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-xs">绩效</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 progress-bar">
                    <div
                      className="h-full bg-accent-blue rounded-full"
                      style={{ width: `${employee.performance}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">{employee.performance}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderEmployees = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-accent-gold/20 rounded-xl flex items-center justify-center mb-3">
            <Users className="text-accent-gold" size={24} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-text-secondary text-sm">总员工数</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-accent-gold/20 rounded-xl flex items-center justify-center mb-3">
            <Award className="text-accent-gold" size={24} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.executives}</p>
          <p className="text-text-secondary text-sm">高管</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-accent-blue/20 rounded-xl flex items-center justify-center mb-3">
            <Briefcase className="text-accent-blue" size={24} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.managers}</p>
          <p className="text-text-secondary text-sm">经理</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-accent-green/20 rounded-xl flex items-center justify-center mb-3">
            <Users className="text-accent-green" size={24} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.seniors}</p>
          <p className="text-text-secondary text-sm">资深员工</p>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="搜索员工姓名或职位..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-gold/50 transition-colors"
        >
          <option value="all">全部部门</option>
          {departmentsData.map((dept) => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-gold/20 to-accent-green/20 rounded-full flex items-center justify-center">
                  <span className="text-accent-gold font-semibold">{employee.avatar}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{employee.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[employee.level]?.bg || 'bg-white/10'} ${levelColors[employee.level]?.text || 'text-white'}`}>
                      {levelColors[employee.level]?.label || employee.level}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm">{employee.role} · {employee.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-accent-green font-semibold">{formatCurrency(employee.salary)}</p>
                  <p className="text-text-muted text-xs">年薪</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 progress-bar">
                    <div
                      className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full"
                      style={{ width: `${employee.performance}%` }}
                    />
                  </div>
                  <span className="text-white text-sm w-8">{employee.performance}%</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-16">
          <Users className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-text-secondary">未找到匹配的员工</p>
        </div>
      )}
    </>
  );

  const renderSubsidiaries = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {subsidiaries.map((sub) => {
        const statusInfo = subsidiaryStatusMap[sub.status];
        return (
          <Card key={sub.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                  <Building className="text-accent-green" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{sub.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="text-text-muted" size={14} />
                    <span className="text-text-secondary text-sm">{sub.location}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white font-semibold">{sub.employees}</p>
                <p className="text-text-muted text-xs">员工数</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-accent-green font-semibold">{formatCurrency(sub.revenue)}</p>
                <p className="text-text-muted text-xs">营收</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className={sub.profit >= 0 ? 'text-accent-green font-semibold' : 'text-status-danger font-semibold'}>
                  {sub.profit >= 0 ? '+' : ''}{formatCurrency(sub.profit)}
                </p>
                <p className="text-text-muted text-xs">利润</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-text-secondary text-sm">所属行业</span>
                <p className="text-white text-sm mt-1">{sub.industry}</p>
              </div>
              <div className="text-right">
                <span className="text-text-secondary text-sm">持股比例</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-20 progress-bar">
                    <div
                      className="h-full bg-accent-gold rounded-full"
                      style={{ width: `${sub.ownership}%` }}
                    />
                  </div>
                  <span className="text-accent-gold font-semibold">{sub.ownership}%</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-auto scrollbar-thin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">组织管理</h1>
        <p className="text-text-secondary">管理企业组织架构和员工信息</p>
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

      {activeTab === 'departments' && renderDepartments()}
      {activeTab === 'management' && renderManagement()}
      {activeTab === 'employees' && renderEmployees()}
      {activeTab === 'subsidiaries' && renderSubsidiaries()}
    </div>
  );
}
