/**
 * tokihomu-lab おもちゃ・箱ドメインロジック (FP: 純粋関数)
 */

/**
 * 指定マスにある未回収のおもちゃを取得する (純粋関数)
 * @param {Array<Object>} toys
 * @param {Array<string>} collectedToys
 * @param {Array<string>} collectedTraps
 * @param {number} x
 * @param {number} y
 * @returns {Object | null}
 */
export function findUncollectedToy(toys = [], collectedToys = [], collectedTraps = [], x, y) {
  const toy = toys.find(
    t => t.x === x && t.y === y &&
      !collectedToys.includes(t.id) &&
      !collectedTraps.includes(t.id)
  );
  return toy || null;
}

/**
 * おもちゃを拾う処理 (純粋関数)
 * @param {Array<Object>} toys
 * @param {Array<string>} collectedToys
 * @param {Array<string>} collectedTraps
 * @param {number} x
 * @param {number} y
 * @returns {{
 *   collectedToys: Array<string>,
 *   collectedTraps: Array<string>,
 *   pickedToy: Object | null
 * }}
 */
export function pickupToy(toys = [], collectedToys = [], collectedTraps = [], x, y) {
  const targetToy = findUncollectedToy(toys, collectedToys, collectedTraps, x, y);
  if (!targetToy) {
    return {
      collectedToys,
      collectedTraps,
      pickedToy: null
    };
  }

  if (targetToy.isTrap) {
    return {
      collectedToys,
      collectedTraps: [...collectedTraps, targetToy.id],
      pickedToy: targetToy
    };
  }

  return {
    collectedToys: [...collectedToys, targetToy.id],
    collectedTraps,
    pickedToy: targetToy
  };
}

/**
 * 指定マスにある未開封の箱を開ける (純粋関数)
 * @param {Array<Object>} toys
 * @param {number} x
 * @param {number} y
 * @returns {{ newToys: Array<Object>, openedBox: Object | null }}
 */
export function openBoxAt(toys = [], x, y) {
  let openedBox = null;
  const newToys = toys.map(toy => {
    if (toy.x === x && toy.y === y && toy.isBox && !toy.isOpened) {
      openedBox = { ...toy, isOpened: true };
      return openedBox;
    }
    return toy;
  });

  return { newToys, openedBox };
}

function swapBoxPair(boxes) {
  const [first, second] = boxes;
  return [
    { ...first, icon: second.icon, name: second.name, isTrap: second.isTrap },
    { ...second, icon: first.icon, name: first.name, isTrap: first.isTrap }
  ];
}

export function shuffleBoxes(toys = [], shouldSwap = false) {
  const resetToys = toys.map(t => ({ ...t, isOpened: t.isBox ? false : t.isOpened }));
  if (!shouldSwap || resetToys.length < 2) return resetToys;
  const [swappedA, swappedB] = swapBoxPair(resetToys);
  return [swappedA, swappedB, ...resetToys.slice(2)];
}
