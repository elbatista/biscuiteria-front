import Link from 'next/link';
import React from 'react';

interface LinkCardProps {
    akey?: string;
    href?: string;
    title: string;
    description?: string;
    tag?: React.ReactNode;
    linktext?: string;
    target?:string;
}

const LinkCard: React.FC<LinkCardProps> = ({
    title,
    description,
    tag,
    akey,
    href,
    linktext,
    target
}) => {
    return (
        <Link key={akey || title}
            href={href || "#"}
            target={target}
            className="group rounded-3xl border border-[var(--green-100)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-semibold text-zinc-900">
                        {title}
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                        {description}
                    </p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--rose-100)] text-4xl sm:text-5xl">
                    {tag}
                </div>
            </div>
            <div className="mt-5 text-sm font-semibold text-[var(--green-500)]">
                {linktext || "Explorar"}{" "} <span className="transition group-hover:translate-x-0.5 inline-block"> → </span>
            </div>
        </Link>
    );
};

export default LinkCard;