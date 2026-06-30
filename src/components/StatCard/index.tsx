import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon?: React.ReactNode;
  color?: 'gold' | 'green' | 'blue' | 'purple';
}

const colorClasses = {
  gold: 'from-accent-gold/20 to-accent-gold/5 border-accent-gold/30',
  green: 'from-accent-green/20 to-accent-green/5 border-accent-green/30',
  blue: 'from-accent-blue/20 to-accent-blue/5 border-accent-blue/30',
  purple: 'from-accent-purple/20 to-accent-purple/5 border-accent-purple/30',
};

const textColorClasses = {
  gold: 'text-accent-gold',
  green: 'text-accent-green',
  blue: 'text-accent-blue',
  purple: 'text-accent-purple',
};

export default function StatCard({ title, value, unit = '', change, icon, color = 'gold' }: StatCardProps) {
  return (
    <div className={`stat-card bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${textColorClasses[color]}`}>{value}</span>
            {unit && <span className="text-text-secondary text-sm">{unit}</span>}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-accent-green' : 'text-status-danger'}`}>
              {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(change)}%</span>
              <span className="text-text-muted">较上期</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
