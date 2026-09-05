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

    // 盤面におもちゃセル（1個、真ん中: 2, 2）が存在する
    const toyCells = page.locator('.toy-cell');
    await expect(toyCells).toHaveCount(1);
    await expect(toyCells.first()).toHaveAttribute('data-x', '2');
    await expect(toyCells.first()).toHaveAttribute('data-y', '2');

    // ゴールが右下 (4, 4) に存在すること
    const goalCell = page.locator('.goal-cell');
    await expect(goalCell).toHaveAttribute('data-x', '4');
    await expect(goalCell).toHaveAttribute('data-y', '4');

    // ぬいぐるみあつめモードでは操作キャラがホムラ、ゴールがトキになること
    await expect(page.locator('#toki-character .homura-svg')).toBeVisible();
    await expect(page.locator('.goal-cell .toki-avatar')).toBeVisible();
    await expect(page.locator('#legend-start')).toHaveText('🚩 スタート: ホムラ (🐈)');
    await expect(page.locator('#legend-goal')).toHaveText('🎯 ゴール: トキ (🐾)');

    // レベルボタンがおもちゃモード用（レベル1, 2, 3）になる
    const levelBtns = page.locator('.level-btn');
    await expect(levelBtns).toHaveCount(3);

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

    // おにごっこモードに戻すと操作キャラがトキ、ゴールがホムラになること
    await expect(page.locator('#toki-character .toki-svg')).toBeVisible();
    await expect(page.locator('.goal-cell .homura-avatar')).toBeVisible();
    await expect(page.locator('#legend-start')).toHaveText('🚩 スタート: トキ (🐾)');
    await expect(page.locator('#legend-goal')).toHaveText('🎯 ゴール: ホムラ (🐈)');
  });

  test('おもちゃあつめモード: 空振り時にエラー停止せず注意喚起メッセージが表示されること', async ({ page }) => {
    // おもちゃあつめモードに切り替え
    const toyTab = page.locator('.mode-tab[data-mode="toy"]');
    await toyTab.click();
    await page.selectOption('#speed-select', '250');

    // スタート地点（0, 0: おもちゃなし）で「ぬいぐるみを ひろう」ブロックを配置
    await page.evaluate(() => {
      workspace.clear();
      const pickupBlock = workspace.newBlock('toki_pickup');
      pickupBlock.initSvg();
      pickupBlock.render();
    });

    await page.locator('#run-btn').click();

    // 空振りメッセージを確認
    const statusMsg = page.locator('#status-message');
    await expect(statusMsg).toContainText('ここには ぬいぐるみが ないよ', { timeout: 5000 });
  });

  test('おもちゃあつめモード: ぬいぐるみ未回収のままトキに到達してもクリアにならないこと', async ({ page }) => {
    // おもちゃあつめモードに切り替え（レベル1: ホムラ(0,0), ぬいぐるみ(2,2), トキ(4,4)）
    await page.locator('.mode-tab[data-mode="toy"]').click();
    await page.selectOption('#speed-select', '250');

    // ぬいぐるみを拾わずにトキに到達するプログラムを配置（外周を通る: 前進×4、右向く、前進×4）
    await page.evaluate(() => {
      workspace.clear();
      const blocks = [];
      for (let i = 0; i < 4; i++) blocks.push(workspace.newBlock('toki_move'));
      blocks.push(workspace.newBlock('toki_turn_right'));
      for (let i = 0; i < 4; i++) blocks.push(workspace.newBlock('toki_move'));

      for (let i = 0; i < blocks.length - 1; i++) {
        blocks[i].nextConnection.connect(blocks[i + 1].previousConnection);
      }
      blocks.forEach(b => { b.initSvg(); b.render(); });
    });

    await page.locator('#run-btn').click();

    // トキが「ぬいぐるみが まだ たりない」と注意し、ゴールモーダルは表示されない
    const statusMsg = page.locator('#status-message');
    await expect(statusMsg).toContainText('ぬいぐるみが まだ たりない', { timeout: 10000 });
    await expect(statusMsg).toContainText('トキ「ぬいぐるみが まだ たりない', { timeout: 10000 });
    await expect(page.locator('#victory-modal')).toHaveClass(/hidden/);
  });

  test('おもちゃあつめモード: ぬいぐるみを回収してからトキに到達するとクリアできること', async ({ page }) => {
    // おもちゃあつめモードに切り替え（レベル1: ホムラ(0,0), ぬいぐるみ(2,2), トキ(4,4)）
    await page.locator('.mode-tab[data-mode="toy"]').click();
    await page.selectOption('#speed-select', '250');

    // 前進×2 → 右向く → 前進×2 → ひろう → 前進×2 → 左向く → 前進×2
    await page.evaluate(() => {
      workspace.clear();
      const blockTypes = [
        'toki_move', 'toki_move',
        'toki_turn_right',
        'toki_move', 'toki_move',
        'toki_pickup',
        'toki_move', 'toki_move',
        'toki_turn_left',
        'toki_move', 'toki_move'
      ];
      const blocks = blockTypes.map(t => workspace.newBlock(t));
      for (let i = 0; i < blocks.length - 1; i++) {
        blocks[i].nextConnection.connect(blocks[i + 1].previousConnection);
      }
      blocks.forEach(b => { b.initSvg(); b.render(); });
    });

    await page.locator('#run-btn').click();

    // おもちゃ回収でカウンターが「1 / 1」に更新されること
    await expect(page.locator('#toy-counter-text')).toHaveText('1 / 1', { timeout: 10000 });

    // ゴール達成モーダルが表示されること
    const victoryModal = page.locator('#victory-modal');
    await expect(victoryModal).not.toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#victory-title')).toContainText('ぬいぐるみを ぜんぶ とどけたよ');
  });

  test('おもちゃあつめモード: ぬいぐるみを拾った後にリセットするとぬいぐるみが盤面に復活すること', async ({ page }) => {
    // おもちゃあつめモードに切り替え
    const toyTab = page.locator('.mode-tab[data-mode="toy"]');
    await toyTab.click();
    await page.selectOption('#speed-select', '250');

    // 初期状態: おもちゃセルが1個 (2, 2)、カウンターは 0 / 1
    await expect(page.locator('.toy-cell')).toHaveCount(1);
    await expect(page.locator('#toy-counter-text')).toHaveText('0 / 1');

    // トキが(2, 2)に移動してぬいぐるみを拾うプログラムを配置（前進×2 → 右向く → 前進×2 → ひろう）
    await page.evaluate(() => {
      workspace.clear();
      const blockTypes = [
        'toki_move', 'toki_move',
        'toki_turn_right',
        'toki_move', 'toki_move',
        'toki_pickup'
      ];
      const blocks = blockTypes.map(t => workspace.newBlock(t));
      for (let i = 0; i < blocks.length - 1; i++) {
        blocks[i].nextConnection.connect(blocks[i + 1].previousConnection);
      }
      blocks.forEach(b => { b.initSvg(); b.render(); });
    });

    // 実行しておもちゃを拾う
    await page.locator('#run-btn').click();
    await expect(page.locator('#toy-counter-text')).toHaveText('1 / 1', { timeout: 10000 });
    // 盤面のおもちゃセルが消える
    await expect(page.locator('.toy-cell')).toHaveCount(0);

    // リセットボタンをクリック
    await page.locator('#reset-btn').click();

    // リセット後: ぬいぐるみが盤面 (2, 2) に復活していること
    await expect(page.locator('.toy-cell')).toHaveCount(1);
    const toyCell = page.locator('.toy-cell');
    await expect(toyCell).toHaveAttribute('data-x', '2');
    await expect(toyCell).toHaveAttribute('data-y', '2');
    await expect(toyCell.locator('.toy-item')).toBeVisible();

    // カウンターも 0 / 1 にリセットされていること
    await expect(page.locator('#toy-counter-text')).toHaveText('0 / 1');
  });

  test('おもちゃあつめモード レベル3: ハテナの箱が2つ表示され、マスに入ると自動オープンすること', async ({ page }) => {
    // おもちゃあつめモードに切り替え
    await page.locator('.mode-tab[data-mode="toy"]').click();
    await page.selectOption('#speed-select', '250');

    // レベル3ボタンをクリック
    const level3Btn = page.locator('.level-btn[data-level="3"]');
    await expect(level3Btn).toBeVisible();
    await expect(level3Btn).toContainText('🎁 レベル 3');
    await level3Btn.click();
    await expect(level3Btn).toHaveClass(/active/);

    // 未開封の箱が2つ盤面に表示されていること（(1, 2) と (3, 2)）
    const boxCells = page.locator('.toy-cell');
    await expect(boxCells).toHaveCount(2);
    const boxLabels = page.locator('.toy-label');
    await expect(boxLabels.nth(0)).toHaveText('はこ');
    await expect(boxLabels.nth(1)).toHaveText('はこ');

    // 前進1マスのプログラムを作成して実行
    await page.evaluate(() => {
      workspace.clear();
      const m1 = workspace.newBlock('toki_move');
      m1.initSvg();
      m1.render();
    });

    await page.locator('#run-btn').click();

    // ホムラが(1, 2)に入り、箱が自動オープンすること（「パカッ！ はこを あけたら」）
    const statusMsg = page.locator('#status-message');
    await expect(statusMsg).toContainText('パカッ！ はこを あけたら', { timeout: 10000 });
  });

  test('おもちゃあつめモード レベル3: C型IFブロック（もしエビならひろう）を使ってクリアできること', async ({ page }) => {
    // おもちゃあつめモードに切り替え
    await page.locator('.mode-tab[data-mode="toy"]').click();
    await page.selectOption('#speed-select', '250');

    // レベル3を選択
    await page.locator('.level-btn[data-level="3"]').click();

    // プログラム: 前進 → (もしエビならひろう) → 前進 → 前進 → (もしエビならひろう) → 前進
    await page.evaluate(() => {
      workspace.clear();
      const m1 = workspace.newBlock('toki_move');
      const if1 = workspace.newBlock('toki_if');
      if1.setFieldValue('🦐', 'ITEM');
      const p1 = workspace.newBlock('toki_pickup');
      if1.getInput('DO').connection.connect(p1.previousConnection);

      const m2 = workspace.newBlock('toki_move');
      const m3 = workspace.newBlock('toki_move');

      const if2 = workspace.newBlock('toki_if');
      if2.setFieldValue('🦐', 'ITEM');
      const p2 = workspace.newBlock('toki_pickup');
      if2.getInput('DO').connection.connect(p2.previousConnection);

      const m4 = workspace.newBlock('toki_move');

      m1.nextConnection.connect(if1.previousConnection);
      if1.nextConnection.connect(m2.previousConnection);
      m2.nextConnection.connect(m3.previousConnection);
      m3.nextConnection.connect(if2.previousConnection);
      if2.nextConnection.connect(m4.previousConnection);

      [m1, if1, p1, m2, m3, if2, p2, m4].forEach(b => {
        b.initSvg();
        b.render();
      });
    });

    await page.locator('#run-btn').click();

    // エビのみ回収されてカウンターが「1 / 1」になること
    await expect(page.locator('#toy-counter-text')).toHaveText('1 / 1', { timeout: 10000 });

    // ゴール達成モーダルが表示されること
    const victoryModal = page.locator('#victory-modal');
    await expect(victoryModal).not.toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#victory-title')).toContainText('ぬいぐるみを ぜんぶ とどけたよ');
  });

  test('おもちゃあつめモード レベル3: トイレットペーパー（紙）を拾ってしまうとトキに注意されてクリアできないこと', async ({ page }) => {
    // おもちゃあつめモードに切り替え
    await page.locator('.mode-tab[data-mode="toy"]').click();
    await page.selectOption('#speed-select', '250');

    // レベル3を選択
    await page.locator('.level-btn[data-level="3"]').click();

    // プログラム: 無条件に両方の箱でひろう（前進→ひろう→前進→前進→ひろう→前進）
    await page.evaluate(() => {
      workspace.clear();
      const m1 = workspace.newBlock('toki_move');
      const p1 = workspace.newBlock('toki_pickup');
      const m2 = workspace.newBlock('toki_move');
      const m3 = workspace.newBlock('toki_move');
      const p2 = workspace.newBlock('toki_pickup');
      const m4 = workspace.newBlock('toki_move');

      m1.nextConnection.connect(p1.previousConnection);
      p1.nextConnection.connect(m2.previousConnection);
      m2.nextConnection.connect(m3.previousConnection);
      m3.nextConnection.connect(p2.previousConnection);
      p2.nextConnection.connect(m4.previousConnection);

      [m1, p1, m2, m3, p2, m4].forEach(b => {
        b.initSvg();
        b.render();
      });
    });

    await page.locator('#run-btn').click();

    // トキから「トイレットペーパーで イタズラしちゃダメニャ〜！」と注意される
    const statusMsg = page.locator('#status-message');
    await expect(statusMsg).toContainText('トイレットペーパーで イタズラしちゃダメニャ〜！', { timeout: 10000 });

    // クリアモーダルは表示されない
    await expect(page.locator('#victory-modal')).toHaveClass(/hidden/);
  });
});
