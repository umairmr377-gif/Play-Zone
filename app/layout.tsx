import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { initMonitoring } from "@/lib/monitoring";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Play Zone - Book Sports Courts Online",
  description: "Book sports courts online on Play Zone - Football, Cricket, Paddle, and more",
  keywords: ["sports", "booking", "courts", "football", "cricket", "play zone"],
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
      </body>
    </html>
  );
}
