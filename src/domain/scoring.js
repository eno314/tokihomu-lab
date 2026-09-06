/**
 * tokihomu-lab クリア時スコア・メッセージ評価ドメインロジック (FP: 純粋関数)
 */

/**
 * プログラム実行完了時の評価データを生成する (純粋関数)
 * @param {Object} params
 * @param {'chase' | 'toy' | 'sort'} params.mode
 * @param {number} params.usedBlocks
 * @param {number} params.minBlocks
 * @returns {Object}
 */
export function evaluateClear({ mode = 'chase', usedBlocks = 0, minBlocks = 0 }) {
  const isPerfect = minBlocks > 0 && usedBlocks <= minBlocks;
  const isToyMode = mode === 'toy';
  const isSortMode = mode === 'sort';

  // 吹き出しメッセージ
  let bubbleMessage = '';
  if (isPerfect) {
    bubbleMessage = `やったー！これ以上短くできない完璧なプログラムだよ！すごい！おめでとう！💮✨ (使ったブロック: ${usedBlocks}個)`;
  } else {
    let successAction = 'ホムラをつかまえたよ！🎉';
    if (isToyMode) successAction = 'ぬいぐるみをあつめて トキにあえたよ！🎉';
    else if (isSortMode) successAction = 'ねこたちが ちいさいじゅんに ならんだよ！🎉';
    bubbleMessage = `${successAction} くりかえし等をつかうと、もっと短くできるよ！ちょうせんしてみてね！💡 (いまのブロック: ${usedBlocks}個)`;
  }

  // モーダルタイトル
  let victoryTitle = '';
  if (isSortMode) {
    victoryTitle = isPerfect
      ? '🌟 かんぺき！ きれいに ならんだよ！ 🌟'
      : '🎉 せいれつ だいせいこう！ 🎉';
  } else {
    victoryTitle = isPerfect
      ? (isToyMode ? '🌟 かんぺき！ ぬいぐるみを ぜんぶ とどけたよ！ 🌟' : '🌟 かんぺき！ 大せいこう！ 🌟')
      : (isToyMode ? '🎉 ぬいぐるみを ぜんぶ とどけたよ！ 🎉' : '🎉 タッチ！ つかまえたよ！ 🎉');
  }

  // モーダル説明
  let victoryDescHtml = '';
  if (isSortMode) {
    const clearDesc = 'ねこたちが ちいさいじゅんに きれいに ならんだよ！にゃーん！🎉';
    victoryDescHtml = isPerfect
      ? `${clearDesc}<br><strong>これ以上 短くできない 完璧なアルゴリズムです！</strong>`
      : `${clearDesc}<br>大きさ比べ だいせいこう！`;
  } else {
    const clearDesc = isToyMode
      ? 'ぬいぐるみをぜんぶあつめて トキにあえたよ！にゃーん！🎉'
      : 'ホムラをつかまえたよ！にゃーん！🎉';
    victoryDescHtml = isPerfect
      ? `${clearDesc}<br><strong>これ以上 短くできない 完璧なプログラムです！</strong>`
      : `${clearDesc}<br>${isToyMode ? 'ぬいぐるみあつめ だいせいこう！' : 'おにごっこ せいこう！'}`;
  }

  // 評価バッジ
  let evalBadgeClass = isPerfect ? 'victory-evaluation eval-perfect' : 'victory-evaluation eval-can-improve';
  let evalBadgeText = isPerfect ? '💮 かんぺき！ これ以上短くできないよ！' : '💡 もっと短くできるよ！';
  let evalDetailHtml = isPerfect
    ? `つかったブロック：<strong>${usedBlocks}こ</strong><br>むだのない、さいこうのプログラムだよ！すばらしい！✨`
    : `つかったブロック：<strong>${usedBlocks}こ</strong><br>「くりかえし」ブロックなどを使うと、もっとすくないブロック数でクリアできるよ！<br>さらにみじかいプログラムに ちょうせんしてみてね！🐾`;

  return {
    isPerfect,
    usedBlocks,
    minBlocks,
    bubbleMessage,
    victoryTitle,
    victoryDescHtml,
    evalBadgeClass,
    evalBadgeText,
    evalDetailHtml
  };
}
