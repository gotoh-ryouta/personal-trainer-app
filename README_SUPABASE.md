# Supabaseセットアップガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. 「Start your project」をクリック
3. GitHubでログイン
4. 「New project」をクリック
5. プロジェクト名：`personal-trainer-app`
6. データベースパスワードを設定（安全な場所に保存）
7. リージョン：`Northeast Asia (Tokyo)`を選択
8. 「Create new project」をクリック

## 2. データベースのセットアップ

1. Supabaseダッシュボードの「SQL Editor」をクリック
2. `supabase-schema.sql`の内容をコピー＆ペースト
3. 「Run」をクリックして実行

## 3. 認証の設定

1. 「Authentication」→「Providers」へ
2. 「Email」が有効になっていることを確認
3. 「Google」を有効にする場合：
   - Google Cloud ConsoleでOAuth 2.0クライアントIDを作成
   - Authorized redirect URIs：`https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
   - Client IDとClient Secretを入力

## 4. 環境変数の設定

1. Supabaseダッシュボードの「Settings」→「API」へ
2. 以下をコピー：
   - Project URL
   - anon public key

3. `.env.local`ファイルを更新：
```env
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## 5. Vercelへのデプロイ

1. GitHubにpush
2. Vercelダッシュボードで「Import Project」
3. 環境変数を設定：
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_GEMINI_API_KEY`

## 6. セキュリティ設定

1. Supabase「Authentication」→「URL Configuration」
2. Site URLを設定：`https://your-app.vercel.app`
3. Redirect URLsに追加：
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`（開発用）

## テーブル構造

- `user_profiles`：ユーザープロフィール
- `tasks`：タスク（トレーニング、食事など）
- `nutrition_entries`：栄養記録
- `weight_records`：体重記録

## Row Level Security

すべてのテーブルでRLSが有効。ユーザーは自分のデータのみアクセス可能。