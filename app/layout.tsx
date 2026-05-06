import type { Metadata } from "next";

import { Poppins } from "next/font/google";

import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],

  weight: ["300", "400", "500", "600", "700"],

  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "PLMS",

  description: "Developed by Team SRS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>

          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
