# AI投資会議アプリ 基本設計書 v0.1

> MVPアーキテクチャ・画面・データ・AIオーケストレーション・ハンドオーバー。
> 原本は `docs/source/basic-design-v0.1.docx`（2026-09-05作成）。本Markdownはその変換版で、内容は原本と同一。

| プロジェクト | AI投資会議アプリ（仮称） |
|---|---|
| 版 | v0.1 / MVP設計 |
| 作成日 | 2026-09-05 |
| 対象 | 個人投資家向け・将来SaaS化を想定 |

# 1. 設計方針
- スマホファーストのWebアプリとして開始し、必要ならPWA/ネイティブへ拡張する。
- AIの役割を1プロンプトに混在させず、6役を独立ジョブとして実行する。
- 司令塔は各担当レポートの統合に専念し、レッドチームの反対意見を保持する。
- 市場データ/IR取得、AI実行、保存をレイヤー分離し、外部サービスを差し替え可能にする。
- 証券口座・注文機能は設計上も境界外とする。
# 2. システム構成

> 論理アーキテクチャClient（スマホWeb） → Application API → Meeting Orchestrator → 6 AI Agents → Investment Chair → Report / Journal DB　　　　　　　　　　　　　　　↘ Market / IR / Public Data Adapters → Source Store

| レイヤー | 責務 | 候補技術 |
|---|---|---|
| Frontend | 入力・進捗・結果・履歴 | React/Next.js系のWeb UI |
| Application API | 認証、会議作成、履歴、計算 | TypeScript系APIまたは同等 |
| Orchestrator | 6役の実行制御、再試行、統合 | ジョブ/ワークフロー層 |
| LLM Adapter | モデル呼び出し、構造化出力 | プロバイダ抽象化 |
| Data Adapter | 株価・IR・ニュース等の取得 | 公式/契約データソースごとのAdapter |
| Database | 会議・レポート・日誌・レビュー | PostgreSQL互換DB |
| Observability | エラー、所要時間、トークン/コスト | 構造化ログ＋メトリクス |

# 3. 画面設計

| 画面ID | 画面名 | 主要要素 |
|---|---|---|
| SCR-01 | ホーム | 新しい投資会議、最近の銘柄、保有/候補、レビュー待ち |
| SCR-02 | 会議入力 | 銘柄、検討価格、株数、現物/信用、任意メモ |
| SCR-03 | 会議進行 | 6役カード、完了/失敗/再実行、取得データ時刻 |
| SCR-04 | 会議結果 | 総合判定、レッドチーム、最大損失、各分析、注目価格、出典 |
| SCR-05 | 最終判断保存 | 購入/見送り/保留、理由、前提崩壊条件の確認 |
| SCR-06 | 銘柄詳細 | 会議履歴、トレード日誌、最新レビュー |
| SCR-07 | 仮説レビュー | 購入時仮説 vs 最新事実、維持/弱化/崩壊 |
| SCR-08 | 設定 | 分析方針、リスクルール、表示設定 |

# 4. 主要ユーザーフロー
## 4.1 新規投資会議
- ホームで「新しい投資会議」を押す。
- 銘柄、検討価格、株数、現物/信用を入力する。
- サーバが銘柄と公開情報を解決し、取得日時とソースを記録する。
- 6役のAIジョブを開始する。可能なものは並列実行する。
- 全役完了後、司令塔が統合レポートを生成する。
- ユーザーは結果を読み、自分の最終判断（購入/保留/見送り）を保存する。
- 購入の場合はトレード日誌を生成し、レビュー対象にする。
## 4.2 仮説レビュー
- 銘柄詳細から過去のトレード日誌を選ぶ。
- 購入時の thesis / risks / invalidation を取得する。
- 最新決算・公開情報を取得する。
- 各論点を「変化なし / 改善 / 悪化 / 不明」で比較する。
- レビュー担当が thesis intact / weakened / broken を提示する。
- ユーザーが継続/再検討などの自分の判断を記録する。
# 5. AIオーケストレーション設計
各担当は共通コンテキスト（銘柄、検討条件、取得済みソース、共通憲法）を受け取り、役割固有の入力と出力スキーマで実行する。

| Agent | 入力 | 構造化出力（例） |
|---|---|---|
| earnings | 公式決算/IR | rating, positives[], negatives[], changes[], watch_next[] |
| valuation | 財務指標/比較データ | rating, metrics[], peer_comparison[], rationale |
| technical | OHLCV/チャート特徴 | trend, support[], resistance[], entry_zone[], invalidation |
| red_team | 他担当とは独立した事実セット | counterarguments[>=3], weakest_assumption, short_case, failure_scenarios[] |
| risk | 価格/株数/口座種別/ルール | exposure, max_loss, concentration_flags[], margin_warnings[] |
| chair | 全AgentReport | verdict, buy_factors[3], wait_factors[3], key_prices, human_checks[] |

