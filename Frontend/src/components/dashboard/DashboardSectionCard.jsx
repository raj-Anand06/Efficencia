import React from 'react';

function DashboardSectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`dashboard-surface rounded-[28px] p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="dashboard-text text-lg font-semibold tracking-tight">{title}</h2>
          {subtitle ? (
            <p className="dashboard-subtle mt-1 text-sm leading-6">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default DashboardSectionCard;
