import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "TRINAYORA — 3D Digital Health ID & Connected Hospital Network",
  description: "TRINAYORA: Next-generation RFID + dynamic single-use QR digital medical identity and clinical records platform powered by Supabase Cloud.",
  keywords: [
    "Health ID", "Digital Health Card", "RFID Medical Record", "Dynamic QR Health", 
    "National Medical Register", "NMR Doctor Verification", "Telemedicine", "Supabase Healthcare"
  ],
  authors: [{ name: "TRINAYORA Medical Systems" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: ["/icon.svg"]
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "TRINAYORA — 3D Digital Health ID System",
    description: "Instant clinical triage, RFID tap-to-verify, and dynamic QR single-use medical consent.",
    type: "website",
    locale: "en_US",
    siteName: "TRINAYORA",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRINAYORA — 3D Digital Health ID",
    description: "Next-gen clinical identity platform with RFID and dynamic single-use QR.",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-900" suppressHydrationWarning>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
