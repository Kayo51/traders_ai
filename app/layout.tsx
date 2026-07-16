import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeSpeak — AI Voice Receptionist for UK Trade Businesses",
  description: "Never miss a customer call again. TradeSpeak answers every call instantly, captures job details, and sends you an instant SMS alert. Built for UK plumbers, electricians and contractors.",
  keywords: "AI receptionist, UK plumbers, missed calls, trade business, voice AI, lead capture",
  openGraph: {
    title: "TradeSpeak — Never Miss a Customer Again",
    description: "AI voice receptionist that answers every call and captures job details for UK trade businesses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
