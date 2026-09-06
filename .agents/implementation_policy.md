# Implementation Policy

本ドキュメントは、`tokihomu-lab` プロジェクトにおけるコード設計および実装ガイドラインを定義する。
コードを記述するすべての者（人間および AI エージェント）はこのガイドラインに従うこと。

---

## 1. Library and Framework Usage

**原則: Web 標準 API（バニラ JS / DOM / CSS）および標準言語機能を最大限活用する。外部依存関係は必要最小限に留める。**

サードパーティライブラリを新規採用する場合は、以下の **4 つの基準すべて** を満たす必要がある:

| 基準 | 説明 |
|---|---|
| 最小限の表面積 (Minimal surface area) | 単一の責務に集中しており、不要な機能を持ち込まない |
| 実績と長寿命 (Proven longevity) | 安定した運用実績がある（目安: 初回リリースから 2 年以上） |
| 活発なメンテナンス (Actively maintained) | 過去 1 年以内にコミットやバグ修正が行われている |
| 自前実装の高コスト (High cost to self-implement) | 同等機能を自前実装することが現実的でない |

1 つでも満たさない場合は採用せず、標準機能で自作すること。

**現在承認されている外部依存関係:**
- `Blockly` (Google) — ビジュアルプログラミングブロック環境。自前実装コストが極めて高い。
- `Vitest` — ドメインロジックの高速ユニットテストランナー。
- `Playwright` — エンドツーエンドのブラウザ統合テストツール。

※ React / Vue 等のフロントエンドフレームワークや、Webpack / Vite 等のバンドラーは導入せず、ブラウザ標準のネイティブ ES Modules を利用する。

---

## 2. Comments

**原則: コードそのものを自己説明的に書く。コメントは「Why（なぜそうしたか）」のみを説明し、「What（何をしているか）」や「How（どうやっているか）」は書かない。**

### 許容されるコメント

**直感に反する実装理由（Non-obvious rationale）** — 一見すると奇妙に見える実装の背景や意図を説明する:

```javascript
// レーン右端に到達したとき、ポインタインクリメントを抑制して安全メッセージを表示する
if (currentPointer >= maxPointer) {
  return { nextPointer: currentPointer, isOutOfBounds: true };
}
```

**目印フラグ（Marker flags）** — 将来の対応が必要な箇所を示す:

```javascript
// TODO: アニメーション速度をユーザー設定可能にする
const delay = 450;
```

### 許容されないコメント

- コードをそのまま言い換えるコメント: `// i をインクリメント`
- 関数名や変数名から自明な内容: `// 向きを右にする`
- 装飾的なブロック区切り: `// --- レンダリング ---`

---

## 3. Data-Driven Design

**原則: 振る舞いを「データ」として表現し、コードはそれを解釈する薄いロジックにする。**

### コマンドルーティング / ディスパッチテーブル

コマンドやブロックタイプの分岐に巨大な `switch` や `if-else` チェーンを使用せず、マップまたはオブジェクトのルックアップテーブルで表現する。

```javascript
// Bad: 新しいコマンドが増えるたびに switch / if-else が肥大化する
if (cmd.type === 'MOVE') {
  handleMove();
} else if (cmd.type === 'TURN_LEFT') {
  handleTurnLeft();
}

// Good: データ（マップ）がコードを駆動する
const COMMAND_HANDLERS = {
  MOVE: executeMove,
  TURN_LEFT: executeTurnLeft,
  TURN_RIGHT: executeTurnRight,
  PICKUP: executePickup
};

const handler = COMMAND_HANDLERS[cmd.type];
if (!handler) {
  throw new Error(`Unknown command: ${cmd.type}`);
}
handler(state, cmd);
```

### テーブル駆動テスト (Table-Driven Tests)

テストの入力と期待値をテーブル（オブジェクトの配列）として宣言し、ループまたは `it.each` で実行する。

```javascript
const cases = [
  { dir: DIRECTIONS.UP, expected: { x: 2, y: 1 } },
  { dir: DIRECTIONS.RIGHT, expected: { x: 3, y: 2 } },
  { dir: DIRECTIONS.DOWN, expected: { x: 2, y: 3 } },
  { dir: DIRECTIONS.LEFT, expected: { x: 1, y: 2 } }
];

it.each(cases)('向き $dir で正しく移動すること', ({ dir, expected }) => {
  expect(getNextPosition(2, 2, dir)).toEqual(expected);
});
```

### 状態管理: ルックアップテーブルによる状態遷移

状態遷移やモード別マッピングは、オブジェクトによるルックアップテーブルで表現する。

```javascript
const LEVELS_BY_MODE = {
  chase: LEVELS_CHASE,
  toy: LEVELS_TOY,
  sort: LEVELS_SORT
};

export function getLevelsForMode(mode) {
  return LEVELS_BY_MODE[mode] || LEVELS_CHASE;
}
```

