import { after } from "next/server";
import { NextResponse } from "next/server";
import { handleInboundMessage } from "@/lib/services/conversations";

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

export async function POST(request: Request) {
  const formData = await request.formData();
  const to = String(formData.get("To") || "");
  const from = String(formData.get("From") || "");
  const body = String(formData.get("Body") || "");
  const messageSid = String(formData.get("MessageSid") || "");

  after(async () => {
    try {
      await handleInboundMessage({ to, from, body, providerMessageId: messageSid });
    } catch (error) {
      console.error("Twilio webhook processing failed", error);
    }
  });

  return new NextResponse(EMPTY_TWIML, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
}
