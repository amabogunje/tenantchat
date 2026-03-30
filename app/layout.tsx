import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TenantChat",
  description: "Multi-tenant WhatsApp AI customer support platform for small businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,226,186,0.55),_transparent_35%),linear-gradient(180deg,_rgba(248,245,239,1),_rgba(255,255,255,1))] px-4">
          {children}
        </div>
      </body>
    </html>
  );
}
