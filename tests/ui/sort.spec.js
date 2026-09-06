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

    // レベルボタンがおおきさくらべ用（レベル1, 2, 3の3つ）になること
    const levelBtns = page.locator('.level-btn');
    await expect(levelBtns).toHaveCount(3);
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

  test('おおきさくらべモード レベル3: 2レーン・4匹編成が表示され、1つの汎用プログラムでクリアできること', async ({ page }) => {
    // おおきさくらべモードに切り替え
    await page.locator('.mode-tab[data-mode="sort"]').click();
    await page.selectOption('#speed-select', '250');

    // レベル3を選択
    const level3Btn = page.locator('.level-btn[data-level="3"]');
    await level3Btn.click();
    await expect(level3Btn).toHaveClass(/active/);

    // トキ組とホムラ組の2レーンが存在すること
    const tokiLane = page.locator('#sort-lane-toki');
    const homuraLane = page.locator('#sort-lane-homura');
    await expect(tokiLane).toBeVisible();
    await expect(homuraLane).toBeVisible();

    // 各レーンに4匹の猫が表示されること
    const tokiSlots = tokiLane.locator('.sort-cat-slot');
    const homuraSlots = homuraLane.locator('.sort-cat-slot');
    await expect(tokiSlots).toHaveCount(4);
    await expect(homuraSlots).toHaveCount(4);

    // トキ組の初期配置: メインクーン(4) -> サイベ(3) -> アメショ(2) -> マンチカン(1)
    await expect(tokiSlots.nth(0)).toContainText('メインクーン');
    await expect(tokiSlots.nth(1)).toContainText('サイベ');
    await expect(tokiSlots.nth(2)).toContainText('アメショ');
    await expect(tokiSlots.nth(3)).toContainText('マンチカン');

    // ホムラ組の初期配置: アメショ(2) -> メインクーン(4) -> マンチカン(1) -> サイベ(3)
    await expect(homuraSlots.nth(0)).toContainText('アメショ');
    await expect(homuraSlots.nth(1)).toContainText('メインクーン');
    await expect(homuraSlots.nth(2)).toContainText('マンチカン');
    await expect(homuraSlots.nth(3)).toContainText('サイベ');

    // 4匹用の汎用ソートプログラム:
    // 3回繰り返す（ [もし入替 -> 次へ] -> [もし入替 -> 次へ] -> [もし入替] -> 最初に戻る ）
    await page.evaluate(() => {
      workspace.clear();
      const repeatBlock = workspace.newBlock('toki_repeat');
      repeatBlock.setFieldValue('3', 'TIMES');

      const if1 = workspace.newBlock('sort_if');
      const swap1 = workspace.newBlock('sort_swap');
      if1.getInput('DO').connection.connect(swap1.previousConnection);

      const next1 = workspace.newBlock('sort_step_next');

      const if2 = workspace.newBlock('sort_if');
      const swap2 = workspace.newBlock('sort_swap');
      if2.getInput('DO').connection.connect(swap2.previousConnection);

      const next2 = workspace.newBlock('sort_step_next');

      const if3 = workspace.newBlock('sort_if');
      const swap3 = workspace.newBlock('sort_swap');
      if3.getInput('DO').connection.connect(swap3.previousConnection);

      const resetPointer = workspace.newBlock('sort_reset_pointer');

      if1.nextConnection.connect(next1.previousConnection);
      next1.nextConnection.connect(if2.previousConnection);
      if2.nextConnection.connect(next2.previousConnection);
      next2.nextConnection.connect(if3.previousConnection);
      if3.nextConnection.connect(resetPointer.previousConnection);

      repeatBlock.getInput('DO').connection.connect(if1.previousConnection);

      [repeatBlock, if1, swap1, next1, if2, swap2, next2, if3, swap3, resetPointer].forEach(b => {
        b.initSvg();
        b.render();
      });
    });

    await page.locator('#run-btn').click();

    // トキ組・ホムラ組ともに マンチカン(1) -> アメショ(2) -> サイベ(3) -> メインクーン(4) に整列すること
    await expect(tokiSlots.nth(0)).toContainText('マンチカン', { timeout: 20000 });
    await expect(tokiSlots.nth(1)).toContainText('アメショ', { timeout: 20000 });
    await expect(tokiSlots.nth(2)).toContainText('サイベ', { timeout: 20000 });
    await expect(tokiSlots.nth(3)).toContainText('メインクーン', { timeout: 20000 });

    await expect(homuraSlots.nth(0)).toContainText('マンチカン', { timeout: 20000 });
    await expect(homuraSlots.nth(1)).toContainText('アメショ', { timeout: 20000 });
    await expect(homuraSlots.nth(2)).toContainText('サイベ', { timeout: 20000 });
    await expect(homuraSlots.nth(3)).toContainText('メインクーン', { timeout: 20000 });

    // ゴール達成モーダルが表示されること
    const victoryModal = page.locator('#victory-modal');
    await expect(victoryModal).not.toHaveClass(/hidden/, { timeout: 20000 });
  });

  test('おおきさくらべモード: 「もし」ブロックで「いちばんうしろ」条件が正しく判定されること', async ({ page }) => {
    // おおきさくらべモード レベル2に切り替え
    await page.locator('.mode-tab[data-mode="sort"]').click();
    await page.selectOption('#speed-select', '250');
    await page.locator('.level-btn[data-level="2"]').click();

    // プログラム:
    // 1. つぎのペアへすすむ (pointer: 0 -> 1 = いちばんうしろ)
    // 2. もし [いちばんうしろ] なら [さいしょにもどる]
    await page.evaluate(() => {
      workspace.clear();
      const next = workspace.newBlock('sort_step_next');
      const ifBlock = workspace.newBlock('sort_if');
      ifBlock.setFieldValue('at_end', 'CONDITION');

      const resetBlock = workspace.newBlock('sort_reset_pointer');
      ifBlock.getInput('DO').connection.connect(resetBlock.previousConnection);

      next.nextConnection.connect(ifBlock.previousConnection);

      [next, ifBlock, resetBlock].forEach(b => {
        b.initSvg();
        b.render();
      });
    });

    await page.locator('#run-btn').click();

    // 1回進んで一番後ろになった後、最初に戻るので、最終的にステータスメッセージに「さいしょの ペア」が含まれること
    const statusMsg = page.locator('#status-message');
    await expect(statusMsg).toContainText('さいしょの ペア', { timeout: 10000 });
  });

  test('おおきさくらべモード: 「もし、そうでなければ」ブロックはレベル2にはなくレベル3でのみ利用可能であること', async ({ page }) => {
    // おおきさくらべモード レベル2に切り替え
    await page.locator('.mode-tab[data-mode="sort"]').click();
    await page.locator('.level-btn[data-level="2"]').click();

    // レベル2のツールボックスXMLには sort_if_else が含まれないこと
    const hasIfElseLv2 = await page.evaluate(() => {
      const toolboxXml = document.getElementById('toolbox-sort-lv2');
      return toolboxXml ? toolboxXml.querySelector('block[type="sort_if_else"]') !== null : false;
    });
    expect(hasIfElseLv2).toBe(false);

    // レベル3に切り替え
    await page.locator('.level-btn[data-level="3"]').click();

    // レベル3のツールボックスXMLには sort_if_else が含まれること
    const hasIfElseLv3 = await page.evaluate(() => {
      const toolboxXml = document.getElementById('toolbox-sort-lv3');
      return toolboxXml ? toolboxXml.querySelector('block[type="sort_if_else"]') !== null : false;
    });
    expect(hasIfElseLv3).toBe(true);
  });

  test('おおきさくらべモード レベル3: 「もし、そうでなければ」を使って汎用バブルソートでクリアできること', async ({ page }) => {
    // おおきさくらべモード レベル3に切り替え
    await page.locator('.mode-tab[data-mode="sort"]').click();
    await page.selectOption('#speed-select', '250');
    await page.locator('.level-btn[data-level="3"]').click();

    // プログラム構築:
    // 12回くりかえす:
    //   もし [ひだり>みぎ] なら:
    //     いれかえる
    //   もし [いちばんうしろ] なら:
    //     さいしょにもどる
    //   そうでなければ:
    //     つぎのペアへすすむ
    await page.evaluate(() => {
      workspace.clear();
      const repeatBlock = workspace.newBlock('toki_repeat');
      repeatBlock.setFieldValue('12', 'TIMES');

      const ifGreater = workspace.newBlock('sort_if');
      ifGreater.setFieldValue('greater', 'CONDITION');
      const swap = workspace.newBlock('sort_swap');
      ifGreater.getInput('DO').connection.connect(swap.previousConnection);

      const ifElseBlock = workspace.newBlock('sort_if_else');
      ifElseBlock.setFieldValue('at_end', 'CONDITION');

      const resetPointer = workspace.newBlock('sort_reset_pointer');
      ifElseBlock.getInput('DO').connection.connect(resetPointer.previousConnection);

      const stepNext = workspace.newBlock('sort_step_next');
      ifElseBlock.getInput('ELSE').connection.connect(stepNext.previousConnection);

      // ifGreater の次に ifElseBlock を繋ぐ
      ifGreater.nextConnection.connect(ifElseBlock.previousConnection);

      // repeatBlock の中に ifGreater を入れる
      repeatBlock.getInput('DO').connection.connect(ifGreater.previousConnection);

      [repeatBlock, ifGreater, swap, ifElseBlock, resetPointer, stepNext].forEach(b => {
        b.initSvg();
        b.render();
      });
    });

    await page.locator('#run-btn').click();

    const tokiSlots = page.locator('#sort-lane-toki .sort-cat-slot');
    const homuraSlots = page.locator('#sort-lane-homura .sort-cat-slot');

    // トキ組・ホムラ組ともに マンチカン(1) -> アメショ(2) -> サイベ(3) -> メインクーン(4) に整列すること
    await expect(tokiSlots.nth(0)).toContainText('マンチカン', { timeout: 20000 });
    await expect(tokiSlots.nth(1)).toContainText('アメショ', { timeout: 20000 });
    await expect(tokiSlots.nth(2)).toContainText('サイベ', { timeout: 20000 });
    await expect(tokiSlots.nth(3)).toContainText('メインクーン', { timeout: 20000 });

    await expect(homuraSlots.nth(0)).toContainText('マンチカン', { timeout: 20000 });
    await expect(homuraSlots.nth(1)).toContainText('アメショ', { timeout: 20000 });
    await expect(homuraSlots.nth(2)).toContainText('サイベ', { timeout: 20000 });
    await expect(homuraSlots.nth(3)).toContainText('メインクーン', { timeout: 20000 });

    // ゴール達成モーダルが表示されること
    const victoryModal = page.locator('#victory-modal');
    await expect(victoryModal).not.toHaveClass(/hidden/, { timeout: 20000 });
  });
});

