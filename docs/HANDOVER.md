# HANDOVER — AI投資会議アプリ

最終更新：2026-09-06

基本設計書 §18〜20 に基づく現状記録。**実装済み / 未実装 / known issues / 次にやること**をここで管理する。

## 0. 現在地（ひとことで）

要件定義（`REQUIREMENTS.md`）と基本設計（`BASIC_DESIGN.md`）はv0.1で確定。
実装は **Phase 0（仕様固定）完了、Phase 1（UI骨格）が部分的に先行実装済み** の状態。
ただし先行実装は**AIも DB も使わない手入力版**であり、設計書のMVPとは別物として扱うこと（下記1-2参照）。

## 1. 実装済み

### 1-1. yuki-investment-team スキル（`.claude/skills/yuki-investment-team/`）

Claude Code上で動く「投資会議」スキル。設計書の6役・17項目レポート・
共通AI憲法（≒`references/investment-policy.md`）・リスク計算式・レッドチームの独立性ルールを
**プロンプト資産として**先に形にしたもの。アプリ実装時は `packages/ai/prompts/` の原案として流用できる。

| スキル側のファイル | 設計書の対応箇所 |
|---|---|
| `SKILL.md` | §5 AIオーケストレーション設計（実行順序） |
| `references/investment-policy.md` | §6 共通AI憲法 |
| `references/output-template.md` | 要件§8 投資会議レポート要件（17項目） |
| `references/risk-rules.md` | §10 リスク計算仕様 |
| `agents/*.md`（6役） | 要件§6 AI組織要件 |
| `templates/investment-meeting.md` | SCR-04 会議結果 |
| `templates/trade-journal.md` | TradeJournalエンティティ |
| `templates/quarterly-review.md` | SCR-07 仮説レビュー |
| `examples/sample-investment-meeting-8306.md` | 1銘柄fixtureの原型 |

### 1-2. 投資会議ノート（`/money/investment-meeting`）

とみ夫婦サイト内に追加した手入力版のWebフォーム。

- 実装済み：17項目の入力、投資金額・想定損失の自動計算（コード計算＝設計書§10の方針と同じ）、
  信用取引の固定警告、レッドチーム3件未満の警告、Markdown書き出し、localStorage保存、簡易パスワードロック
- **未実装（設計書との差分）**：AI実行なし／DBなし／API なし／外部データ取得なし／認証なし／履歴はブラウザローカルのみ
- 位置づけ：設計書Phase 1「ダミーデータで全フローが触れる」の一部を先取りしたUI検証用。
  MVP本体を作る際は、この画面をそのまま持っていくのではなく**入力項目とレポート構造の参照実装**として使う。

## 2. 未実装（MVPとして残っている全部）

設計書 §16 実装ステップに対する進捗：

| Phase | 成果物 | 状態 |
|---|---|---|
| 0 仕様固定 | 要件・基本設計・AI出力schema | 要件/設計は完了。**AI出力JSON Schemaは未作成** |
| 1 UI骨格 | ホーム/入力/結果のモック | 部分（入力+結果の手入力版のみ。SCR-01/03/06/07/08 未着手） |
| 2 AI会議 | 6役＋司令塔 | 未着手（プロンプト原案のみ存在） |
| 3 データ取得 | 株価/IR Adapter | 未着手 |
| 4 保存 | 会議履歴/判断/日誌 | 未着手（localStorageの簡易版のみ） |
| 5 レビュー | 仮説レビュー | 未着手（テンプレートのみ存在） |
| 6 QA | 失敗系/モバイル/コスト | 未着手 |

## 3. Known issues / 判断が必要な論点

1. **リポジトリの置き場所（最重要・未決）**
   現在の実装先 `f10b125c-cmd/tomi-fufu-hp` は「とみ夫婦公式サイト」（Next.js製の家族サイト・Netlify公開）。
   MVPはPostgreSQL・サーバ側LLM実行・認証・ジョブ実行を必要とするため、公開ブログと同居させるか、
   別リポジトリ/別アプリに分けるかを先に決める必要がある。設計書§17のリポジトリ構成
   （apps/web, packages/ai, packages/data, packages/domain, db/migrations）は、単独リポジトリ前提。
2. **株価・IRデータの供給元が未確定**（要件§16の未決事項）。
   スキル側のテスト（8306）で判明したとおり、Web検索経由の指標値はソース間で食い違うため、
   Adapter選定は「利用規約・更新頻度・コスト」に加えて**数値の一貫性**も評価軸に入れること。
3. **チャート情報の取得手段が未確定**。テキスト検索だけでは月足・週足の形状を取得できず、
   technicalエージェントが「未確認」を量産する。OHLCVを供給するAdapterはPhase 3の必須要件。
4. **費用の見積もりが未実施**。会議1回で6役＋司令塔＝最低7回のLLM呼び出しになるため、
   自分専用でも月額コストの試算を先にしておくこと（設計書§14）。

## 4. 次にやること（設計書§19の順序に沿った直近3手）

1. リポジトリの置き場所を決める（上記3-1）。
2. 型とDBスキーマを定義する：Meeting / AgentReport / Source / Decision / TradeJournal / Review。
   → 設計書§8の論理設計をそのままmigrationに落とす。
3. 6役のJSON出力Schemaを定義する（設計書§5の構造化出力の列がそのまま元になる）。
   同時に、既存の `.claude/skills/yuki-investment-team/agents/*.md` を
   `packages/ai/prompts/` 向けに移植する。

## 5. 変えてはいけない境界（設計書§18より）

- 証券口座連携・自動発注・AIによる売買決裁を追加しない。
- 数値計算（投資金額・最大損失）はLLMではなくアプリコードで行う。
- レッドチームは最低3件の反対意見と weakest assumption を必須にする。司令塔はこれを削除しない。
- 特定LLMモデルに密結合させず Adapter 化する。
- いきなり役割を増やさない（MVPは6役）。
