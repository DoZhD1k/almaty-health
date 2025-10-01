import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
export const metadata: Metadata = {
  title: "MedMonitor",
  description: "Мониторинг загруженности медицинских учреждений",
};

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-background via-background/95 to-background">
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
