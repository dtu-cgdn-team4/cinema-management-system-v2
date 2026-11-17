import React from 'react';

const AGE_CONFIG = {
  T18: {
    label: 'T18',
    title: 'Phim dành cho khán giả từ đủ 18 tuổi trở lên',
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-500',
  },
  T16: {
    label: 'T16',
    title: 'Phim dành cho khán giả từ đủ 16 tuổi trở lên',
    bg: 'bg-orange-500',
    text: 'text-white',
    border: 'border-orange-400',
  },
  T13: {
    label: 'T13',
    title: 'Phim dành cho khán giả từ đủ 13 tuổi trở lên',
    bg: 'bg-amber-500',
    text: 'text-white',
    border: 'border-amber-400',
  },
  P: {
    label: 'P',
    title: 'Phim phổ biến cho mọi lứa tuổi',
    bg: 'bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-500',
  },
  K: {
    label: 'K',
    title: 'Khán giả dưới 13 tuổi xem cùng phụ huynh hoặc người giám hộ',
    bg: 'bg-cyan-600',
    text: 'text-white',
    border: 'border-cyan-500',
  },
};

export default function AgeBadge({ rating = 'P', size = 'md', className = '' }) {
  const config = AGE_CONFIG[rating] || AGE_CONFIG['P'];

  const sizeClasses = {
    sm: 'text-[10px] font-bold px-1.5 py-0.5 rounded',
    md: 'text-xs font-bold px-2 py-0.5 rounded-md',
    lg: 'text-sm font-extrabold px-2.5 py-1 rounded-md shadow-sm',
  };

  return (
    <span
      title={config.title}
      className={`inline-flex items-center justify-center tracking-wider uppercase font-semibold ${config.bg} ${config.text} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {config.label}
    </span>
  );
}

