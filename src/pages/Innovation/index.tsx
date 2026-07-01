import { Lightbulb, Calendar, Users, TrendingUp, Plus, Rocket, Target, Award, AlertTriangle, FileText } from 'lucide-react';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import { useGameStore } from '@/stores/gameStore';
import { formatCurrency, asArray } from '@/lib/utils';

const categoryColors = {
  '前沿技术': { bg: 'bg-accent-purple/20', text: 'text-accent-purple' },
  '人工智能': { bg: 'bg-accent-gold/20', text: 'text-accent-gold' },
  '网络安全': { bg: 'bg-accent-green/20', text: 'text-accent-green' },
  '通信技术': { bg: 'bg-accent-blue/20', text: 'text-accent-blue' },
};

export default function Innovation() {
  const { innovations } = useGameStore();

  const totalBudget = (innovations || []).reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = (innovations || []).reduce((sum, p) => sum + p.spent, 0);
  const avgProgress = (innovations || []).length > 0
    ? Math.round((innovations || []).reduce((sum, p) => sum + p.progress, 0) / (innovations || []).length)
    : 0;

  const milestones: { id: number; title: string; date: string; status: string }[] = [];

  return (
    <div className="flex-1 p-8 overflow-auto scrollbar-thin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">创新研发</h1>
        <p className="text-text-secondary">管理研发项目，推动技术创新</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="研发投入"
          value={formatCurrency(totalBudget)}
          unit="元"
          change={25.8}
          icon={<Lightbulb className="text-accent-gold" size={24} />}
          color="gold"
        />
        <StatCard
          title="已花费"
          value={formatCurrency(totalSpent)}
          unit="元"
          change={18.5}
          icon={<Rocket className="text-accent-green" size={24} />}
          color="green"
        />
        <StatCard
          title="项目数量"
          value={(innovations || []).length}
          unit="个"
          change={0}
          icon={<Target className="text-accent-blue" size={24} />}
          color="blue"
        />
        <StatCard
          title="平均进度"
          value={avgProgress}
          unit="%"
          change={5.2}
          icon={<TrendingUp className="text-accent-purple" size={24} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {innovations.map((project) => (
            <Card key={project.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${categoryColors[project.category]?.bg || 'bg-white/10'}`}>
                    <Lightbulb className={categoryColors[project.category]?.text || 'text-white'} size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[project.category]?.bg || 'bg-white/10'} ${categoryColors[project.category]?.text || 'text-text-secondary'}`}>
                        {project.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {project.deadline}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {asArray(project.team).length}人
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-accent-green font-semibold">{formatCurrency(project.spent)}</p>
                  <p className="text-text-muted text-xs">/ {formatCurrency(project.budget)}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">项目进度</span>
                  <span className="text-white text-sm">{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-accent-blue" size={16} />
                  <span className="text-text-secondary text-sm font-medium">研究进度描述</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{project.progressDescription}</p>
              </div>

              <div className="mt-4 p-4 bg-yellow-400/5 rounded-lg border border-yellow-400/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-yellow-400" size={16} />
                  <span className="text-yellow-400 text-sm font-medium">当前瓶颈</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{project.bottleneck}</p>
              </div>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Award className="text-accent-gold" size={16} />
                  <span className="text-text-secondary text-sm">预期影响力</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-2 rounded-full ${i < Math.floor(project.impact / 10) ? 'bg-accent-gold' : 'bg-white/10'}`}
                    />
                  ))}
                  <span className="ml-2 text-white text-sm">{project.impact}/100</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card title="技术路线图">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/20" />
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative pl-10">
                    <div className={`absolute left-2 w-5 h-5 rounded-full border-2 ${milestone.status === 'completed'
                      ? 'bg-accent-green border-accent-green'
                      : milestone.status === 'in-progress'
                        ? 'bg-accent-blue border-accent-blue'
                        : 'bg-white/10 border-white/20'
                      }`} />
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className={`font-medium ${milestone.status === 'completed'
                        ? 'text-accent-green'
                        : milestone.status === 'in-progress'
                          ? 'text-accent-blue'
                          : 'text-text-secondary'
                        }`}>
                        {milestone.title}
                      </p>
                      <p className="text-text-muted text-xs">{milestone.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="研发团队">
            <div className="grid grid-cols-2 gap-3">
              {['李婉清', '刘浩然', '孙伟强', '吴俊杰', '黄志强', '郑美玲'].map((member) => (
                <div key={member} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-gold/20 to-accent-green/20 rounded-full flex items-center justify-center">
                    <span className="text-accent-gold text-xs font-semibold">{member.charAt(0)}</span>
                  </div>
                  <span className="text-text-secondary text-sm">{member}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="专利申请">
            <div className="space-y-3">
              {[].map((patent: { name: string; status: string }) => (
                <div key={patent.name} className="flex items-center justify-between p-2">
                  <span className="text-text-secondary text-sm">{patent.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${patent.status === 'approved'
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-text-muted/20 text-text-muted'
                    }`}>
                    {patent.status === 'approved' ? '已授权' : '审核中'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
