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
  const nextX = homuraX + homuraDir;
  if (nextX <= 0) {
    return { homuraX: 0, homuraDir: 1 };
  }
  if (nextX >= gridSize - 1) {
    return { homuraX: gridSize - 1, homuraDir: -1 };
  }
  return { homuraX: nextX, homuraDir };
}

function evaluateToyGoalStatus(hasTrap, collectedCount, targetCount) {
  if (hasTrap) return { isAtGoal: true, isSuccess: false, reason: 'trap' };
  if (collectedCount < targetCount) return { isAtGoal: true, isSuccess: false, reason: 'missing_toys' };
  return { isAtGoal: true, isSuccess: true, reason: 'success' };
}

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
  const targetX = isToyMode ? goalX : homuraX;
  const targetY = isToyMode ? goalY : homuraY;

  if (x !== targetX || y !== targetY) {
    return { isAtGoal: false, isSuccess: false };
  }
  if (isToyMode) {
    return evaluateToyGoalStatus(hasTrap, collectedToysCount, targetToysCount);
  }
  return { isAtGoal: true, isSuccess: true, reason: 'success' };
}
