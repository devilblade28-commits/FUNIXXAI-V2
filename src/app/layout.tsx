import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Funixx AI - Multi-Provider AI Chat",
  description: "Aplikasi chat AI dengan dukungan multi-provider: Ollama Cloud (19 model), Gemini, dan Claude. Dibuat di Indonesia.",
  keywords: ["Funixx AI", "AI Chat", "Ollama", "Gemini", "Claude", "Multi-Provider", "Indonesia"],
  authors: [{ name: "Funixx AI Team" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Funixx AI - Multi-Provider AI Chat",
    description: "Chat AI dengan Ollama Cloud, Gemini, dan Claude",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
