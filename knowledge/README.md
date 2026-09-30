---
title: "ナレッジ棚 索引"
updated: 2026-09-30
---

# ナレッジ棚 索引

このフォルダをObsidianのVaultとして開くと、下のリンクから各ノートに飛べる。
新しいノートを足したら、この索引にも1行追加する。

## 1. 実行中プロジェクト：Threads×占いスピ（スピ様式7days）
| ノート | 内容 | 状態 |
|---|---|---|
| [[threads-uranai-7days-0to1-monetization]] | 教材本体（Day1〜7の手順・テンプレ・ワークシート一覧） | 参照用 |
| [[progress/day1-account-setup]] | Day1ワークシート（うさねこ占い／こんこん占い、6項目、プロフィール文、次やること） | 進行中 |
| [[progress/day2-first-post-drafts]] | Day2 初投稿の下書き（①②＋差し替え用1行目） | 下書き済み・投稿待ち |

## 2. AI活用・モデル/ツール知識
| ノート | 内容 | 信頼度 |
|---|---|---|
| [[claude-sonnet-5.5-model-selection-guide]] | Sonnet 5.5の変更点、Sonnet/Opus/Fableの使い分け、3モデル用プロンプト例、料金表 | 高（公式リンクあり・料金は公式データと突合済み） |
| [[claude-code-vs-codex-usage-patterns]] | Claude CodeとCodexの分担4パターン、AGENTS.md一本化（`CLAUDE.md`に`@AGENTS.md`） | 中（「4割安」等は未検証） |
| [[jev-typesafe-judgment-model-use-cases]] | 判断専用モデルJevの仕様と50作例（7分類）、注意点 | 低〜中（数字は自己申告中心） |

## 3. 参考（読み方に注意）
| ノート | 内容 | 注意 |
|---|---|---|
| [[x-ai-manasiki-5steps-sales-article]] | X×AIの「5つのこと」紹介記事 | セールスファネル記事。核心（5つ目）は非公開・実績は未検証。転用できる考え方だけ抽出済み |

## 4. 外部AIへの引き渡しメモ（コピペ用）
| ノート | 渡し先の例 | 状態 |
|---|---|---|
| [[progress/day1-market-research-brief]] | PC操作エージェント（Codexのastra等）：Threads市場リサーチ50件 | **結果未回収** |
| [[progress/day1-second-opinion-request]] | Codex等：キャラ設計の第二意見 | **回答未回収**（回答メモ欄は空） |
| [[progress/day1-icon-generation-handoff]] | ChatGPT Image／Codex画像生成：アイコン仕上げ | **画像未回収** |

## 5. 素材
- `assets/icons/usaneko-concept.png`、`assets/icons/konkon-concept.png`：アイコンのコンセプト画像（簡易生成）

## 未完了メモ（次に動かすもの）
1. Threadsアカウント2つの作成、プロフィール文・アイコン設定（あなたの手作業）→ Day1完了
2. 上の「結果未回収」3件（市場リサーチ・第二意見・アイコン仕上げ）が返ってきたら該当ノートに反映
3. Day1完了後、Day2初投稿へ

## ノート追加のルール
- 先頭にYAMLフロントマター（`title` / `tags` / `source` / `saved_date` / `status`）を付ける
- 販促記事や自己申告の数字は、`status` と本文冒頭で「未検証・要注意」と明記する
- 実行系のメモは `progress/`、知識・参考記事はトップ階層に置く
