# 駒場祭 不正アクセス体験ゲーム POC 仕様

## 1. 目的とスコープ

- 架空の通販サイト「駒場マーケット」を題材に、シミュレーションごとに攻撃モードまたは防御モードを選ぶWebゲームのPOC
- 目標: 遊び終えた人が `GET /.env` が 200 で返っているログを見て「まずい」と判断できるようになる
- 実在のツール出力形式を模すが、**実際の通信・攻撃処理は一切しない**。すべてシナリオデータに基づく固定応答
- POCの範囲: シミュレーション1件、攻撃5ステージ、防御パート、画面内評価。対戦・サーバー・ランキング・独立した結果ページは対象外

## 2. 技術構成

- Vite + React + TypeScript、テストは vitest
- バックエンドなし。静的ビルドのみで動作(ネットワーク不通の端末でも動く)
- ブラウザールーティングは `/1/attack`、`/1/defense`。ビルド時に `404.html` も生成して静的ホスティングの直リンクに対応
- ランタイムで外部通信しない(fetch / XHR を使わない)。ユーザー入力を `eval` や `Function` に渡さない
- ターミナルUIは自作の軽量コンポーネント(xterm.js は使わない)
  - 入力行、出力履歴、↑↓で履歴、Tabでコマンド名補完、`help` / `hint` 対応
- 状態管理は `useReducer`。画面は `pages/`、共通UIは `components/`、ロジックとシナリオは `lib/` に分ける:

```
src/
  lib/        command.ts  state.ts  logs.ts  outcome.ts  scenario.ts
  components/ Terminal.tsx  InstructionPanel.tsx  SafetyNotice.tsx
  pages/      App.tsx  TitlePage.tsx  AttackPage.tsx  DefensePage.tsx
```

## 3. 世界設定(すべて架空)

- サイト: 駒場マーケット `shop.komaba-market.example`(IP 198.51.100.10)
- 攻撃者IP: 203.0.113.45 / 一般客IP: 192.0.2.x / 社内・ジョブ: 10.0.2.x
- 顧客データ: 12,480件。画面に「この世界の名前・鍵・パスワードはすべて架空です」と常時表示
- IP・ドメインは予約済みの値(203.0.113.x, 198.51.100.x, 192.0.2.x, `.example`)だけを使う

## 4. 画面フロー

1. ルート: シミュレーション一覧。シミュレーション1「駒場マーケット」に「攻撃」「防御」の入口を置く
2. 攻撃: インストラクションをページ単位で閲覧しながらターミナル操作
3. 防御: 攻撃モードと同じシミュレーションの完了済み固定ログ全件を文字列検索し、証拠と対応カードを選ぶ
4. 攻撃・防御ページからルートへ戻る。評価は防御ページ内に表示

## 5. 攻撃パート

### 5.1 状態フラグ

`hasEnv`, `hasToken`, `idorFound`, `hasAdmin`, `exported`、現在ステージ、仮想時計、生成済みログ配列、`hintCount`、`wrongAnswers`

### 5.2 コマンド

`help`, `hint`, `nmap -sV <host>`, `curl [-H ..] [-X POST] [-d ..] [-o file] <url>`, Bashの限定シナリオループ、`rm -f /var/log/nginx/access.log`, `clear`

- 未知のコマンドは `command not found: xxx`
- 条件を満たさない操作は、現実的なエラー(401 / 403 / 404 など)を返す
- `hint` は現在ステージに応じた1行ヒントを返し、`hintCount` を加算する
- 認証は `/api/login`、`/admin/login` へのJSON `POST` で表現する
- シェルループは既知の構文のみ固定応答し、ユーザー入力をシェル・`eval`・`Function`で実行しない

### 5.3 ルール定義(これがシナリオの中心)

```ts
type Rule = {
  id: string;
  stage: 1 | 2 | 3 | 4 | 5;
  match: RegExp; // 正規化した入力に対して判定
  requires?: Flag[]; // 必要なフラグ
  sets?: Flag[]; // 成功時に立てるフラグ
  output: string; // 端末に出す固定テキスト
  dtSec: number; // 仮想時計の進み
  logs: LogTemplate[]; // 成功時に生成するログ
  failOutput?: string; // requires を満たさない時の出力
};
type LogTemplate = {
  offsetSec: number;
  ip: string;
  method: string;
  path: string;
  status: number;
  bytes: number;
  ua: string;
  suspicious: boolean;
  stage: number;
  owasp: string;
  attack: string;
};
```

- 仮想時計は 03:11:50 から開始し、ルール成功のたびに `dtSec` 進む
- 失敗した操作も、対応するログ(401 など)があれば生成する
- 同じコマンドを繰り返すと、その分だけログ行が増える

### 5.4 ステージ別の内容

| #   | ステージ | 主なルール                                             | OWASP:2025 | ATT&CK           |
| --- | -------- | ------------------------------------------------------ | ---------- | ---------------- |
| 1   | 偵察     | `nmap -sV` と `curl .../.env`                          | A02        | T1595, T1552.001 |
| 2   | 認証情報 | `curl -X POST ... /api/login`(誤パスは401)             | A07        | T1078            |
| 3   | 初期侵入 | `curl` で `/api/orders/1002`、Bash `for` ループ        | A01        | T1190            |
| 4   | 権限昇格 | `curl .../robots.txt`、`curl -X POST ... /admin/login` | A02/A07    | T1078.001        |
| 5   | 持ち出し | `curl .../admin/export/customers.csv -o customers.csv` | A01        | T1567            |

