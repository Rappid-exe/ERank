import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider"
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="bg-white dark:bg-gray-900 shadow-sm">
            <nav className="container mx-auto px-4 py-3 flex gap-6 items-center">
              <Link href="/" className="font-bold text-lg text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                E-Rank Scorer
              </Link>
              <Link href="/picker" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Stock Picker
              </Link>
            </nav>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
