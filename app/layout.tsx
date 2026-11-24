import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "Bách khoa toàn thư Đấu Trường Chân Lý: tra cứu tướng, Tộc/Hệ, trang bị của mọi mùa giải (kể cả mùa giữa kỳ), xếp đội hình đa mùa và đếm ngược Mùa 19.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "TFTLore – Bách khoa toàn thư Đấu Trường Chân Lý", template: "%s" },
  description,
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "vi_VN", description },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "./" },
};

export const viewport: Viewport = { themeColor: "#020617" };

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
