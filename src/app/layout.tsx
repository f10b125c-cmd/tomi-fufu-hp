import type { Metadata } from "next";
import { Noto_Sans_JP, Kiwi_Maru } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const kiwiMaru = Kiwi_Maru({
  variable: "--font-kiwi-maru",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tomifufu-official.netlify.app"),
  title: "とみ夫婦｜投資とお得で、家族の「行きたい」を叶える。",
  description:
    "家計を整え、資産を育て、家族との思い出を増やす。旅行が大好きな4人家族の、等身大の暮らしを発信しています。",
  openGraph: {
    title: "とみ夫婦｜投資とお得で、家族の「行きたい」を叶える。",
    description: "旅行が大好きな4人家族の、投資・お得・家計管理と家族旅行の記録。",
    type: "website",
    images: ["/images/hero-family-sea.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${kiwiMaru.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
