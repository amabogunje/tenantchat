import { redirect } from "next/navigation";

export default function LegacyChannelPage() {
  redirect("/app/restaurant/settings");
}
