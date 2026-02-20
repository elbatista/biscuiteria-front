import React from 'react';

interface SectionProps {
    children: React.ReactNode;
    color?: "green" | "rose";
}

const Section: React.FC<SectionProps> = ({
    children,
    color,
}) => {

    const base = "py-14 sm:py-20";
    const className =
    color === "green"
        ? `${base} bg-[var(--green-50)] border-t border-[var(--green-100)]/70`
        : color === "rose"
        ? `${base} bg-[var(--rose-50)] border-t border-[var(--rose-100)]/70`
        : `${base} bg-white`;

    return <section className={className}>{children}</section>
};

export default Section;