> 重要レッドチームは、他担当の最終結論を読んで「バランスを取る」のではなく、独立した否定仮説を作る。司令塔は反対意見を要約してもよいが削除しない。

# 6. 共通AI憲法
- 最終売買判断をしない。
- 事実・計算・推測を分離する。
- 数字を推測で埋めない。
- 可能な限り一次情報を優先し、ソース参照を保持する。
- 未来の価格や収益を断定しない。
- 不明な点は「不明」と出力する。
- ユーザーの買いたい気持ちに迎合しない。
- 信用取引には追加のリスク警告を付与する。
# 7. API基本設計

| Method | Path | 用途 |
|---|---|---|
| POST | /api/meetings | 投資会議作成 |
| GET | /api/meetings/{id} | 会議詳細取得 |
| POST | /api/meetings/{id}/run | 会議実行/再実行 |
| GET | /api/meetings/{id}/status | 進捗取得 |
| POST | /api/meetings/{id}/decision | ユーザー最終判断保存 |
| GET | /api/securities/{ticker} | 銘柄詳細 |
| GET | /api/securities/{ticker}/meetings | 銘柄別会議履歴 |
| POST | /api/journals | トレード日誌作成 |
| GET | /api/journals/{id} | 日誌取得 |
| POST | /api/journals/{id}/reviews | 仮説レビュー作成 |

# 8. データベース設計（論理）

| Table | 主キー/主な列 | 備考 |
|---|---|---|
| users | id, settings_json | 認証プロバイダIDと分離可 |
| securities | id, ticker, name, market, sector | 銘柄マスタ |
| meetings | id, user_id, security_id, entry_price, shares, position_type, status, created_at | 1会議=1検討時点 |
| agent_reports | id, meeting_id, role, output_json, output_text, status, model_meta_json | 役割ごと1+件 |
| sources | id, meeting_id, type, uri, title, published_at, fetched_at, checksum | 会議時点の根拠 |
| decisions | id, meeting_id, user_decision, reason, decided_at | 人間の最終決裁 |
| trade_journals | id, user_id, security_id, meeting_id, entry_price, shares, thesis, risks_json, invalidation, next_earnings | 購入判断記録 |
| reviews | id, journal_id, reviewed_at, thesis_status, changes_json, conclusion | 四半期/決算後レビュー |
| jobs | id, meeting_id, role, status, retry_count, started_at, finished_at | 非同期実行管理 |

# 9. 会議ステータス設計
DRAFT → DATA_FETCHING → ANALYZING → SYNTHESIZING → COMPLETED を正常系とする。部分失敗時は PARTIAL_COMPLETED、致命的な失敗は FAILED。ユーザーが同一会議を再実行した場合は新しい execution version を保持する。

| 状態 | 意味 |
|---|---|
| DRAFT | 入力済み・未実行 |
| DATA_FETCHING | 外部データ取得中 |
| ANALYZING | 各Agent実行中 |
| SYNTHESIZING | 司令塔統合中 |
| COMPLETED | 全体完了 |
| PARTIAL_COMPLETED | 一部データ/Agent失敗だが結果表示可能 |
| FAILED | 結果生成不能 |

# 10. リスク計算仕様
基本計算はLLMに任せずアプリケーションコードで行う。AIは計算結果を解釈・説明する。

| 項目 | 式/ルール |
|---|---|
| 投資金額 | entry_price × shares |
| 1株あたりリスク | max(entry_price − invalidation_price, 0) ※買いポジション例 |
| 最大想定損失 | 1株あたりリスク × shares |
| ポートフォリオ比率 | 投資金額 / ユーザーが設定した評価資産額 ※設定時のみ |
| 信用警告 | position_type=margin の場合は固定警告＋設定ルールを追加 |

# 11. 外部データ取得設計
- 一次情報（企業IR、決算資料、適時開示等）を最優先する。
- 市場価格・財務指標は取得元ごとに Adapter を作り、UI/Agentから直接依存させない。
- 各Sourceに fetched_at と published_at を持ち、最新性を判定できるようにする。
- 同一資料の重複取得を checksum 等で抑制する。
- 取得ライセンス上、保存や再配布に制約があるデータはメタ情報のみ保存する方式を選べるようにする。
# 12. セキュリティ・プライバシー設計
- ユーザーごとのRow Level Security相当のアクセス制御を採用する。
- LLM/APIキーをクライアントへ配布しない。
- 会議入力・投資履歴はログに平文で不要に出さない。
- 証券口座ID・パスワードを保存するフィールドを作らない。
- 本番ではレート制限、CSRF/XSS対策、依存ライブラリ更新、監査ログを実施する。
# 13. エラー・フォールバック設計

