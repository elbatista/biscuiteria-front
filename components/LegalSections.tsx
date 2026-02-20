import Link from "next/link";

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-playfair text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
      {children}
    </h2>
  );
}


export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-zinc-900">
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
      {children}
    </p>
  );
}

export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
      {children}
    </ul>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--rose-100)] bg-white/60 p-5">
      <div className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
        {children}
      </div>
    </div>
  );
}

export function InnerSection({ children }: { children: React.ReactNode }) {
    return (
        <section className="space-y-4">{children}</section>
    );
}

export function LastUpdate ({ children }: { children: React.ReactNode }){
    return (<P> <strong className="text-[var(--rose-300)]">Última atualização: {children}</strong> </P>);
}
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL;

export function FalarWhats(){
    return whatsapp && <Link className="hover:underline text-[var(--green-500)]" target="_blank" href={whatsapp}><strong>Falar no WhatsApp</strong></Link>
}