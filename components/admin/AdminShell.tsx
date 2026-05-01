import AdminGlobalWarnings from "@/components/admin/AdminGlobalWarnings";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  globalStatus: {
    storeStatus: string;
    storeClosedMessage: string;
    announcementEnabled: boolean;
    announcementMessage: string;
    announcementLinkLabel: string;
    announcementLinkUrl: string;
  };
};

export default function AdminShell({
  children,
  user,
  globalStatus,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader user={user} />

          <AdminGlobalWarnings status={globalStatus} />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}