import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth/jwt";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function ClinicianLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/login");

  try {
    const payload = await verifyToken(token);
    const clinician = {
      name: (payload.name as string) ?? "Unknown",
      role: (payload.role as string) ?? "TRIAGE_NURSE",
      email: (payload.email as string) ?? "",
    };

    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar clinician={clinician} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  } catch {
    redirect("/login");
  }
}
