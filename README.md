# 駒場祭 不正アクセス体験ゲーム POC

架空の通販サイトを舞台にした、攻撃体験とログ調査のオフラインWebゲームです。すべて固定シナリオ応答で、実際の通信・攻撃は行いません。

## 起動

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

## GitHub Pages

`main` への push でGitHub Actionsがテスト・ビルドし、GitHub Pagesへ自動デプロイします。
公開URL: https://ut-code.github.io/security-incidents/

## ATT&CKタグ確認TODO

シナリオに表示するATT&CK番号・名称は、公開前に[MITRE ATT&CK公式サイト](https://attack.mitre.org/)で照合すること。特にT1190、T1567の適用範囲とT1078.001の表記を確認する。
