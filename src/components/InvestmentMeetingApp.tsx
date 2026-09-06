"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

const UNLOCK_KEY = "tomifufu-investment-meeting-unlocked";
const REPORTS_KEY = "tomifufu-investment-meetings";

const unlockListeners = new Set<() => void>();

function getUnlockSnapshot() {
  try {
    return window.localStorage.getItem(UNLOCK_KEY) === "true";
  } catch {
    return false;
  }
}

function getUnlockServerSnapshot() {
  return false;
}

function subscribeUnlock(listener: () => void) {
  unlockListeners.add(listener);
  return () => unlockListeners.delete(listener);
}

function markUnlocked() {
  try {
    window.localStorage.setItem(UNLOCK_KEY, "true");
  } catch {
    // localStorageが使えない環境ではロック状態を保存できないだけで、
    // このセッション内の表示は更新する
  }
  unlockListeners.forEach((listener) => listener());
}

function loadReportsFromStorage(): Report[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const MARGIN_WARNINGS = [
  "元本を超える損失の可能性：信用取引はレバレッジを伴うため、投資金額（証拠金）を超える損失が発生することがあります。",
  "追証（追加保証金）リスク：株価が逆行し委託保証金率が維持率を下回ると追証が発生し、期日までに入金できなければ強制決済（ロスカット）される可能性があります。",
  "金利・貸株料等のコスト：信用買いの金利、信用売りの貸株料など、保有期間に応じたコストが発生し、中長期保有ほど累積負担が大きくなります。",
  "返済期限：制度信用取引には返済期限があります（一般信用は銘柄・証券会社によります）。期日到来時に強制決済されるリスクがあります。",
  "急変動時のリスク：決算発表・市場急変時に値幅制限（ストップ安等）で決済ができず、損失が想定以上に拡大するリスクがあります。",
] as const;

type TradeType = "spot" | "margin";
type Verdict = "green" | "yellow" | "red" | "";

const verdictLabel: Record<Exclude<Verdict, "">, string> = {
  green: "🟢 候補",
  yellow: "🟡 待つ",
  red: "🔴 見送り",
};

type FormState = {
  ticker: string;
  company: string;
  currentPrice: string;
  currentPriceDate: string;
  currentPriceSource: string;
  considerPrice: string;
  shares: string;
  tradeType: TradeType;
  earnings: string;
  valuation: string;
  technical: string;
  redTeam: string[];
  invalidationPrice: string;
  invalidationCondition: string;
  buyReasons: [string, string, string];
  skipReasons: [string, string, string];
  tentativeEntryPrice: string;
  additionalEntryPrice: string;
  breakoutPrice: string;
  maxLossOverride: string;
  verdict: Verdict;
  verdictReason: string;
  decisionMaker: string;
  decisionDate: string;
  actualDecision: string;
  memo: string;
};

const emptyForm: FormState = {
  ticker: "",
  company: "",
  currentPrice: "",
  currentPriceDate: "",
  currentPriceSource: "",
  considerPrice: "",
  shares: "",
  tradeType: "spot",
  earnings: "",
  valuation: "",
  technical: "",
  redTeam: ["", "", ""],
  invalidationPrice: "",
  invalidationCondition: "",
  buyReasons: ["", "", ""],
  skipReasons: ["", "", ""],
  tentativeEntryPrice: "",
  additionalEntryPrice: "",
  breakoutPrice: "",
  maxLossOverride: "",
  verdict: "",
  verdictReason: "",
  decisionMaker: "",
  decisionDate: "",
  actualDecision: "",
  memo: "",
};

type Report = FormState & { id: string; savedAt: string };

const sampleForm: FormState = {
  ...emptyForm,
  ticker: "8306",
  company: "三菱UFJフィナンシャル・グループ",
  currentPrice: "3785",
  currentPriceDate: "2026-09-04",
  currentPriceSource: "Web検索結果（複数証券会社サイト）。数値がソースにより揺れるため要再確認",
  considerPrice: "3700",
  shares: "100",
  tradeType: "spot",
  earnings:
    "2027年3月期第1四半期決算短信（発表日2026-08-03）：四半期純利益5,460億6,800万円。前期(2026年3月期)通期純利益2兆4,273億2,900万円（前年比+30.3%）。通期予想に対する進捗率は未確認。",
  valuation:
    "PER 17.41倍/PBR 1.86倍/ROE 13.98%という数値と、PBR 1.56倍/ROE 11.34%という数値の両方が検索で見つかり、時点の違いによる可能性あり。配当は2026-05-15付発表で年間86円という情報があるが、70円/74円という古い情報も見つかっており要一次資料確認。",
  technical:
    "月足・週足の具体的な形状は未確認。日足：年初来高値3,813円(2026-07-27)、年初来安値2,516円(2026-01-05)。現在株価は年初来高値のごく近辺。",
  redTeam: [
    "好材料の織り込み済みの可能性：現在株価が年初来高値のすぐ近辺にあり、増益・増配基調は既に相当程度織り込まれている可能性がある。",
    "投資仮説で一番弱い前提：配当利回り等の主要指標が一次資料で確定できておらず、高配当株としての妙味を過大評価している可能性がある。",
    "決算失望シナリオ：通期予想に対する進捗率が未確認。次回決算(2026年11月頃想定)で下方修正が出ると高値圏からの失望売りにつながりうる。",
  ],
  invalidationPrice: "3400",
  invalidationCondition:
    "次回決算で通期予想の下方修正、または配当の増配基調が一次資料で確認できなかった場合",
  buyReasons: [
    "前期(2026年3月期)連結純利益が前年比+30.3%と大幅増益",
    "複数年の増配基調が見られる（正確な最新配当額は要確認）",
    "メガバンクとして規模・分散の大きい事業基盤",
  ],
  skipReasons: [
    "現在株価が年初来高値のごく近辺で高値圏エントリーになる",
    "PER/PBR/ROE/配当利回りがソース間で食い違い一次資料未確認",
    "通期予想の進捗率が未確認で決算リスクを事前評価しきれない",
  ],
  tentativeEntryPrice: "3600〜3700",
  additionalEntryPrice: "",
  breakoutPrice: "3813",
  maxLossOverride: "",
  verdict: "yellow",
  verdictReason:
    "方向性は買い材料になりうるが、主要指標が一次資料で確定できておらず高値圏でもあるため、再確認と次回決算の確認を待つのが妥当。",
};

function formatYen(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function buildMarkdown(form: FormState) {
  const considerPrice = Number(form.considerPrice);
  const shares = Number(form.shares);
  const invalidationPrice = Number(form.invalidationPrice);
  const hasAmount = Number.isFinite(considerPrice) && Number.isFinite(shares) && form.considerPrice !== "" && form.shares !== "";
  const investmentAmount = hasAmount ? considerPrice * shares : null;
  const hasLoss = hasAmount && form.invalidationPrice !== "" && Number.isFinite(invalidationPrice);
  const estimatedLoss = hasLoss ? (considerPrice - invalidationPrice) * shares : null;

  const lines: string[] = [];
  lines.push("# 投資会議レポート", "");
  lines.push(`- 作成日：${new Date().toISOString().slice(0, 10)}`);
  lines.push("- 作成者：投資会議ノート（とみ夫婦サイト内ツール）", "");
  lines.push("## 1. 銘柄・コード", "", `${form.company || "（未入力）"}（証券コード：${form.ticker || "未入力"}）`, "");
  lines.push(
    "## 2. 現在株価",
    "",
    `${form.currentPrice || "未入力"}円（取得日：${form.currentPriceDate || "未入力"}、出典：${form.currentPriceSource || "未入力"}）`,
    ""
  );
  lines.push("## 3. 検討価格", "", `${form.considerPrice || "未入力"}円`, "");
  lines.push(
    "## 4. 株数",
    "",
    `${form.shares || "未入力"}株（${form.tradeType === "margin" ? "信用" : "現物"}）`,
    ""
  );
  lines.push("## 5. 決算評価", "", form.earnings || "（未入力）", "");
  lines.push("## 6. バリュエーション評価", "", form.valuation || "（未入力）", "");
  lines.push("## 7. チャート評価", "", form.technical || "（未入力）", "");
  lines.push("## 8. レッドチームの反対意見", "");
  const redTeamFilled = form.redTeam.filter((item) => item.trim() !== "");
  if (redTeamFilled.length === 0) {
    lines.push("（未入力）");
  } else {
    redTeamFilled.forEach((item, i) => lines.push(`${i + 1}. ${item}`));
  }
  lines.push("");
  lines.push("## 9. リスク評価", "");
  lines.push(`- 取引区分：${form.tradeType === "margin" ? "信用" : "現物"}`);
  lines.push(
    `- 投資金額：${
      investmentAmount !== null
        ? `${form.considerPrice}円 × ${form.shares}株 ＝ ${formatYen(investmentAmount)}`
        : "算出不可（検討価格または株数が未入力）"
    }`
  );
  lines.push(`- 前提崩壊価格：${form.invalidationPrice || "未入力"}円`);
  lines.push(
    `- 想定損失：${
      estimatedLoss !== null
        ? `(${form.considerPrice}円 − ${form.invalidationPrice}円) × ${form.shares}株 ＝ ${formatYen(estimatedLoss)}`
        : "算出不可（前提崩壊価格が未入力）"
    }`
  );
  if (form.tradeType === "margin") {
    lines.push("- 信用取引の警告：");
    MARGIN_WARNINGS.forEach((w) => lines.push(`  - ${w}`));
  }
  lines.push("");
  lines.push("## 10. 買い材料（3つ）", "");
  form.buyReasons.forEach((r, i) => lines.push(`${i + 1}. ${r || "（未入力）"}`));
  lines.push("");
  lines.push("## 11. 見送り材料（3つ）", "");
  form.skipReasons.forEach((r, i) => lines.push(`${i + 1}. ${r || "（未入力）"}`));
  lines.push("");
  lines.push("## 12. 打診候補価格", "", form.tentativeEntryPrice || "（未入力）", "");
  lines.push("## 13. 追加候補価格", "", form.additionalEntryPrice || "該当なし", "");
  lines.push("## 14. 上抜け確認価格", "", form.breakoutPrice || "該当なし", "");
  lines.push(
    "## 15. 前提崩壊価格または条件",
    "",
    `${form.invalidationPrice ? `${form.invalidationPrice}円` : "未入力"}${
      form.invalidationCondition ? `、または ${form.invalidationCondition}` : ""
    }`,
    ""
  );
  lines.push(
    "## 16. 最大想定損失",
    "",
    estimatedLoss !== null
      ? `(${form.considerPrice}円 − ${form.invalidationPrice}円) × ${form.shares}株 ＝ ${formatYen(estimatedLoss)}`
      : form.maxLossOverride || "算出不可",
    ""
  );
  lines.push(
    "## 17. 最終判定",
    "",
    form.verdict ? verdictLabel[form.verdict] : "（未選択）",
    "",
    `理由：${form.verdictReason || "（未入力）"}`,
    ""
  );
  lines.push("---", "", "## 人間の最終決裁欄", "");
  lines.push(`- 決裁者：${form.decisionMaker || "（未記入）"}`);
  lines.push(`- 決裁日：${form.decisionDate || "（未記入）"}`);
  lines.push(`- 実際の判断：${form.actualDecision || "（未記入）"}`);
  lines.push(`- メモ：${form.memo || "（未記入）"}`);
  lines.push(
    "",
    "---",
    "",
    "本レポートはAIによる情報整理・分析ではなく、あなた自身が入力した内容の整理です。投資助言・勧誘ではありません。",
    "数値は入力時点の情報に基づき、誤りや更新の遅れが含まれる可能性があります。売買の最終判断は、必ずご自身の責任で行ってください。"
  );
  return lines.join("\n");
}

function NumberField({
  label,
  value,
  onChange,
  suffix = "円",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-navy">{label}</label>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
        />
        {suffix && <span className="text-sm text-brand-navy/60">{suffix}</span>}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-navy">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-navy">{label}</label>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
      />
    </div>
  );
}

function PasswordGate() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const configuredHash = process.env.NEXT_PUBLIC_INVESTMENT_MEETING_PASSWORD_HASH;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!configuredHash) {
      setError(
        "パスワードが設定されていません。環境変数 NEXT_PUBLIC_INVESTMENT_MEETING_PASSWORD_HASH を設定してください。"
      );
      return;
    }

    setChecking(true);
    try {
      const hash = await sha256Hex(input);
      if (hash.toLowerCase() === configuredHash.toLowerCase()) {
        markUnlocked();
      } else {
        setError("パスワードが違います。");
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20 text-center md:px-12">
      <h2 className="font-display text-xl font-bold text-brand-navy md:text-2xl">
        パスワードを入力してください
      </h2>
      <p className="mt-4 text-sm text-brand-navy/70">
        このページには検討中の個別銘柄・価格などの情報が含まれるため、パスワードで保護しています。
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={checking}
          className="w-full rounded-full bg-brand-orange px-8 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {checking ? "確認中..." : "入る"}
        </button>
      </form>
      <p className="mt-6 text-xs text-brand-navy/50">
        ※このロックはブラウザ内で完結する簡易的なものです。第三者の閲覧を完全に防ぐものではありません。
      </p>
    </section>
  );
}

export default function InvestmentMeetingApp() {
  const unlocked = useSyncExternalStore(subscribeUnlock, getUnlockSnapshot, getUnlockServerSnapshot);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [reports, setReports] = useState<Report[]>(loadReportsFromStorage);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setRedTeamItem(index: number, value: string) {
    setForm((prev) => {
      const next = [...prev.redTeam];
      next[index] = value;
      return { ...prev, redTeam: next };
    });
  }

  function addRedTeamItem() {
    setForm((prev) => ({ ...prev, redTeam: [...prev.redTeam, ""] }));
  }

  function removeRedTeamItem(index: number) {
    setForm((prev) => {
      if (prev.redTeam.length <= 3) return prev;
      const next = prev.redTeam.filter((_, i) => i !== index);
      return { ...prev, redTeam: next };
    });
  }

  const considerPriceNum = Number(form.considerPrice);
  const sharesNum = Number(form.shares);
  const invalidationPriceNum = Number(form.invalidationPrice);
  const hasAmount =
    form.considerPrice !== "" && form.shares !== "" && Number.isFinite(considerPriceNum) && Number.isFinite(sharesNum);
  const investmentAmount = hasAmount ? considerPriceNum * sharesNum : null;
  const hasLoss = hasAmount && form.invalidationPrice !== "" && Number.isFinite(invalidationPriceNum);
  const estimatedLoss = hasLoss ? (considerPriceNum - invalidationPriceNum) * sharesNum : null;

  const redTeamWarning = form.redTeam.filter((i) => i.trim() !== "").length < 3;

  function saveReport() {
    const id = activeReportId ?? crypto.randomUUID();
    const report: Report = { ...form, id, savedAt: new Date().toISOString() };
    setReports((prev) => {
      const withoutCurrent = prev.filter((r) => r.id !== id);
      const next = [report, ...withoutCurrent];
      try {
        window.localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
      } catch {
        // localStorageが使えない環境では保存をあきらめる
      }
      return next;
    });
    setActiveReportId(id);
  }

  function loadReport(report: Report) {
    const { id, savedAt: _savedAt, ...rest } = report;
    void _savedAt;
    setForm(rest);
    setActiveReportId(id);
    setMarkdown(null);
    setCopyStatus(null);
  }

  function deleteReport(id: string) {
    setReports((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try {
        window.localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
      } catch {
        // no-op
      }
      return next;
    });
    if (activeReportId === id) setActiveReportId(null);
  }

  function newReport() {
    setForm(emptyForm);
    setActiveReportId(null);
    setMarkdown(null);
    setCopyStatus(null);
  }

  function loadSample() {
    setForm(sampleForm);
    setActiveReportId(null);
    setMarkdown(null);
    setCopyStatus(null);
  }

  async function copyMarkdown(md: string) {
    try {
      await navigator.clipboard.writeText(md);
      setCopyStatus("コピーしました");
    } catch {
      setCopyStatus("自動コピーに失敗しました。下のテキストを選択してコピーしてください。");
    }
  }

  const generatedMarkdown = useMemo(() => (markdown !== null ? buildMarkdown(form) : null), [markdown, form]);

  if (!unlocked) {
    return <PasswordGate />;
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
      <div className="rounded-3xl bg-brand-cream p-6 text-sm text-brand-navy/80">
        このツールは売買の判断や発注を代行するものではありません。決算・バリュエーション・チャート・反対意見・リスクを自分の言葉で整理し、
        <strong>最終判断はご自身の最終決裁欄で行ってください</strong>。数値は自分で一次資料を確認したものを入力してください。
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={newReport}
          className="rounded-full border border-brand-navy/20 px-5 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
        >
          新規作成
        </button>
        <button
          onClick={loadSample}
          className="rounded-full border border-brand-navy/20 px-5 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
        >
          サンプルを読み込む（8306）
        </button>
      </div>

      {reports.length > 0 && (
        <div className="mt-6 rounded-3xl border border-[#edf0f2] bg-white p-6">
          <h3 className="font-display text-lg font-bold text-brand-navy">保存済みレポート</h3>
          <ul className="mt-4 space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  {r.company || "（銘柄名未入力）"}（{r.ticker || "-"}）— 検討価格 {r.considerPrice || "-"}円 /{" "}
                  {new Date(r.savedAt).toLocaleString("ja-JP")}
                </span>
                <span className="flex gap-3">
                  <button onClick={() => loadReport(r)} className="text-brand-blue-deep hover:opacity-70">
                    読み込む
                  </button>
                  <button onClick={() => deleteReport(r.id)} className="text-red-600 hover:opacity-70">
                    削除
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 space-y-10">
        <div className="rounded-3xl border border-[#edf0f2] bg-white p-8">
          <h3 className="font-display text-lg font-bold text-brand-navy">1〜4. 銘柄・価格の基本情報</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <TextField label="銘柄名" value={form.company} onChange={(v) => setField("company", v)} placeholder="例：三菱UFJフィナンシャル・グループ" />
            <TextField label="証券コード" value={form.ticker} onChange={(v) => setField("ticker", v)} placeholder="例：8306" />
            <NumberField label="現在株価" value={form.currentPrice} onChange={(v) => setField("currentPrice", v)} />
            <TextField label="現在株価の取得日" value={form.currentPriceDate} onChange={(v) => setField("currentPriceDate", v)} placeholder="YYYY-MM-DD" />
            <TextField label="現在株価の出典" value={form.currentPriceSource} onChange={(v) => setField("currentPriceSource", v)} placeholder="例：証券会社の取引画面" />
            <NumberField label="検討価格" value={form.considerPrice} onChange={(v) => setField("considerPrice", v)} />
            <NumberField label="株数" value={form.shares} onChange={(v) => setField("shares", v)} suffix="株" />
            <div>
              <label className="text-sm font-semibold text-brand-navy">取引区分</label>
              <select
                value={form.tradeType}
                onChange={(e) => setField("tradeType", e.target.value as TradeType)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
              >
                <option value="spot">現物</option>
                <option value="margin">信用</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#edf0f2] bg-white p-8">
          <h3 className="font-display text-lg font-bold text-brand-navy">5〜7. 決算・バリュエーション・チャート評価</h3>
          <p className="mt-2 text-xs text-brand-navy/60">
            一次資料（決算短信・IR資料・取引所発表等）で確認した事実と、自分の解釈を分けて書きましょう。確認できないことは「不明」「要確認」と書いてOKです。
          </p>
          <div className="mt-6 space-y-6">
            <TextAreaField label="決算評価" value={form.earnings} onChange={(v) => setField("earnings", v)} />
            <TextAreaField label="バリュエーション評価（PER/PBR/ROE/配当利回り等）" value={form.valuation} onChange={(v) => setField("valuation", v)} />
            <TextAreaField label="チャート評価（月足・週足・日足）" value={form.technical} onChange={(v) => setField("technical", v)} />
          </div>
        </div>

        <div className="rounded-3xl border border-[#edf0f2] bg-white p-8">
          <h3 className="font-display text-lg font-bold text-brand-navy">8. レッドチームの反対意見（最低3つ）</h3>
          <p className="mt-2 text-xs text-brand-navy/60">
            強気の理由があっても、あえて「買わない理由」を独立して考えます。空売りするなら何が理由か、決算失望シナリオ、チャート崩壊シナリオなどを検討してください。
          </p>
          {redTeamWarning && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-700">
              反対意見が3つ未満です。最低3つ埋めることを推奨します。
            </p>
          )}
          <div className="mt-6 space-y-4">
            {form.redTeam.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-3 text-sm font-semibold text-brand-navy/50">{i + 1}.</span>
                <textarea
                  value={item}
                  rows={2}
                  onChange={(e) => setRedTeamItem(i, e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
                />
                {form.redTeam.length > 3 && (
                  <button
                    onClick={() => removeRedTeamItem(i)}
                    className="mt-3 text-sm text-red-600 hover:opacity-70"
                    aria-label="この反対意見を削除"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addRedTeamItem}
            className="mt-4 text-sm font-semibold text-brand-blue-deep hover:opacity-70"
          >
            + 反対意見を追加する
          </button>
        </div>

        <div className="rounded-3xl border border-[#edf0f2] bg-white p-8">
          <h3 className="font-display text-lg font-bold text-brand-navy">9. リスク評価</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <NumberField label="前提崩壊価格" value={form.invalidationPrice} onChange={(v) => setField("invalidationPrice", v)} />
            <TextField
              label="前提崩壊の条件（価格以外）"
              value={form.invalidationCondition}
              onChange={(v) => setField("invalidationCondition", v)}
              placeholder="例：次回決算で通期予想の下方修正"
            />
          </div>
          <div className="mt-6 rounded-2xl bg-brand-cream p-6 text-sm text-brand-navy">
            <p>
              投資金額：
              {investmentAmount !== null ? (
                <strong>
                  {form.considerPrice}円 × {form.shares}株 ＝ {formatYen(investmentAmount)}
                </strong>
              ) : (
                "検討価格と株数を入力すると自動計算されます"
              )}
            </p>
            <p className="mt-2">
              想定損失：
              {estimatedLoss !== null ? (
                <strong>
                  ({form.considerPrice}円 − {form.invalidationPrice}円) × {form.shares}株 ＝ {formatYen(estimatedLoss)}
                </strong>
              ) : (
                "検討価格・株数・前提崩壊価格をすべて入力すると自動計算されます"
              )}
            </p>
          </div>
          {form.tradeType === "margin" && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
              <p className="font-semibold">信用取引に関する警告</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {MARGIN_WARNINGS.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[#edf0f2] bg-white p-8">
          <h3 className="font-display text-lg font-bold text-brand-navy">10〜11. 買い材料・見送り材料（各3つ）</h3>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-brand-navy">買い材料</p>
              {form.buyReasons.map((r, i) => (
                <input
                  key={i}
                  type="text"
                  value={r}
                  onChange={(e) =>
                    setField(
                      "buyReasons",
                      form.buyReasons.map((v, idx) => (idx === i ? e.target.value : v)) as [string, string, string]
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
                />
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-brand-navy">見送り材料</p>
              {form.skipReasons.map((r, i) => (
                <input
                  key={i}
                  type="text"
                  value={r}
                  onChange={(e) =>
                    setField(
                      "skipReasons",
                      form.skipReasons.map((v, idx) => (idx === i ? e.target.value : v)) as [string, string, string]
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#edf0f2] bg-white p-8">
          <h3 className="font-display text-lg font-bold text-brand-navy">12〜14. 価格の目安</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <TextField label="打診候補価格" value={form.tentativeEntryPrice} onChange={(v) => setField("tentativeEntryPrice", v)} placeholder="例：3600〜3700" />
            <TextField label="追加候補価格" value={form.additionalEntryPrice} onChange={(v) => setField("additionalEntryPrice", v)} placeholder="該当なしでも可" />
            <TextField label="上抜け確認価格" value={form.breakoutPrice} onChange={(v) => setField("breakoutPrice", v)} placeholder="該当なしでも可" />
          </div>
        </div>

        <div className="rounded-3xl border border-[#edf0f2] bg-white p-8">
          <h3 className="font-display text-lg font-bold text-brand-navy">17. 最終判定</h3>
          <p className="mt-2 text-xs text-brand-navy/60">
            これは会議の結論案であり、命令ではありません。実際にどうするかは下の「人間の最終決裁欄」で決めてください。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {(["green", "yellow", "red"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setField("verdict", v)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold ${
                  form.verdict === v
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-brand-navy/20 text-brand-navy hover:bg-brand-navy/5"
                }`}
              >
                {verdictLabel[v]}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <TextAreaField label="判定理由" value={form.verdictReason} onChange={(v) => setField("verdictReason", v)} rows={3} />
          </div>
        </div>

        <div className="rounded-3xl border-2 border-brand-navy/20 bg-white p-8">
          <h3 className="font-display text-lg font-bold text-brand-navy">人間の最終決裁欄</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <TextField label="決裁者" value={form.decisionMaker} onChange={(v) => setField("decisionMaker", v)} />
            <TextField label="決裁日" value={form.decisionDate} onChange={(v) => setField("decisionDate", v)} placeholder="YYYY-MM-DD" />
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-brand-navy">実際の判断</label>
              <select
                value={form.actualDecision}
                onChange={(e) => setField("actualDecision", e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
              >
                <option value="">未選択</option>
                <option value="購入">購入</option>
                <option value="見送り">見送り</option>
                <option value="保留">保留</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <TextAreaField label="メモ" value={form.memo} onChange={(v) => setField("memo", v)} rows={3} />
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={saveReport}
          className="rounded-full bg-brand-orange px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          この内容を保存する
        </button>
        <button
          onClick={() => {
            setMarkdown("");
            setCopyStatus(null);
          }}
          className="rounded-full border border-brand-navy/20 px-8 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
        >
          レポートを書き出す
        </button>
      </div>

      {generatedMarkdown !== null && (
        <div className="mt-8 rounded-3xl border border-[#edf0f2] bg-white p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-brand-navy">投資会議レポート（Markdown）</h3>
            <button
              onClick={() => copyMarkdown(generatedMarkdown)}
              className="rounded-full border border-brand-navy/20 px-5 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
            >
              コピーする
            </button>
          </div>
          {copyStatus && <p className="mt-2 text-sm text-brand-navy/60">{copyStatus}</p>}
          <textarea
            readOnly
            value={generatedMarkdown}
            rows={20}
            className="mt-4 w-full rounded-xl border border-black/10 bg-brand-cream px-4 py-3 font-mono text-xs text-brand-navy"
          />
        </div>
      )}

      <p className="mt-10 text-center text-xs text-brand-navy/50">
        入力内容はこの端末のブラウザ（localStorage）にのみ保存され、サーバーには送信されません。
      </p>
    </section>
  );
}
