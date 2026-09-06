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
const SUCCESS_ACTIONS = {
  chase: 'ホムラをつかまえたよ！🎉',
  toy: 'ぬいぐるみをあつめて トキにあえたよ！🎉',
  sort: 'ねこたちが ちいさいじゅんに ならんだよ！🎉'
};

const VICTORY_TITLES = {
  sort: {
    perfect: '🌟 かんぺき！ きれいに ならんだよ！ 🌟',
    normal: '🎉 せいれつ だいせいこう！ 🎉'
  },
  toy: {
    perfect: '🌟 かんぺき！ ぬいぐるみを ぜんぶ とどけたよ！ 🌟',
    normal: '🎉 ぬいぐるみを ぜんぶ とどけたよ！ 🎉'
  },
  chase: {
    perfect: '🌟 かんぺき！ 大せいこう！ 🌟',
    normal: '🎉 タッチ！ つかまえたよ！ 🎉'
  }
};

const VICTORY_DESCS = {
  sort: {
    perfect: 'ねこたちが ちいさいじゅんに きれいに ならんだよ！にゃーん！🎉<br><strong>これ以上 短くできない 完璧なアルゴリズムです！</strong>',
    normal: 'ねこたちが ちいさいじゅんに きれいに ならんだよ！にゃーん！🎉<br>大きさ比べ だいせいこう！'
  },
  toy: {
    perfect: 'ぬいぐるみをぜんぶあつめて トキにあえたよ！にゃーん！🎉<br><strong>これ以上 短くできない 完璧なプログラムです！</strong>',
    normal: 'ぬいぐるみをぜんぶあつめて トキにあえたよ！にゃーん！🎉<br>ぬいぐるみあつめ だいせいこう！'
  },
  chase: {
    perfect: 'ホムラをつかまえたよ！にゃーん！🎉<br><strong>これ以上 短くできない 完璧なプログラムです！</strong>',
    normal: 'ホムラをつかまえたよ！にゃーん！🎉<br>おにごっこ せいこう！'
  }
};

function getBubbleMessage(mode, isPerfect, usedBlocks) {
  if (isPerfect) {
    return `やったー！これ以上短くできない完璧なプログラムだよ！すごい！おめでとう！💮✨ (使ったブロック: ${usedBlocks}個)`;
  }
  const action = SUCCESS_ACTIONS[mode] || SUCCESS_ACTIONS.chase;
  return `${action} くりかえし等をつかうと、もっと短くできるよ！ちょうせんしてみてね！💡 (いまのブロック: ${usedBlocks}個)`;
}

function getEvaluationBadge(isPerfect, usedBlocks) {
  if (isPerfect) {
    return {
      evalBadgeClass: 'victory-evaluation eval-perfect',
      evalBadgeText: '💮 かんぺき！ これ以上短くできないよ！',
      evalDetailHtml: `つかったブロック：<strong>${usedBlocks}こ</strong><br>むだのない、さいこうのプログラムだよ！すばらしい！✨`
    };
  }
  return {
    evalBadgeClass: 'victory-evaluation eval-can-improve',
    evalBadgeText: '💡 もっと短くできるよ！',
    evalDetailHtml: `つかったブロック：<strong>${usedBlocks}こ</strong><br>「くりかえし」ブロックなどを使うと、もっとすくないブロック数でクリアできるよ！<br>さらにみじかいプログラムに ちょうせんしてみてね！🐾`
  };
}

export function evaluateClear({ mode = 'chase', usedBlocks = 0, minBlocks = 0 }) {
  const isPerfect = minBlocks > 0 && usedBlocks <= minBlocks;
  const statusKey = isPerfect ? 'perfect' : 'normal';
  const modeKey = VICTORY_TITLES[mode] ? mode : 'chase';
  const badge = getEvaluationBadge(isPerfect, usedBlocks);

  return {
    isPerfect,
    usedBlocks,
    minBlocks,
    bubbleMessage: getBubbleMessage(modeKey, isPerfect, usedBlocks),
    victoryTitle: VICTORY_TITLES[modeKey][statusKey],
    victoryDescHtml: VICTORY_DESCS[modeKey][statusKey],
    ...badge
  };
}
