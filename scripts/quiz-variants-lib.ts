import { buildScenario, scenarios, VARIANTS } from "../src/lib/chart-study/chartQuiz";
import { checkScenario } from "../src/lib/chart-study/chartQuizChecks";

/** 1つの問題につき、出題に使う形違いの最大数（元の問題を含む） */
export const MAX_VARIANTS_PER_SCENARIO = 6;

/** 自動チェックに合格した形違いの番号を、問題ごとに求める */
export function computeAcceptedVariants(): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const s of scenarios) {
    const accepted: number[] = [];
    for (let k = 0; k < VARIANTS.length && accepted.length < MAX_VARIANTS_PER_SCENARIO; k++) {
      if (checkScenario(buildScenario(s, k)).length === 0) accepted.push(k);
    }
    result[s.id] = accepted;
  }
  return result;
}

export function renderGeneratedFile(accepted: Record<string, number[]>) {
  const lines = Object.entries(accepted).map(([id, ks]) => `  ${JSON.stringify(id)}: [${ks.join(", ")}],`);
  return `// このファイルは scripts/generate-quiz-variants.ts が自動で作ります。手で編集しないでください。
// 再生成: npm run gen:quiz
// 問題ごとに、自動チェックに合格した形違いの番号（VARIANTS の添字）を並べています。

export const acceptedVariants: Record<string, number[]> = {
${lines.join("\n")}
};
`;
}

export const GENERATED_PATH = "src/lib/chart-study/chartQuizVariants.generated.ts";
