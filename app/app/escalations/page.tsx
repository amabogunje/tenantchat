import { redirect } from "next/navigation";

export default function LegacyEscalationsPage() {
  redirect("/app/restaurant/conversations");
}
