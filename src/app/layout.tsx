import type { Metadata } from "next";
import { Noto_Sans_JP, M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "とみ夫婦｜投資とお得で、家族の「行きたい」を叶える。",
  description:
    "家計を整え、資産を育て、家族との思い出を増やす。旅行が大好きな4人家族の、等身大の暮らしを発信しています。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${mPlusRounded.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