| ケース | 挙動 |
|---|---|
| 株価取得失敗 | 価格をユーザー入力値で継続し「現在値未確認」と表示 |
| IR取得失敗 | 決算担当を未確認扱いにし他Agentを継続 |
| Agent単体失敗 | 最大2回再試行後、PARTIAL_COMPLETEDで表示 |
| 司令塔失敗 | 各Agentレポートを個別表示し、統合のみ再実行可能 |
| 構造化出力不正 | スキーマ検証→修復リトライ→失敗なら生テキスト隔離 |
| 古いデータ | 取得日時を目立つ位置に表示し、再取得導線を出す |

# 14. ログ・監視・コスト管理
- meeting_id / execution_id / role を全ログに付与する。
- Agentごとの処理時間、成功率、再試行回数、入力/出力サイズ、推定コストを記録する。
- ユーザー画面には技術ログを出さず、「どの担当で何が不足したか」を表示する。
- 将来のSaaS化に備え、会議1回あたりの総コストを計測する。
# 15. テスト設計

| テスト | 主な観点 |
|---|---|
| Unit | リスク計算、状態遷移、スキーマ検証 |
| Integration | データ取得→Agent→司令塔→保存 |
| Prompt regression | 同じfixtureで必須項目/禁止事項が維持されるか |
| Red-team regression | 最低3反論、迎合しない、弱い前提を出す |
| E2E | スマホで入力→会議→結果→判断保存 |
| Failure test | 外部データ/Agent障害時に部分結果が返る |
| Security | 他ユーザーの会議を参照できない |

# 16. 実装ステップ

| Phase | 成果物 | 完了条件 |
|---|---|---|
| 0 仕様固定 | 要件・基本設計・AI出力schema | 受入基準の合意 |
| 1 UI骨格 | ホーム/入力/結果のモック | ダミーデータで全フローが触れる |
| 2 AI会議 | 6役＋司令塔 | 1銘柄で構造化レポート完成 |
| 3 データ取得 | 株価/IR Adapter | 出典・取得時刻がレポートに紐づく |
| 4 保存 | 会議履歴/判断/日誌 | 過去判断を再表示できる |
| 5 レビュー | 仮説レビュー | 購入時理由との比較ができる |
| 6 QA | 失敗系/モバイル/コスト | MVP受入基準を満たす |

# 17. 推奨リポジトリ構成

> 例apps/web/  app/ or src/  components/  features/meetings/packages/ai/  agents/  prompts/  schemas/  orchestrator/packages/data/  adapters/  sources/packages/domain/  risk/  meetings/  journals/db/  migrations/tests/docs/  REQUIREMENTS.md  BASIC_DESIGN.md  HANDOVER.md

# 18. HANDOVER（次の開発担当へ）
以下を開発開始時の前提として扱う。
- プロダクト名は仮称「AI投資会議」。名前変更は可だが、コンセプトは「AIに会議をさせ、人間が決裁する」を維持する。
- MVPは6役：earnings / valuation / technical / red_team / risk / chair。いきなり27役へ増やさない。
- 最重要差別化は red_team。最低3つの反対意見と weakest assumption を必須にする。
- 数値計算（投資金額・最大損失）はLLMではなくアプリコードで行う。
- AI出力は必ずJSON Schema等で構造化し、UIが自由文パースに依存しないようにする。
- ソースはAgentReportと紐づけ、取得日時を保存する。
- 証券口座連携・自動発注・売買決裁を追加しない。
- 特定LLMモデルに密結合させずAdapter化する。
- まず1銘柄fixtureでE2Eを完成し、その後複数銘柄/異常系へ広げる。
- 完成後は docs/HANDOVER.md に「実装済み / 未実装 / known issues / 次にやること」を更新する。
# 19. 開発担当の最初のTODO
- リポジトリを作成し、READMEとdocsを配置する。
- Meeting / AgentReport / Source / Decision / TradeJournal / Review の型とDBスキーマを定義する。
- 6役のJSON出力Schemaを定義する。
- 共通AI憲法＋各役割のプロンプトを実装する。
- ダミーデータでSCR-02〜SCR-05を先に完成する。
- Orchestratorで5分析役→chairの順序を実装する（独立役は並列可）。
- リスク計算をドメインコードとして実装しUnit Testを付ける。
- 外部データAdapterを1つずつ接続する。
- 失敗時のPARTIAL_COMPLETEDを実装する。
- 最低3銘柄のfixtureで回帰テストを作る。
# 20. Definition of Done
- スマホから1分以内の入力で会議を開始できる。
- 6役の出力が独立して確認できる。
- レッドチームが最低3反論を生成する。
- 最大想定損失がコード計算される。
- 司令塔レポートが固定スキーマで表示される。
- ユーザーの最終判断と理由を保存できる。
- 過去の会議/判断を再表示できる。
- 外部データの取得時刻・不足情報が分かる。
- 証券口座や自動発注への経路がない。
# 21. Phase 2候補
- 株主還元Agent
- 競合比較Agent
- マクロAgent
- 需給Agent
- 適時開示ウォッチ
- 決算カレンダー
- ポートフォリオ集中リスク
- 定期レビュー通知
- レポート共有/エクスポート
