import CategoryPage from "@/components/CategoryPage";

export const metadata = {
  title: "家族旅行｜とみ夫婦",
};

export default function TravelPage() {
  return (
    <CategoryPage
      eyebrow="FAMILY TRAVEL"
      title="家族旅行"
      subtitle="沖縄・ディズニー・ホテル・グルメなど、家族で楽しんだ旅の記録。"
      heroVariant="sea"
      items={[
        {
          tag: "沖縄",
          title: "子連れ沖縄旅行",
          description: "ホテル・食事・移動まで、我が家のリアルな旅程をまとめます。",
        },
        {
          tag: "ディズニー",
          title: "家族で楽しむディズニー",
          description: "子ども連れで無理なく楽しむための工夫を紹介します。",
        },
        {
          tag: "ホテル",
          title: "少し贅沢なホテル時間",
          description: "投資やお得で叶えた、家族のごほうび旅。",
        },
        {
          tag: "グルメ",
          title: "旅先のおいしいもの",
          description: "沖縄そば、カフェ、ホテル朝食などの記録です。",
        },
      ]}
    />
  );
}
