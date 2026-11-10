/**
 * チャート当てクイズの全問題（形違いを含む）が、解説どおりに動くかを確かめる。
 * - 出題リスト（chartQuizVariants.generated.ts）のすべてが自動チェックに合格すること
 * - 出題リストが最新であること（古ければ npm run gen:quiz で作り直す）
 *
 * 実行: npm run verify:quiz
 * チャートの生成ロジック（candles.ts）や問題（chartQuiz*.ts）を変えたら必ず実行すること。
 */
import { readFileSync } from "fs";
import { buildScenario, levelOf, scenarios } from "../src/lib/chart-study/chartQuiz";
import { checkScenario } from "../src/lib/chart-study/chartQuizChecks";
import { acceptedVariants } from "../src/lib/chart-study/chartQuizVariants.generated";
import { computeAcceptedVariants, GENERATED_PATH, renderGeneratedFile } from "./quiz-variants-lib";

let bad = 0;
let total = 0;
for (const s of scenarios) {
  const ks = acceptedVariants[s.id] ?? [];
  const results = ks.map((k) => {
    total++;
    const problems = checkScenario(buildScenario(s, k));
    if (problems.length) bad++;
    return problems.length ? `#${k} ${problems.join(" / ")}` : null;
  });
  const failures = results.filter(Boolean);
  console.log(
    `${levelOf(s) === "advanced" ? "上級" : "初級"} ${s.id.padEnd(28)} ${ks.length}問 ${failures.length ? "NG " + failures.join(", ") : "OK"}`,
  );
}

const stale = readFileSync(GENERATED_PATH, "utf8") !== renderGeneratedFile(computeAcceptedVariants());
if (stale) console.log("出題リストが古くなっています。npm run gen:quiz で作り直してください。");

console.log(bad || stale ? `NG: 不合格 ${bad} 問` : `ALL OK（${scenarios.length} パターン・${total} 問）`);
if (bad || stale) process.exitCode = 1;
