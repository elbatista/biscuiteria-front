
import React from 'react';
import Link from 'next/link';

type ButtonProps = {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary";
    icon?: React.ReactNode;
    target?: string
};

const Button: React.FC<ButtonProps> = ({ children, href, variant = "primary", onClick, icon, target }) => {
  const base = "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition";

  const styles = variant === "primary"
    ? "bg-[var(--green-500)] text-white hover:bg-[var(--green-300)] shadow-sm"
    : "bg-[var(--rose-100)] text-[var(--rose-500)] hover:bg-[var(--rose-300)] border border-[var(--rose-300)]";

  return  href ? (
    <Link target={target} href={href} className={`${base} ${styles}`}>
      {children}
      {icon && <span className="ml-2">{icon}</span>}
    </Link>
  ) : (
    <button className={`${base} ${styles} cursor-pointer`} onClick={onClick}>
      {children}
      {icon && <div className="ml-2">{icon}</div>}
    </button>
  );
}

export default Button;