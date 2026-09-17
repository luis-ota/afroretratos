import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminToken } from "./admin-session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(adminCookieName())?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
