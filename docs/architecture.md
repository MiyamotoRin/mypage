# アーキテクチャ

MVCパターンをベースにしたディレクトリ構成。

```
mypage/
├── model/                        # Model: データアクセス層 (Vercel Serverless Functions)
│   ├── config.js                 #   Notionプロパティ設定を返すエンドポイント
│   └── notion/
│       └── query.js              #   Notionデータベースクエリのプロキシ
│
├── controller/                   # Controller: ページロジック・イベント処理
│   └── components/
│       └── common-components.js  #   共通ヘッダー・フッターのレンダリング
│
├── view/                         # View: プレゼンテーション層
│   ├── pages/                    #   HTMLページ群
│   │   ├── top/index.html
│   │   ├── profile/index.html
│   │   ├── works/
│   │   │   ├── index.html
│   │   │   ├── funeral-of-my-own.html
│   │   │   └── three-minutes-theater.html
│   │   ├── timeline/index.html
│   │   └── read-books/index.html
│   ├── styles/                   #   CSS
│   │   ├── page.css              #     共通スタイル
│   │   ├── top.css               #     トップページ専用
│   │   └── work-detail.css       #     作品詳細ページ専用
│   └── images/                   #   画像アセット
│
├── docs/                         # ドキュメント
├── server.js                     # ローカル開発用Expressサーバー
└── vercel.json                   # Vercelデプロイ設定・URLルーティング
```

## URLルーティング

`vercel.json` の rewrites で、クリーンURLをファイルパスにマッピングしている。

| URL | 実体 |
|-----|------|
| `/` | `view/pages/top/index.html` |
| `/profile` | `view/pages/profile/index.html` |
| `/works` | `view/pages/works/index.html` |
| `/works/*` | `view/pages/works/*` |
| `/timeline` | `view/pages/timeline/index.html` |
| `/read-books` | `view/pages/read-books/index.html` |
| `/api/*` | `model/*` (Serverless Functions) |

ローカル開発時は `server.js` が同じルーティングを再現する。

## パス規則

ページ内のすべてのリソース参照はルートからの絶対パスを使う。

- CSS: `/view/styles/*.css`
- JS: `/controller/components/*.js`
- 画像: `/view/images/*`
- ナビリンク: `/`, `/profile`, `/works`, `/timeline`

相対パスは使わない（ページの深さによってパスが変わるため）。
