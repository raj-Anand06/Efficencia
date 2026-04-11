import React from 'react';

function DashboardMetricCard({
  title,
  value,
  helperText,
  accentClass,
  icon: Icon,
}) {
  return (
    <div className="dashboard-surface group relative overflow-hidden rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="dashboard-subtle text-xs font-semibold uppercase tracking-[0.28em]">
            {title}
          </p>
        </div>
        <div className="dashboard-soft-surface dashboard-muted rounded-2xl p-3">
          <Icon className="text-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="dashboard-text text-3xl font-semibold tracking-tight">{value}</p>
        <p className="dashboard-subtle text-sm leading-6">{helperText}</p>
      </div>
    </div>
  );
}

export default DashboardMetricCard;
