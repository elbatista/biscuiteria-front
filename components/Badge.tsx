import React from 'react';

type BadgeProps = {
    children: React.ReactNode;
    border?: boolean;
};

const Badge: React.FC<BadgeProps> = ({ children, border = false }) => (
    <span className={`inline-flex items-center rounded-full bg-[var(--rose-100)] px-3 py-1 text-xs font-medium text-[var(--rose-500)] ${border ? 'border border-[var(--rose-300)]' : ''}`}>
      {children}
    </span>
);

export default Badge;