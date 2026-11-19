import React from 'react';

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
};

export const SkeletonTableRow: React.FC = () => {
  return (
    <tr className="border-b border-border-color">
      <td className="py-3.5 px-4 w-[5%]">
        <SkeletonLine className="h-4 w-6" />
      </td>
      <td className="py-3.5 px-4 w-[25%]">
        <SkeletonLine className="h-4 w-3/4" />
      </td>
      <td className="py-3.5 px-4 w-[15%]">
        <SkeletonLine className="h-4 w-1/2" />
      </td>
      <td className="py-3.5 px-4 w-[20%]">
        <SkeletonLine className="h-4 w-2/3" />
      </td>
      <td className="py-3.5 px-4 w-[15%]">
        <SkeletonLine className="h-4 w-16" />
      </td>
      <td className="py-3.5 px-4 w-[20%]">
        <SkeletonLine className="h-4 w-4/5" />
      </td>
    </tr>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 8 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-border-color overflow-hidden shadow-sm">
      <div className="bg-primary-dark p-4">
        <SkeletonLine className="h-5 w-48 bg-primary/40" />
      </div>
      <table className="w-full border-collapse">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white p-5 rounded-xl border border-border-color shadow-sm space-y-3 ${className}`}>
      <SkeletonLine className="h-5 w-1/3" />
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
    </div>
  );
};

export const SkeletonForm: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm space-y-6">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="h-10 w-full rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-10 w-full rounded-lg" />
        </div>
      </div>
      <SkeletonLine className="h-11 w-32 rounded-lg" />
    </div>
  );
};

export default SkeletonTable;
