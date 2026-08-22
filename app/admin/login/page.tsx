import { redirect } from "next/navigation";

import AdminLoginForm from "./AdminLoginForm";

import { getCurrentAdminUser } from "@/lib/auth/admin-session";

type AdminLoginPageProps = {
  searchParams: Promise<{
    passwordChanged?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params =
    await searchParams;

  const user =
    await getCurrentAdminUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full">
          <AdminLoginForm
            passwordChanged={
              params.passwordChanged ===
              "1"
            }
          />
        </div>
      </div>
    </main>
  );
}