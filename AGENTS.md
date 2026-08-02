<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# とみ夫婦プロジェクトの参照先

## Googleスプレッドシート

Instagram運用で使っているシート。該当する依頼を受けたら、まずここを参照する。

### インスタ台本・リサーチシート

投稿の台本づくりとリサーチ用。

- URL: https://docs.google.com/spreadsheets/d/1OtXkK-8lhgWMSIR0F58tSQHa23kF0l6qJJnjNqgl8oM/edit?gid=278183300#gid=278183300
- スプレッドシートID: `1OtXkK-8lhgWMSIR0F58tSQHa23kF0l6qJJnjNqgl8oM`
- 共有時に開いていたシート: `gid=278183300`

### インスタ ストーリー分析シート

ストーリーズの実績分析用。

- URL: https://docs.google.com/spreadsheets/d/1AY8IarHgcMkmKjW43e2y7vPGDpQRW9cdl2yaFCysB0g/edit?gid=277053774#gid=277053774
- スプレッドシートID: `1AY8IarHgcMkmKjW43e2y7vPGDpQRW9cdl2yaFCysB0g`
- 共有時に開いていたシート: `gid=277053774`

**読み取りにはコネクタかエクスポートが必要。** URLを知っているだけでは中身を読めない。Google関連のコネクタが接続されていないセッションでは、ユーザーにシートの書き出し（xlsx/csv）をアップロードしてもらうか、コネクタの接続を依頼すること。勝手に内容を推測して台本や分析を書かない。

## 関連リポジトリ

同じ「とみ夫婦」まわりで、別リポジトリに分かれているものがある。作業前にどれが対象か確認する。

| リポジトリ | 中身 | 公開先 |
| --- | --- | --- |
| `f10b125c-cmd/tomi-fufu-hp` | とみ夫婦 公式サイト（このリポジトリ） | — |
| `f10b125c-cmd/asset-dashboard` | 資産管理＋家計簿ダッシュボード（Excel→HTML生成）。更新手順は同リポジトリの `HANDOFF.md` を先に読む | https://aseet.netlify.app/ |
| `f10b125c-cmd/tomifufu-dashboard` | 「わが家ダッシュボード」ポータル＋配当管理 | OpenAI Sites |
