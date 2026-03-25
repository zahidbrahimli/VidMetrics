import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VidMetrics Lite | YouTube Analyzer",
  description: "Instantly discover which videos are performing best on any YouTube channel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">V</div>
              <span className="font-semibold text-xl tracking-tight text-slate-900 dark:text-white">VidMetrics</span>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Features</span>
              <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Pricing</span>
            </nav>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500 dark:text-slate-400 mt-auto">
          <p>© {new Date().getFullYear()} VidMetrics Lite. MVP Demo.</p>
        </footer>
      </body>
    </html>
  );
}
