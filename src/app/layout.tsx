import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation";
import { getCachedZoneCount } from "@/lib/cached-zones";
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
  title: "Driver Zone Mapper",
  description: "Track high-demand zones for drivers",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Driver Zones",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Safely fetch zone count, fallback to 0 if database is unavailable
  let zoneCount = 0;
  try {
    zoneCount = await getCachedZoneCount();
  } catch (error) {
    console.error('Failed to fetch zone count:', error);
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Navigation zoneCount={zoneCount} />
        {children}
        <Providers />
      </body>
    </html>
  );
}
