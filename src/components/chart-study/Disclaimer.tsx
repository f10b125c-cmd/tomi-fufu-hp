export default function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-brand-navy/55 ${className}`}>
      ※このページは、チャートの読み方を学ぶための教材です。特定の銘柄の売買をすすめるものではなく、投資助言ではありません。
      チャートは学習用に作った架空のデータで、実在の企業・株価とは関係ありません。投資の判断はご自身の責任でお願いします。
    </p>
  );
}
