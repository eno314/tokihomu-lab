const { test, expect } = require('@playwright/test');

test.describe('共通UI・コントロールテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#grid-board .grid-cell');
    await page.waitForFunction(() => typeof window.Blockly !== 'undefined' && !!document.querySelector('#blocklyDiv .blocklySvg'));
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

  test('スピード設定: はやさのセレクトボックスの変更ができること', async ({ page }) => {
    const speedSelect = page.locator('#speed-select');
    await expect(speedSelect).toHaveValue('450');

    await speedSelect.selectOption('250');
    await expect(speedSelect).toHaveValue('250');

    await speedSelect.selectOption('700');
    await expect(speedSelect).toHaveValue('700');
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
