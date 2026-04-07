import { redirect } from "next/navigation";

export default function LegacyConversationsPage() {
  redirect("/app/restaurant/conversations");
}
