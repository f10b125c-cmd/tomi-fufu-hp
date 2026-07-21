import CategoryPage from "@/components/CategoryPage";

export const metadata = {
  title: "お得・家計管理｜とみ夫婦",
};

export default function OtokuPage() {
  return (
    <CategoryPage
      eyebrow="OTOKU & HOME"
      title="お得・家計管理"
      subtitle="ポイ活・ふるさと納税・固定費の見直しなど、旅行も日常も楽しむための家計の工夫。"
      heroVariant="yellow"
      items={[
        {
          tag: "家計管理",
          title: "がんばりすぎない家計管理",
          description: "完璧を目指さず、続けられる仕組みをつくります。",
        },
        {
          tag: "ポイ活",
          title: "お得を旅費に変える",
          description: "ポイントやキャンペーンを、家族の楽しみに活用します。",
        },
        {
          tag: "ふるさと納税",
          title: "おいしく楽しむふるさと納税",
          description: "グルメや旅行に役立つ返礼品を中心に紹介します。",
        },
        {
          tag: "固定費",
          title: "一度見直してラクになる家計",
          description: "日々の我慢より、仕組みの見直しを大切にしています。",
        },
      ]}
    />
  );
}
