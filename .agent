# Agent Rules for tokihomu-lab

## 1. 開発環境・UIテスト実行

本プロジェクトのUIテスト（Playwright）は、ローカル環境の差異を防ぐため、必ず **Podman** を使用してコンテナ内で実行してください。

### UIテスト実行コマンド

```bash
podman run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.62.1-jammy npx playwright test
```

※ ホストマシン上で直接 `npx playwright test` を実行せず、必ず上記 Podman コマンドを使用してください。

### 補足コマンド
- 特定のテストのみ実行:
  ```bash
  podman run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.62.1-jammy npx playwright test -g "<テスト名パターン>"
  ```
- テスト結果レポート:
  `playwright-report/index.html` に出力されます。

## 2. 実装・検証方針
- すべての実装・不具合修正後は、必ず上記の Podman を用いた Playwright テストを実行して回帰がないことを確認してください。
- ユーザーへの報告やドキュメント、実装計画は日本語で記述してください。
