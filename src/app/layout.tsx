import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppFooter from "@/components/AppFooter";
import Header from "@/components/Header";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Business Expense Tracker",
  description: "Track business expenses and environment information",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-100`}
      >
        <ClientLayout>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <AppFooter />
        </ClientLayout>
      </body>
    </html>
  );
}
