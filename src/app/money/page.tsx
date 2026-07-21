import CategoryPage from "@/components/CategoryPage";

export const metadata = {
  title: "投資・NISA｜とみ夫婦",
};

export default function MoneyPage() {
  return (
    <CategoryPage
      eyebrow="MONEY & NISA"
      title="投資・NISA"
      subtitle="投資初心者の我が家が続けている、NISA・積立・個別株・家計との付き合い方。"
      items={[
        {
          tag: "NISA",
          title: "初心者から始めるNISA",
          description: "難しい言葉をできるだけ使わず、我が家の経験を交えて紹介します。",
        },
        {
          tag: "積立",
          title: "無理なく続ける積立投資",
          description: "生活を楽しみながら、未来のお金も少しずつ育てます。",
        },
        {
          tag: "個別株",
          title: "1株から楽しむ投資",
          description: "配当や優待を楽しみながら、長く付き合いたい企業を探します。",
        },
        {
          tag: "考え方",
          title: "お金は思い出のための手段",
          description: "増やすだけではなく、家族の楽しみに使うことも大切にしています。",
        },
      ]}
    />
  );
}
