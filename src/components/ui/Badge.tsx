import React from 'react';
import { StatusFisik } from '@/types';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

export interface BadgeProps {
  variant: StatusFisik | 'ADMIN' | 'USER';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, size = 'sm', className = '' }) => {
  let colorClasses = '';
  let dotColor = '';
  let label = '';

  if (variant === 'ADMIN') {
    colorClasses = 'bg-blue-100 text-blue-800 border-blue-200';
    dotColor = 'bg-blue-600';
    label = 'ADMINISTRATOR';
  } else if (variant === 'USER') {
    colorClasses = 'bg-indigo-100 text-indigo-800 border-indigo-200';
    dotColor = 'bg-indigo-600';
    label = 'PETUGAS ARSIP';
  } else {
    colorClasses = getStatusColor(variant);
    label = getStatusLabel(variant).toUpperCase();

    switch (variant) {
      case 'TERSEDIA':
        dotColor = 'bg-green-600';
        break;
      case 'DIPINJAM':
        dotColor = 'bg-yellow-500';
        break;
      case 'RUSAK':
        dotColor = 'bg-red-600';
        break;
      case 'HILANG':
        dotColor = 'bg-gray-600';
        break;
      default:
        dotColor = 'bg-gray-400';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide uppercase font-sans ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      {label}
    </span>
  );
};

export default Badge;
