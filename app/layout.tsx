import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import SupabaseSetupWarning from "@/components/SupabaseSetupWarning";
import { initMonitoring } from "@/lib/monitoring";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Play Zone - Book Sports Courts Online",
  description: "Book sports courts online on Play Zone - Football, Cricket, Paddle, and more",
  keywords: ["sports", "booking", "courts", "football", "cricket", "play zone"],
  icons: {
    icon: [
      { url: "/branding/playzone/favicon.svg", type: "image/svg+xml" },
      { url: "/branding/playzone/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/branding/playzone/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

// Initialize monitoring in production
if (process.env.NODE_ENV === "production") {
  initMonitoring();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>
          <Container>{children}</Container>
        </main>
        <Footer />
        <SupabaseSetupWarning />
      </body>
    </html>
  );
}
