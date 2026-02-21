import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wedabime Pramukayo - Site Visitor Management",
  description: "Professional ceiling, roofing, and gutter insulation services in Sri Lanka. Site visitor management system by ZIPCARTCO.",
  keywords: ["insulation", "ceiling", "roofing", "gutter", "Sri Lanka", "Wedabime Pramukayo", "ZIPCARTCO"],
  authors: [{ name: "ZIPCARTCO - Mr. Ranshika Foundation's IT Company" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Wedabime Pramukayo",
    description: "Professional insulation services in Sri Lanka",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            {children}
          </LanguageProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
