import { NextResponse } from "next/server";
import { handleInboundMessage } from "@/lib/services/conversations";

export async function POST(request: Request) {
  const formData = await request.formData();
  const to = String(formData.get("To") || "");
  const from = String(formData.get("From") || "");
  const body = String(formData.get("Body") || "");
  const messageSid = String(formData.get("MessageSid") || "");

  void handleInboundMessage({ to, from, body, providerMessageId: messageSid }).catch((error) => {
    console.error("Twilio webhook processing failed", error);
  });

  return new NextResponse("ok", { status: 200 });
}
