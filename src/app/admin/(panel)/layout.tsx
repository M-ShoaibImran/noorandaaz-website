import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/admin/sign-out";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-4">
        <div>
          <p className="font-serif text-2xl">Noorandaaz</p>
          <p className="text-xs text-neutral-500">Owner</p>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin">Orders</Link>
          <Link href="/admin/products">Pieces</Link>
          <Link href="/" target="_blank">View shop</Link>
          <SignOutButton />
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
