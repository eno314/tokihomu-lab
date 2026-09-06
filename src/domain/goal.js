/**
 * tokihomu-lab ゴール判定・逃げるホムラ移動ドメインロジック (FP: 純粋関数)
 */

/**
 * 逃げるホムラの次の位置と進行方向を計算する (純粋関数)
 * @param {number} homuraX
 * @param {number} homuraDir - -1: 左, 1: 右
 * @param {number} gridSize
 * @returns {{ homuraX: number, homuraDir: number }}
 */
export function stepHomura(homuraX, homuraDir, gridSize) {
  let nextX = homuraX + homuraDir;
  let nextDir = homuraDir;

  if (nextX <= 0) {
    nextX = 0;
    nextDir = 1;
  } else if (nextX >= gridSize - 1) {
    nextX = gridSize - 1;
    nextDir = -1;
  }

  return { homuraX: nextX, homuraDir: nextDir };
}

/**
 * ゴール到達判定およびクリア条件の検証 (純粋関数)
 * @param {Object} params
 * @param {'chase' | 'toy' | 'sort'} params.mode
 * @param {number} params.x
 * @param {number} params.y
 * @param {number} params.goalX
 * @param {number} params.goalY
 * @param {number} params.homuraX
 * @param {number} params.homuraY
 * @param {number} params.collectedToysCount
 * @param {number} params.targetToysCount
 * @param {boolean} params.hasTrap
 * @returns {{
 *   isAtGoal: boolean,
 *   isSuccess: boolean,
 *   reason?: 'success' | 'trap' | 'missing_toys'
 * }}
 */
export function checkGoalReached({
  mode,
  x,
  y,
  goalX,
  goalY,
  homuraX,
  homuraY,
  collectedToysCount = 0,
  targetToysCount = 0,
  hasTrap = false
}) {
  const isToyMode = mode === 'toy';
  const isAtGoal = isToyMode
    ? (x === goalX && y === goalY)
    : (x === homuraX && y === homuraY);

  if (!isAtGoal) {
    return { isAtGoal: false, isSuccess: false };
  }

  if (isToyMode) {
    if (hasTrap) {
      return { isAtGoal: true, isSuccess: false, reason: 'trap' };
    }
    if (collectedToysCount < targetToysCount) {
      return { isAtGoal: true, isSuccess: false, reason: 'missing_toys' };
    }
  }

  return { isAtGoal: true, isSuccess: true, reason: 'success' };
}