---

## 4. Pure Functions and Localizing Side Effects

**原則: ビジネスロジックは純粋関数（Pure Functions）として実装する。副作用（DOM操作、乱数、時間、外部ストレージ）はエントリポイント層に局所化し、引数として注入する。**

### 副作用と対処法

| 副作用 | 対処方針 |
|---|---|
| 乱数 (`Math.random`) | 乱数結果または真偽値を引数として注入する |
| 時間・タイマー (`Date.now`, `setTimeout`) | 基準時刻やコールバックを引数として注入する |
| DOM 操作 | `src/ui/` 層に閉じ込め、`src/domain/` からは一切 DOM に触れない |
| グローバル状態 | 状態引数を受け取り、新しい状態オブジェクトを返す（イミュータブル更新） |

---

## 5. Error Handling

**原則: エラーは値として扱い、純粋関数から戻り値として伝播させる。**

- **ビジネスロジック内で勝手に UI 出力やアラートを出さない。** ドメイン層は判定結果やエラー情報をオブジェクトとして返し、呼び出し元の UI 層・実行層が表示やフローを制御する。
- **エラー情報の文脈を明確にする。** 呼び出し元が原因を判断できるよう、識別子や説明をオブジェクト内に含める。

---

## 6. Minimal Interface Design

**原則: 呼び出し元が真に必要とする最小限の引数とデータ構造を定義する。**

- **不要に肥大化したオブジェクトを要求しない。** 必要なプロパティのみを明示的に渡す。
- **モックフレームワークは使わない。** 純粋関数であればモックは不要。必要な場合でも単純なインラインオブジェクトやスタブ関数で賄う。

---

## 7. Function Organization and Single Responsibility

**原則: ファイルは Top-Down 順に整理し、各関数は単一の明確な責務を持つようにする。**

- **Top-Down の配置:** 公開関数・高レベルエントリポイントをファイル上部に配置し、それが呼び出すプライベートヘルパー関数をその直下に配置する。
- **単一責任と命名:** 1つの関数は1つのことだけを行う。関数名に "And" が含まれる場合（例: `parseAndValidate`）は、責務が複数あるサインなので関数を分割する。

---

## 8. Function Size and Control Flow

**原則: 関数は短く、フラットで、集中したものにする。「Five Lines of Code」のコア概念を適用する。**

### 関数の長さ制限 (10 行ルール)

関数の本体は **10 行以内**（波括弧 `{}` を除く）とする。
- 実際のビジネスロジックは **5 行以内** を目指す。

### `else` の禁止とガード節 (Guard Clauses) の優先

`else` キーワードは使用しない。エラーケースや境界条件を最初に判定して早期リターン（Early Return）し、正常系（Happy Path）のインデントを最小に保つ。

```javascript
// Bad: else を使うことでネストと認知負荷が増加する
function checkLane(lane) {
  if (lane && lane.cats) {
    return lane.cats.length > 0;
  } else {
    return false;
  }
}

// Good: ガード節でフラットにする
function checkLane(lane) {
  if (!lane || !lane.cats) return false;
  return lane.cats.length > 0;
}
```

### ネストレベルの制限 (最大 1 レベル)

単一の関数内でのネスト（`if`、`for` 等）は **最大 1 レベル** とする。2 レベル目のネストが必要な場合は、内側のブロックをヘルパー関数として抽出する。

```javascript
// Bad: 2 レベルのネスト (for -> if)
function updateAll(items) {
  for (const item of items) {
    if (item.active) {
      processItem(item);
    }
  }
}

// Good: 内部ロジックを抽出してネストを 1 レベルに抑制
function updateAll(items) {
  items.filter(item => item.active).forEach(processItem);
}
```

---

## 9. Code Review and Quality Gates

**原則: 実装変更時は `code-review-and-quality` スキルを活用して多軸レビューを行う。**

変更を確定する前に、以下の 5 軸（Correctness, Readability, Architecture, Security, Performance）で自己検証を行い、回帰テスト（Vitest & Playwright）を全件パスさせること。

---

## 優先順位 (Priority Order)

ガイドライン同士が競合した場合は、以下の順序で優先する:

1. **Correct (正確性)** — バグがなく、要件を満たしていること
2. **Readable (可読性)** — 意図が誰にでも容易に伝わること（単一責任、Top-Down 順、No else）
3. **Testable (テスタビリティ)** — 純粋関数、局所化された副作用
4. **Malleable (適応性・柔軟性)** — データ駆動設計、依存性の注入
5. **Minimal dependencies (最小限の依存関係)** — 外部ライブラリを最小限に保つ
