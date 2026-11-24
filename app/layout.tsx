import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "TFTLore – Bách khoa toàn thư Đấu Trường Chân Lý",
  description:
    "Tra cứu 18 mùa giải Đấu Trường Chân Lý (kể cả các mùa giữa kỳ), xếp đội hình đa mùa và đếm ngược Mùa 19.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col bg-slate-950 text-white antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
