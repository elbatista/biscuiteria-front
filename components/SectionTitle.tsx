import React from 'react';
import Badge from './Badge';

type SectionTitleProps = {
    eyebrow?: string;
    title: string;
    subtitle?: string;
};

const SectionTitle: React.FC<SectionTitleProps> = ({ eyebrow, title, subtitle }) => (
    <div className="space-y-3">
        {eyebrow ? <Badge>{eyebrow}</Badge> : null}
        <h2 className="font-playfair text-2xl font-semibold tracking-tight sm:text-3xl text-zinc-900">
            {title}
        </h2>
        {subtitle ? (
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            {subtitle}
        </p>
        ) : null}
    </div>
);

export default SectionTitle;