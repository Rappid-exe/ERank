import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ethical Financial Instrument Ranking",
  description: "Evaluate stocks, ETFs, and companies based on morality, social impact, and halal compliance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-4 py-3 flex gap-6 items-center">
            <Link href="/" className="font-bold text-lg text-gray-800 hover:text-blue-600">
              E-Rank Scorer
            </Link>
            <Link href="/picker" className="font-semibold text-gray-600 hover:text-blue-600">
              Stock Picker
            </Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
