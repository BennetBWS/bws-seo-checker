# BWS SEO診断ツール

URLを入力するだけでSEO・OGP・テクニカル・構造化データ・LLMOを一括診断するNext.jsアプリ。

## 機能

- 📝 SEO基本（title/description/H1/alt属性）
- 📣 OGP/SNS（og:title/og:image/Twitter Card）
- ⚙️ テクニカルSEO（canonical/viewport/charset/lang）
- 🏗️ 構造化データ（JSON-LD検出）
- 🤖 LLMO/AI評価（Claude APIによるAI診断）

## Vercelへのデプロイ手順

### 1. GitHubにプッシュ
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/bws-seo-checker.git
git push -u origin main
```

### 2. Vercelでインポート
1. https://vercel.com にアクセス
2. "Add New Project" → GitHubリポジトリを選択
3. Framework: **Next.js** (自動検出)

### 3. Environment Variables を設定
Vercel ダッシュボード → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

### 4. デプロイ
Vercelが自動でビルド＆デプロイ。以降はGitプッシュで自動更新。

## ローカル開発

```bash
cp .env.example .env.local
# .env.local に ANTHROPIC_API_KEY を設定

npm install
npm run dev
# http://localhost:3000
```

## カスタマイズポイント

- `app/api/seo-check/route.ts` → 解析ロジック追加
- `components/SeoChecker.tsx` → UIカスタマイズ
- `app/globals.css` → BWS カラー変更 (`--bws-blue`)
