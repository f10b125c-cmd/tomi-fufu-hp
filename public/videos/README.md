# ショート動画の追加方法

1. この `public/videos/` フォルダに mp4 ファイルを配置する
   - 無音・ループ再生を想定。数秒〜十数秒、mp4 (H.264)、数MB以内を目安に軽量化する
2. `src/app/page.tsx` の `memories` 配列に `video: "/videos/ファイル名.mp4"` を追加する
   - `src` にはサムネイル用の静止画（poster）を指定する（動画読み込み前に表示される）

```ts
{
  src: "/images/okinawa-beach.jpg", // poster用サムネイル
  alt: "沖縄の海",
  tag: "OKINAWA",
  caption: "青い海に会いに。",
  video: "/videos/okinawa-trip.mp4",
},
```

カードが画面に入ったときだけ自動再生され、画面外では停止する。
