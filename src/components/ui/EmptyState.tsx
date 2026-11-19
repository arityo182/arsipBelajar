import React, { ReactNode } from 'react';
import { LucideIcon, SearchX } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Dokumen Tidak Ditemukan',
  description = 'Coba gunakan kata kunci lain atau tambahkan dokumen baru ke dalam sistem.',
  icon: Icon = SearchX,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-xl border border-dashed border-border-color ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-text-main font-sans mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;
