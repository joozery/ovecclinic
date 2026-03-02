import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoTh = Noto_Sans_Thai({
  variable: "--font-noto-th",
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OVEC Supervise Clinic | ระบบนิเทศและบริหารจัดการเกียรติบัตร",
  description: "ระบบนิเทศออนไลน์และบริหารจัดการเกียรติบัตรอิเล็กทรอนิกส์ สำนักงานคณะกรรมการการอาชีวศึกษา",
  icons: {
    icon: "/S__40550412.png",
    apple: "/S__40550412.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoTh.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
