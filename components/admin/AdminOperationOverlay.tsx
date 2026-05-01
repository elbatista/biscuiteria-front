import { Loader2 } from "lucide-react";

type AdminOperationOverlayProps = {
  show: boolean;
  title?: string;
  description?: string;
};

export default function AdminOperationOverlay({
  show,
  title = "Processando...",
  description = "Aguarde enquanto a operação é concluída.",
}: AdminOperationOverlayProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[2rem] border border-zinc-200 bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-[var(--rose-500)]">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-zinc-950">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}