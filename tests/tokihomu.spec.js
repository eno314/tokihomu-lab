const { test, expect } = require('@playwright/test');

test.describe('tokihomu-lab (ときほむラボ) UIテスト', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にトップページへアクセス
    await page.goto('/');
    // 盤面セルの描画完了を待機
    await page.waitForSelector('#grid-board .grid-cell');
  });

  test('初期表示: タイトル、ヘッダー、主要コンポーネントが正しく表示されること', async ({ page }) => {
    // ページタイトル
    await expect(page).toHaveTitle(/tokihomu-lab/);

    // ヘッダー
    const headerTitle = page.locator('.app-title');
    await expect(headerTitle).toContainText('ときほむラボ');

    // 操作パネルとボタン
    await expect(page.locator('#run-btn')).toBeVisible();
    await expect(page.locator('#reset-btn')).toBeVisible();
    await expect(page.locator('#speed-select')).toBeVisible();

    // 盤面 (5x5 = 25セル)
    const cells = page.locator('#grid-board .grid-cell');
    await expect(cells).toHaveCount(25);

    // キャラクター（トキ）とゴール（ホムラ）
    await expect(page.locator('#toki-character')).toBeVisible();
    await expect(page.locator('.homura-avatar')).toBeVisible();

    // 初期メッセージ
    const statusMsg = page.locator('#status-message');
    await expect(statusMsg).toContainText('「うごかす！」ボタンをおすと、トキがうごきだすよ！');

    // レベル1がアクティブ
    const level1Btn = page.locator('.level-btn[data-level="1"]');
    await expect(level1Btn).toHaveClass(/active/);

    // レベル1では障害物凡例は非表示
    await expect(page.locator('#legend-obstacle')).not.toBeVisible();
  });

  test('レベル切り替え: レベル変更で障害物や盤面表示が切り替わること', async ({ page }) => {
    // レベル2を選択
    const level2Btn = page.locator('.level-btn[data-level="2"]');
    await level2Btn.click();
    await expect(level2Btn).toHaveClass(/active/);

    // 障害物凡例が表示される
    await expect(page.locator('#legend-obstacle')).toBeVisible();

    // ダンボール障害物が盤面に表示される（レベル2は5個）
    const obstacles = page.locator('.obstacle-cell');
    await expect(obstacles).toHaveCount(5);

    // レベル3を選択
    const level3Btn = page.locator('.level-btn[data-level="3"]');
    await level3Btn.click();
    await expect(level3Btn).toHaveClass(/active/);

    // レベル3は障害物なし（0個）、凡例非表示
    await expect(page.locator('#legend-obstacle')).not.toBeVisible();
    await expect(page.locator('.obstacle-cell')).toHaveCount(0);

    // メッセージがレベル3用のものに変化
    await expect(page.locator('#status-message')).toContainText('ホムラが トキのめいれい');

    // レベル1に戻す
    const level1Btn = page.locator('.level-btn[data-level="1"]');
    await level1Btn.click();
    await expect(level1Btn).toHaveClass(/active/);
    await expect(page.locator('.obstacle-cell')).toHaveCount(0);
  });

  test('スピード設定: はやさのセレクトボックスの変更ができること', async ({ page }) => {
    const speedSelect = page.locator('#speed-select');
    await expect(speedSelect).toHaveValue('450');

    await speedSelect.selectOption('250');
    await expect(speedSelect).toHaveValue('250');

    await speedSelect.selectOption('700');
    await expect(speedSelect).toHaveValue('700');
  });

  test('プログラム実行とリセット: うごかすボタンでトキが移動し、リセットボタンで戻ること', async ({ page }) => {
    // テスト高速化のため「はやい！」に設定
    await page.selectOption('#speed-select', '250');

    const toki = page.locator('#toki-character');
    const runBtn = page.locator('#run-btn');
    const resetBtn = page.locator('#reset-btn');
    const statusMsg = page.locator('#status-message');

    // 初期位置を確認 (translate(0px, 0px))
    await expect(toki).toHaveAttribute('style', /translate\(0px,\s*0px\)/);

    // 初期配置ブロック（前進×2）を実行
    await runBtn.click();

    // 実行完了でメッセージが「ホムラをつかまえられなかったよ…！」に変わるのを待機
    await expect(statusMsg).toContainText('ホムラをつかまえられなかったよ', { timeout: 10000 });

    // トキが初期位置から移動している（右方向に2マス進む）
    const movedStyle = await toki.getAttribute('style');
    expect(movedStyle).not.toContain('translate(0px, 0px)');

    // リセットボタンを押すと初期位置に戻る
    await resetBtn.click();
    await expect(toki).toHaveAttribute('style', /translate\(0px,\s*0px\)/);

    // 「うごかす！」ボタンが再び有効になる
    await expect(runBtn).toBeEnabled();

    // メッセージがスタート時のものに戻る
    await expect(statusMsg).toContainText('「うごかす！」ボタンをおすと、トキがうごきだすよ！');
  });

  test('ゴール達成モーダル: ホムラ到達時にお祝いモーダルが表示され、次のレベルに進めること', async ({ page }) => {
    const victoryModal = page.locator('#victory-modal');
    await expect(victoryModal).toHaveClass(/hidden/);

    // ゴール演出関数をトリガー
    await page.evaluate(() => {
      onGoalReached();
    });

    // モーダルが表示される（setTimeout 400ms のため待機）
    await expect(victoryModal).not.toHaveClass(/hidden/, { timeout: 3000 });
    await expect(page.locator('#victory-title')).toBeVisible();

    // 「レベル 2 へすすむ！ 🐾」ボタンをクリック
    const nextBtn = page.locator('#modal-next-btn');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // モーダルが閉じ、レベル2になる
    await expect(victoryModal).toHaveClass(/hidden/);
    const level2Btn = page.locator('.level-btn[data-level="2"]');
    await expect(level2Btn).toHaveClass(/active/);
  });
});
