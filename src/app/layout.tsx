import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digital Marketing Reporting Tool",
  description: "A multichannel reporting tool with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-gray-800 text-white py-4 text-center">
            <div className="container mx-auto">
              <p>© {new Date().getFullYear()} Digital Marketing Reporting Tool</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