(ATT&CKの番号は未検証。表示前に公式サイトで照合するTODOをREADMEに残すこと)

出力テキストの例(ステージ1と3):

```
$ nmap -sV shop.komaba-market.example
Nmap scan report for shop.komaba-market.example (198.51.100.10)
PORT      STATE  SERVICE  VERSION
22/tcp    open   ssh      OpenSSH 8.9
80/tcp    open   http     nginx 1.18.0
443/tcp   open   https    nginx 1.18.0

$ curl https://shop.komaba-market.example/.env
APP_ENV=production
DB_HOST=10.0.2.15
STAFF_ACCOUNT=staff-old@komaba-market.example
STAFF_PASSWORD=Komaba2023!

$ curl -H "Authorization: Bearer demo_tok_4f2a" https://shop.komaba-market.example/api/orders/1002
{"order_id":1002,"customer":"(架空)佐藤 花子","total":4800}
```

- ステージ2の成功出力: `{"token":"demo_tok_4f2a","role":"user"}`
- ステージ3 Bashループ: `50 records retrieved in 3.1s`(連番アクセスのログ50行を生成)
- ステージ4の成功出力: `{"session":"demo_adm_9c1e","role":"admin"}`
- ステージ5の成功出力: `customers.csv saved (12,480 records)`
- 任意の `rm -f /var/log/nginx/access.log`: Permission denied(ログはリモート転送済み)

## 6. 防御パート

### 6.1 ログ生成

- 攻撃側のコマンドで生成されたログ(`suspicious: true`)に、シード付き乱数で作った正常ログ約200行を混ぜ、時刻順に並べる
- 正常ログのテンプレ: `GET /`, `/products/<id>`, `/cart`, `POST /api/login` 200(192.0.2.x)、`GET /health`(10.0.2.x、定期)
- 紛らわしい正常ログも混ぜる: 一般客の `GET /robots.txt`、社内IPからの `/admin/login`、一般客の `GET /api/orders/<自分の1件>`
- 形式は nginx のアクセスログ:

```
203.0.113.45 - - [01/Nov/2026:03:12:04 +0900] "GET /.env HTTP/1.1" 200 412 "-" "curl/7.88.1"
```

- 乱数のシードは固定(再現性のため)。攻撃ログの比率は全体の数%

### 6.2 操作

- 全ログを初めから表示し、単一の検索欄でアクセスログ文字列を部分一致検索する
- 行をクリックで証拠リストに追加 → 「どのステージか」を選択 → 正解なら解説を表示、不正解は `wrongAnswers` を加算
- 自動ハイライト・条件追加UI・対応時刻入力は設けない

### 6.3 対応カード

| id              | 効果(止まる範囲)            |
| --------------- | --------------------------- |
| block-ip        | 攻撃元IPからの全リクエスト  |
| disable-staff   | stage 2 のスタッフ認証      |
| fix-env         | stage 1〜2 の設定・認証情報 |
| fix-orders-auth | stage 3 の注文API           |
| restrict-admin  | stage 4 以降の管理画面      |
| admin-mfa       | stage 4 以降の管理者認証    |
| limit-download  | stage 5 のデータ持ち出し    |

### 6.4 結果の判定(`outcome.ts`)

- 選択したカードの対象ステージを即時に封じ込め、最も早い対象ステージで攻撃を停止する
- 対応時刻・カード遅延による時間採点は行わない
- 到達した最終ステージから流出を決める
  - ステージ2まで: 0件、減点0 / ステージ3の途中: 最大50件、減点20 / ステージ4: 減点40 / ステージ5以降: 12,480件、減点70
- 追加減点: 誤指摘1回5点、`hint` 1回5点。100点からの減点式
- ランク: 90点以上S、70点以上A、50点以上B、それ未満C

## 7. 評価表示

- 防御ページ内に点数、ランク、流出件数を表示する(独立した結果ページは作らない)
- 各ステージの解説(OWASPとATT&CKのタグ付き)。ステージ1は「公開された `.env` が200を返した時点で設定ミスは確定」を必ず含める

## 8. 受け入れ基準

1. 攻撃5ステージを、`help` と `hint` の案内だけで最後まで進められる
2. 同じ入力は常に同じ出力を返す(乱数は防御ログのノイズのみ、シード固定)
3. 攻撃モードでは実行したコマンドに対応するログ、防御モードでは同一シミュレーションの固定ログを表示する
4. 防御モードではログ文字列検索、証拠登録、ステージ分類、対応カードを使える
5. ネットワークタブを開いても、ゲーム開始後に外部リクエストが出ない
6. `lib/` の単体テスト(コマンド解釈、ログ生成、outcome計算)が通る
7. `pnpm build` で静的ファイルと404 fallbackが生成される

## 9. POCの優先順位

1. エンジン(ルール評価、状態、ログ生成)とテスト
2. ターミナルUIで攻撃パートが最後まで通る
3. 防御パート(ログ表示、証拠、カード、結果)
4. 防御ページの検索・証拠解説の整備

## 10. 対象外(POCではやらない)

対戦・マルチプレイ、サーバーやDB、ランキング、Tab補完以外の入力補助(クリックで値を貼る等)、スマホ最適化、実際の攻撃ツールやペイロードの同梱
