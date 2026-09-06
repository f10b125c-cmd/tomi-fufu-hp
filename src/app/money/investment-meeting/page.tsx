import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import InvestmentMeetingApp from "@/components/InvestmentMeetingApp";

export const metadata = {
  title: "投資会議ノート｜とみ夫婦",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InvestmentMeetingPage() {
  return (
    <>
      <Header />
      <PageHero
        eyebrow="MONEY & NISA"
        title="投資会議ノート"
        subtitle="検討中の銘柄について、決算・バリュエーション・チャート・反対意見・リスクを自分の言葉で整理し、最終判断は自分で行うためのメモ用ツールです。"
        variant="yellow"
      />
      <InvestmentMeetingApp />
      <Footer />
    </>
  );
}
