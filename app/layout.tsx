import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Pregoway - Predictive Maternal Health",
  description: "AI-Powered pregnancy companion for safer motherhood",
};

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import GoogleTranslate from "@/components/GoogleTranslate";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${poppins.variable} font-sans antialiased bg-gray-50 text-gray-900`}
      >
        <AuthProvider>
          <ToastProvider>
            {children}
            <GoogleTranslate />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
