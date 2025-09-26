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
      <body className={`${inter.className} overflow-x-hidden`}>
        <Navbar />
        {children}
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
