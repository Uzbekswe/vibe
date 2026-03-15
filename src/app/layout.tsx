import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe",
  description: "Extract the vibe of any brand — logos, colors, images & typography",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
