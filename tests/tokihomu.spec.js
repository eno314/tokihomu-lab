const { test, expect } = require('@playwright/test');

test.describe('tokihomu-lab (ときほむラボ) UIテスト', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にトップページへアクセス
    await page.goto('/');
    // 盤面セルの描画完了およびBlocklyの初期化完了を待機
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

  test('おもちゃあつめモード: モード切り替えで専用UI・おもちゃセル・凡例が表示されること', async ({ page }) => {
    // おもちゃあつめタブをクリック
    const toyTab = page.locator('.mode-tab[data-mode="toy"]');
    await toyTab.click();
    await expect(toyTab).toHaveClass(/active/);

    // おもちゃカウンターと凡例が表示される
    await expect(page.locator('#toy-counter')).toBeVisible();
    await expect(page.locator('#toy-counter-text')).toHaveText('0 / 1');
    await expect(page.locator('#legend-toy')).toBeVisible();

    // 盤面におもちゃセル（1個）が存在する
    const toyCells = page.locator('.toy-cell');
    await expect(toyCells).toHaveCount(1);

    // レベルボタンがおもちゃモード用（レベル1, 2）になる
    const levelBtns = page.locator('.level-btn');
    await expect(levelBtns).toHaveCount(2);

    // レベル2に切り替え
    const level2Btn = page.locator('.level-btn[data-level="2"]');
    await level2Btn.click();
    await expect(level2Btn).toHaveClass(/active/);
    await expect(page.locator('#toy-counter-text')).toHaveText('0 / 2');
    await expect(page.locator('.toy-cell')).toHaveCount(2);

    // おにごっこタブに戻す
    const chaseTab = page.locator('.mode-tab[data-mode="chase"]');
    await chaseTab.click();
    await expect(chaseTab).toHaveClass(/active/);
    await expect(page.locator('#toy-counter')).not.toBeVisible();
    await expect(page.locator('#legend-toy')).not.toBeVisible();
    await expect(page.locator('.toy-cell')).toHaveCount(0);
    await expect(page.locator('.level-btn')).toHaveCount(4);
  });

  test('おもちゃあつめモード: 空振り時にエラー停止せず注意喚起メッセージが表示されること', async ({ page }) => {
    // おもちゃあつめモードに切り替え
    await page.locator('.mode-tab[data-mode="toy"]').click();
    await page.selectOption('#speed-select', '250');

    // スタート地点（0, 0: おもちゃなし）で「おもちゃを ひろう」ブロックを配置
    await page.evaluate(() => {
      workspace.clear();
      const pickupBlock = workspace.newBlock('toki_pickup');
      pickupBlock.initSvg();
      pickupBlock.render();
      pickupBlock.moveTo(new Blockly.utils.Coordinate(30, 30));
    });

    await page.locator('#run-btn').click();

    // 空振りメッセージを確認
    const statusMsg = page.locator('#status-message');
    await expect(statusMsg).toContainText('ここには ぬいぐるみが ないよ', { timeout: 5000 });
  });

  test('おもちゃあつめモード: おもちゃ未回収のままホムラに到達してもクリアにならないこと', async ({ page }) => {
    // おもちゃあつめモードに切り替え（レベル1: トキ(0,0), おもちゃ(2,0), ホムラ(4,0)）
    await page.locator('.mode-tab[data-mode="toy"]').click();
    await page.selectOption('#speed-select', '250');

    // おもちゃを拾わずに前進×4でホムラに直行するプログラムを配置
    await page.evaluate(() => {
      workspace.clear();
      const b1 = workspace.newBlock('toki_move');
      const b2 = workspace.newBlock('toki_move');
      const b3 = workspace.newBlock('toki_move');
      const b4 = workspace.newBlock('toki_move');
      b1.nextConnection.connect(b2.previousConnection);
      b2.nextConnection.connect(b3.previousConnection);
      b3.nextConnection.connect(b4.previousConnection);
      b1.initSvg(); b1.render();
      b2.initSvg(); b2.render();
      b3.initSvg(); b3.render();
      b4.initSvg(); b4.render();
    });

    await page.locator('#run-btn').click();

    // ホムラが「ぬいぐるみが まだ たりない」と注意し、ゴールモーダルは表示されない
    const statusMsg = page.locator('#status-message');
    await expect(statusMsg).toContainText('ぬいぐるみが まだ たりない', { timeout: 10000 });
    await expect(page.locator('#victory-modal')).toHaveClass(/hidden/);
  });

  test('おもちゃあつめモード: おもちゃを回収してからホムラに到達するとクリアできること', async ({ page }) => {
    // おもちゃあつめモードに切り替え（レベル1: トキ(0,0), おもちゃ(2,0), ホムラ(4,0)）
    await page.locator('.mode-tab[data-mode="toy"]').click();
    await page.selectOption('#speed-select', '250');

    // 前進×2 → ひろう → 前進×2
    await page.evaluate(() => {
      workspace.clear();
      const m1 = workspace.newBlock('toki_move');
      const m2 = workspace.newBlock('toki_move');
      const p = workspace.newBlock('toki_pickup');
      const m3 = workspace.newBlock('toki_move');
      const m4 = workspace.newBlock('toki_move');

      m1.nextConnection.connect(m2.previousConnection);
      m2.nextConnection.connect(p.previousConnection);
      p.nextConnection.connect(m3.previousConnection);
      m3.nextConnection.connect(m4.previousConnection);

      [m1, m2, p, m3, m4].forEach(b => { b.initSvg(); b.render(); });
    });

    await page.locator('#run-btn').click();

    // おもちゃ回収でカウンターが「1 / 1」に更新されること
    await expect(page.locator('#toy-counter-text')).toHaveText('1 / 1', { timeout: 10000 });

    // ゴール達成モーダルが表示されること
    const victoryModal = page.locator('#victory-modal');
    await expect(victoryModal).not.toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#victory-title')).toContainText('ぬいぐるみを ぜんぶ とどけたよ');
  });
});
