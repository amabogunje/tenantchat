import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/session";

export default async function ConsoleRedirectPage() {
  const { user } = await getCurrentUserContext();
  redirect(user.role === "SYSTEM_ADMIN" ? "/admin" : "/app/restaurant/overview");
}
