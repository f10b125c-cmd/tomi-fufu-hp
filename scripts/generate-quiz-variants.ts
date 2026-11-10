/**
 * チャート当てクイズの形違いを自動チェックし、合格したものを出題リストに書き出す。
 * 実行: npm run gen:quiz
 */
import { writeFileSync } from "fs";
import { computeAcceptedVariants, GENERATED_PATH, renderGeneratedFile } from "./quiz-variants-lib";

const accepted = computeAcceptedVariants();
writeFileSync(GENERATED_PATH, renderGeneratedFile(accepted));

const total = Object.values(accepted).reduce((a, ks) => a + ks.length, 0);
const missingOriginal = Object.entries(accepted).filter(([, ks]) => !ks.includes(0)).map(([id]) => id);
const few = Object.entries(accepted).filter(([, ks]) => ks.length < 3).map(([id, ks]) => `${id}(${ks.length})`);
console.log(`${Object.keys(accepted).length} パターン → ${total} 問を書き出しました: ${GENERATED_PATH}`);
if (few.length) console.log(`形違いが少ないパターン: ${few.join(", ")}`);
if (missingOriginal.length) {
  console.log(`元の問題がチェックに不合格: ${missingOriginal.join(", ")}`);
  process.exitCode = 1;
}
