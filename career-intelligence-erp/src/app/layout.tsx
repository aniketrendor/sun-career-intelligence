import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SUN Career Intelligence ERP – Sandip University",
  description: "Next-generation institutional career intelligence, psychometric profiling, and student development ERP platform at Sandip University.",
  keywords: ["career intelligence", "sandip university", "psychometrics", "skill gaps", "learning roadmap", "higher education ERP"],
  icons: {
    icon: "/sun-career-intelligence-logo.png",
    apple: "/sun-career-intelligence-logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans scroll-smooth`}>
      <body className="min-h-screen bg-[#F7EEDB] text-[#1C1C1C] font-sans antialiased selection:bg-[#FF6B3D] selection:text-white">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
