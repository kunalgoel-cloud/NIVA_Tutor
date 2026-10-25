import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { ScreenTimeGuard } from "@/components/ScreenTimeGuard";
import { OfflineBanner } from "@/components/layout/OfflineBanner";

export const metadata: Metadata = {
  title: "Little Wonder World",
  description: "A private, gentle early-learning world for young children.",
  appleWebApp: { capable: true, title: "Little Wonder World", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fff8ec" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="sky-bg antialiased">
        <AppProvider>
          <OfflineBanner />
          <ScreenTimeGuard>{children}</ScreenTimeGuard>
        </AppProvider>
      </body>
    </html>
  );
}
