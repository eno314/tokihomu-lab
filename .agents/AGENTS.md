# Agent Rules for tokihomu-lab

## 1. 開発環境・テスト実行

本プロジェクトのテスト（UIテスト・ユニットテスト）は、ローカル環境の差異を防ぐため、必ず **Podman** を使用してコンテナ内で実行してください。

### UIテスト (Playwright) 実行コマンド

```bash
podman run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.62.1-jammy npx playwright test
```

※ ホストマシン上で直接 `npx playwright test` を実行せず、必ず上記 Podman コマンドを使用してください。

- 特定のテストのみ実行:
  ```bash
  podman run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.62.1-jammy npx playwright test -g "<テスト名パターン>"
  ```
- テスト結果レポート:
  `playwright-report/index.html` に出力されます。

### ユニットテスト (Vitest) 実行コマンド

```bash
podman run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.62.1-jammy npm run test:unit
```

※ ドメインロジックの変更時は、必ず上記コマンドでユニットテストを実行してください。

## 2. 設計・アーキテクチャ方針

- **レイヤー構成と責務分離**:
  - `src/constants/`: 定数データ（レベル設定、SVGアセット）
  - `src/domain/`: ビジネスロジック（移動・衝突・ソート・ゴール判定・評価等）
  - `src/state/`: 状態管理（イミュータブルな状態更新ヘルパーとStore）
  - `src/blockly/`: Blocklyブロック定義およびASTコマンド解析
  - `src/execution/`: プログラム実行エンジン
  - `src/ui/`: DOM操作、盤面描画、メッセージ、モーダル
- **FP（関数型プログラミング）志向**:
  - `src/domain/` 配下のビジネスロジックは DOM や Blockly、グローバル変数に依存しない **純粋関数（Pure Functions）** として実装する。
  - 状態遷移はミューテーションではなく、イミュータブルな更新（引数の状態をもとに新しい状態を返す）とする。
  - これにより、Vitestを用いたミリ秒単位の高速かつ決定論的なユニットテストを可能にする。
- **ミニマムな依存関係**:
  - UIライブラリ（React/Vue等）は使わず、ブラウザ標準のバニラJSとネイティブ ES Modules を利用する。
  - ビルドツールやバンドラーを不要とし、保守性を最大化する。

## 3. 実装・検証方針
- すべての実装・不具合修正後は、必ず上記の Podman を用いたユニットテストおよび Playwright テストを実行して回帰がないことを確認してください。
- コードの実装・設計・リファクタリングにあたっては、必ず [implementation_policy.md](./implementation_policy.md) の各原則（データ駆動設計、純粋関数、10行ルール、No else、ネスト制限等）を遵守してください。
- ユーザーへの報告やドキュメント、実装計画は日本語で記述してください。

