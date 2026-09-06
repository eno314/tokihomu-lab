/**
 * tokihomu-lab おおきさくらべ（ソート）ドメインロジック (FP: 純粋関数)
 */

/**
 * 1つのレーンの猫が昇順（小 -> 中 -> 大）に整列しているか判定 (純粋関数)
 * @param {{ cats: Array<{ size: number }> }} lane
 * @returns {boolean}
 */
export function isLaneSorted(lane) {
  if (!lane || !lane.cats || lane.cats.length <= 1) return true;
  for (let i = 0; i < lane.cats.length - 1; i++) {
    if (lane.cats[i].size > lane.cats[i + 1].size) return false;
  }
  return true;
}

/**
 * 全レーンが整列しているか判定 (純粋関数)
 * @param {Array<{ cats: Array<{ size: number }> }>} lanes
 * @returns {boolean}
 */
export function areAllLanesSorted(lanes = []) {
  if (lanes.length === 0) return true;
  return lanes.every(lane => isLaneSorted(lane));
}

/**
 * レーンの指定ポインタ位置の猫ペアを入れ替える (純粋関数)
 * @param {{ id: string, cats: Array<Object> }} lane
 * @param {number} pointer
 * @param {'always' | 'if_greater'} condition
 * @returns {{ newLane: Object, swapped: boolean }}
 */
export function swapCatsInLane(lane, pointer, condition = 'always') {
  if (!lane || !lane.cats || pointer < 0 || pointer >= lane.cats.length - 1) {
    return { newLane: lane, swapped: false };
  }

  const catA = lane.cats[pointer];
  const catB = lane.cats[pointer + 1];
  const shouldSwap = condition === 'always' || catA.size > catB.size;

  if (!shouldSwap) {
    return { newLane: lane, swapped: false };
  }

  const newCats = [...lane.cats];
  newCats[pointer] = catB;
  newCats[pointer + 1] = catA;

  return {
    newLane: { ...lane, cats: newCats },
    swapped: true
  };
}

/**
 * ポインタを次のペアへ進める (純粋関数)
 * @param {number} currentPointer
 * @param {number} maxPointer
 * @returns {{ nextPointer: number, isOutOfBounds: boolean }}
 */
export function stepSortPointer(currentPointer, maxPointer) {
  if (currentPointer < maxPointer) {
    return { nextPointer: currentPointer + 1, isOutOfBounds: false };
  }
  return { nextPointer: currentPointer, isOutOfBounds: true };
}

/**
 * 条件（左 > 右、または 一番後ろ）を満たすレーンを抽出する (純粋関数)
 * @param {Array<Object>} lanes
 * @param {number} pointer
 * @param {'greater' | 'at_end' | string} [condition='greater']
 * @returns {Array<Object>}
 */
export function filterLanesByCondition(lanes = [], pointer, condition = 'greater') {
  const isAtEnd = condition === 'at_end' || condition === 'いちばんうしろ';

  return lanes.filter(lane => {
    if (!lane || !lane.cats || lane.cats.length <= 1) return false;
    if (isAtEnd) {
      return pointer >= lane.cats.length - 2;
    }
    return (
      pointer < lane.cats.length - 1 &&
      lane.cats[pointer].size > lane.cats[pointer + 1].size
    );
  });
}

