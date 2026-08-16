import LoadingScreen from "@/components/LoadingScreen";

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
      <LoadingScreen
        title={title}
        description={description}
        fullPage={false}
        compact
      />
    </div>
  );
}