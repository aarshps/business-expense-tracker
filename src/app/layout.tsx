import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import EnvironmentFooter from "@/components/EnvironmentFooter";

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
  description: "Track business expenses and employee investments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Business Expense Tracker
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="hover:text-gray-300">
                Employees
              </Link>
              <Link href="/expenses" className="hover:text-gray-300">
                Expenses
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <EnvironmentFooter />
      </body>
    </html>
  );
}
