import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBas } from "@/components/navigation/NavBas";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {children}
      <NavBas />
    </div>
  );
}
