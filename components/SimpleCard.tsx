import React from 'react';

interface SimpleCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    akey?: string;
}

const SimpleCard: React.FC<SimpleCardProps> = ({
    title,
    description,
    icon,
    akey
}) => {
    return (
        <div key={akey || title}
            className="rounded-3xl border border-[var(--rose-100)] bg-white p-5 shadow-sm hover:shadow-md transition" >
            <div className="text-3xl sm:text-5xl">{icon}</div>
            <div className="mt-3 text-sm font-semibold text-zinc-900">
                {title}
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
                {description}
            </p>
        </div>
    );
};

export default SimpleCard;