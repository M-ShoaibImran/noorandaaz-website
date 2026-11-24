import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { isAdmin, showsSamplePasswordHint } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <LoginForm showHint={await showsSamplePasswordHint()} />;
}
