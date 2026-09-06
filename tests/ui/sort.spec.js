const { test, expect } = require('@playwright/test');

test.describe('おおきさくらべモード UIテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#grid-board .grid-cell');
    await page.waitForFunction(() => typeof window.Blockly !== 'undefined' && !!document.querySelector('#blocklyDiv .blocklySvg'));
  });

  test('おおきさくらべモード: モード切り替えで専用ステージ・3種類の猫・凡例が表示されること', async ({ page }) => {
    // おおきさくらべタブをクリック
    const sortTab = page.locator('.mode-tab[data-mode="sort"]');
    await sortTab.click();
    await expect(sortTab).toHaveClass(/active/);

    // グリッド盤面が非表示になり、おおきさくらべ専用ステージと凡例が表示されること
    await expect(page.locator('#grid-wrapper')).not.toBeVisible();
    await expect(page.locator('#sort-stage')).toBeVisible();
    await expect(page.locator('#legend-sort')).toBeVisible();

    // レベル1はトキ組の1レーンであること
    const tokiLane = page.locator('#sort-lane-toki');
    await expect(tokiLane).toBeVisible();
    await expect(page.locator('#sort-lane-homura')).not.toBeVisible();

    // 3種類の猫（大: サイベ・中: アメショ・小: マンチカン）が初期配置（大->中->小）されていること
    const catSlots = tokiLane.locator('.sort-cat-slot');
    await expect(catSlots).toHaveCount(3);
    await expect(catSlots.nth(0)).toContainText('サイベ');
    await expect(catSlots.nth(1)).toContainText('アメショ');
    await expect(catSlots.nth(2)).toContainText('マンチカン');

    // デフォルトでワークスペースに「いれかえる」「つぎのペアへすすむ」「さいしょにもどる」の3ブロックが配置されていること
    const defaultBlockTypes = await page.evaluate(() => {
      const topBlocks = workspace.getTopBlocks(true);
      const types = [];
      let b = topBlocks[0];
      while (b) {
        types.push(b.type);
        b = b.getNextBlock();
      }
      return types;
    });
    expect(defaultBlockTypes).toEqual(['sort_swap', 'sort_step_next', 'sort_reset_pointer']);

    // 監督猫（トキ）が表示されていること
    await expect(page.locator('#sort-supervisor-toki')).toBeVisible();

    // レベルボタンがおおきさくらべ用（レベル1, 2の2つ）になること
    const levelBtns = page.locator('.level-btn');
    await expect(levelBtns).toHaveCount(2);
  });

  test('おおきさくらべモード レベル1: 「さいしょにもどる」を使わないとクリアできず、完全な手順でクリアできること', async ({ page }) => {
    // おおきさくらべモードに切り替え
    await page.locator('.mode-tab[data-mode="sort"]').click();
    await page.selectOption('#speed-select', '250');

    // 1. 不完全な手順（さいしょにもどる を使わない: いれかえる → すすむ → いれかえる）
    await page.evaluate(() => {
      workspace.clear();
      const s1 = workspace.newBlock('sort_swap');
      const n1 = workspace.newBlock('sort_step_next');
      const s2 = workspace.newBlock('sort_swap');
      s1.nextConnection.connect(n1.previousConnection);
      n1.nextConnection.connect(s2.previousConnection);
      [s1, n1, s2].forEach(b => {
        b.initSvg();
        b.render();
      });
    });

    await page.locator('#run-btn').click();

    // 並び順は [アメショ, マンチカン, サイベ] となり、整列未完了
    const tokiLane = page.locator('#sort-lane-toki');
    const catSlots = tokiLane.locator('.sort-cat-slot');
    await expect(catSlots.nth(0)).toContainText('アメショ', { timeout: 10000 });
    await expect(catSlots.nth(1)).toContainText('マンチカン', { timeout: 10000 });
    await expect(catSlots.nth(2)).toContainText('サイベ', { timeout: 10000 });

    // クリアモーダルは表示されない
    await expect(page.locator('#victory-modal')).toHaveClass(/hidden/);

    // リセット
    await page.locator('#reset-btn').click();

    // 2. 完全な手順（いれかえる → すすむ → いれかえる → さいしょにもどる → いれかえる）
    await page.evaluate(() => {
      workspace.clear();
      const s1 = workspace.newBlock('sort_swap');
      const n1 = workspace.newBlock('sort_step_next');
      const s2 = workspace.newBlock('sort_swap');
      const r1 = workspace.newBlock('sort_reset_pointer');
      const s3 = workspace.newBlock('sort_swap');

      s1.nextConnection.connect(n1.previousConnection);
      n1.nextConnection.connect(s2.previousConnection);
      s2.nextConnection.connect(r1.previousConnection);
      r1.nextConnection.connect(s3.previousConnection);

      [s1, n1, s2, r1, s3].forEach(b => {
        b.initSvg();
        b.render();
      });
    });

    await page.locator('#run-btn').click();

    // 並び順が マンチカン(1) → アメショ(2) → サイベ(3) に整列すること
    await expect(catSlots.nth(0)).toContainText('マンチカン', { timeout: 10000 });
    await expect(catSlots.nth(1)).toContainText('アメショ', { timeout: 10000 });
    await expect(catSlots.nth(2)).toContainText('サイベ', { timeout: 10000 });

    // ゴール達成モーダルが表示されること
    const victoryModal = page.locator('#victory-modal');
    await expect(victoryModal).not.toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#victory-title')).toContainText('きれいに ならんだよ');
  });

  test('おおきさくらべモード レベル2: 2レーン同時に1つの汎用ループプログラム（もし〜なら入れ替える）でクリアできること', async ({ page }) => {
    // おおきさくらべモードに切り替え
    await page.locator('.mode-tab[data-mode="sort"]').click();
    await page.selectOption('#speed-select', '250');

    // レベル2を選択
    const level2Btn = page.locator('.level-btn[data-level="2"]');
    await level2Btn.click();
    await expect(level2Btn).toHaveClass(/active/);

    // トキ組とホムラ組の2レーンが存在すること
    await expect(page.locator('#sort-lane-toki')).toBeVisible();
    await expect(page.locator('#sort-lane-homura')).toBeVisible();

    // レベル2では #sort-stage が縦に長くなり全体が見えること（高さ400px以上）
    const sortStage = page.locator('#sort-stage');
    await expect(sortStage).toHaveClass(/level-2/);
    await expect.poll(async () => {
      const box = await sortStage.boundingBox();
      return box ? box.height : 0;
    }).toBeGreaterThan(400);

    // 汎用ソートプログラム: 3回繰り返す（もし左>右なら{入れ替える}・進む・もし左>右なら{入れ替える}・最初に戻る）
    await page.evaluate(() => {
      workspace.clear();
      const repeatBlock = workspace.newBlock('toki_repeat');
      repeatBlock.setFieldValue('3', 'TIMES');

      const if1 = workspace.newBlock('sort_if');
      const swap1 = workspace.newBlock('sort_swap');
      if1.getInput('DO').connection.connect(swap1.previousConnection);

      const next = workspace.newBlock('sort_step_next');

      const if2 = workspace.newBlock('sort_if');
      const swap2 = workspace.newBlock('sort_swap');
      if2.getInput('DO').connection.connect(swap2.previousConnection);

      const resetPointer = workspace.newBlock('sort_reset_pointer');

      if1.nextConnection.connect(next.previousConnection);
      next.nextConnection.connect(if2.previousConnection);
      if2.nextConnection.connect(resetPointer.previousConnection);

      repeatBlock.getInput('DO').connection.connect(if1.previousConnection);

      [repeatBlock, if1, swap1, next, if2, swap2, resetPointer].forEach(b => {
        b.initSvg();
        b.render();
      });
    });

    await page.locator('#run-btn').click();

    // トキ組・ホムラ組ともに マンチカン → アメショ → サイベ に整列すること
    const tokiSlots = page.locator('#sort-lane-toki .sort-cat-slot');
    const homuraSlots = page.locator('#sort-lane-homura .sort-cat-slot');

    await expect(tokiSlots.nth(0)).toContainText('マンチカン', { timeout: 15000 });
    await expect(tokiSlots.nth(1)).toContainText('アメショ', { timeout: 15000 });
    await expect(tokiSlots.nth(2)).toContainText('サイベ', { timeout: 15000 });

    await expect(homuraSlots.nth(0)).toContainText('マンチカン', { timeout: 15000 });
    await expect(homuraSlots.nth(1)).toContainText('アメショ', { timeout: 15000 });
    await expect(homuraSlots.nth(2)).toContainText('サイベ', { timeout: 15000 });

    // ゴール達成モーダルが表示されること
    const victoryModal = page.locator('#victory-modal');
    await expect(victoryModal).not.toHaveClass(/hidden/, { timeout: 15000 });
  });

  test('おおきさくらべモード: 右端到達時に安全メッセージが表示され、リセットで初期状態に戻ること', async ({ page }) => {
    // おおきさくらべモードに切り替え
    await page.locator('.mode-tab[data-mode="sort"]').click();
    await page.selectOption('#speed-select', '250');

    // 「つぎのペアへすすむ」を2回実行（3匹なので2回目で右端を超える）
    await page.evaluate(() => {
      workspace.clear();
      const b1 = workspace.newBlock('sort_step_next');
      const b2 = workspace.newBlock('sort_step_next');
      b1.nextConnection.connect(b2.previousConnection);
      [b1, b2].forEach(b => { b.initSvg(); b.render(); });
    });

    await page.locator('#run-btn').click();

    // 端っこメッセージが表示されること
    const statusMsg = page.locator('#status-message');
    await expect(statusMsg).toContainText('ここが はしっこニャ！', { timeout: 5000 });

    // リセットボタンで初期配置に戻ること
    await page.locator('#reset-btn').click();
    const tokiSlots = page.locator('#sort-lane-toki .sort-cat-slot');
    await expect(tokiSlots.nth(0)).toContainText('サイベ');
    await expect(tokiSlots.nth(1)).toContainText('アメショ');
    await expect(tokiSlots.nth(2)).toContainText('マンチカン');
  });
});
