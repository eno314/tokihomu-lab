/**
 * tokihomu-lab 移動・衝突判定ドメインロジック (FP: 純粋関数)
 */

// 向き定義: 0: 上, 1: 右, 2: 下, 3: 左
export const DIRECTIONS = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3
};

/**
 * 現在地と向きから、1マス進んだ場合の座標を計算する (純粋関数)
 * @param {number} x
 * @param {number} y
 * @param {number} direction - 0:上, 1:右, 2:下, 3:左
 * @returns {{ x: number, y: number }}
 */
export function getNextPosition(x, y, direction) {
  let nextX = x;
  let nextY = y;

  if (direction === DIRECTIONS.UP) nextY -= 1;
  else if (direction === DIRECTIONS.RIGHT) nextX += 1;
  else if (direction === DIRECTIONS.DOWN) nextY += 1;
  else if (direction === DIRECTIONS.LEFT) nextX -= 1;

  return { x: nextX, y: nextY };
}

/**
 * 左右旋回時の新しい向きと累積回転角度を計算する (純粋関数)
 * @param {number} currentDirection
 * @param {number} currentTotalRotation
 * @param {'left' | 'right'} turnType
 * @returns {{ direction: number, totalRotation: number }}
 */
export function turn(currentDirection, currentTotalRotation, turnType) {
  if (turnType === 'right') {
    return {
      direction: (currentDirection + 1) % 4,
      totalRotation: currentTotalRotation + 90
    };
  } else if (turnType === 'left') {
    return {
      direction: (currentDirection + 3) % 4,
      totalRotation: currentTotalRotation - 90
    };
  }
  return { direction: currentDirection, totalRotation: currentTotalRotation };
}

/**
 * 指定座標が壁または障害物に衝突しているか判定する (純粋関数)
 * @param {number} x
 * @param {number} y
 * @param {number} gridSize
 * @param {Array<{x: number, y: number}>} obstacles
 * @returns {'wall' | 'obstacle' | null}
 */
export function checkCollision(x, y, gridSize, obstacles = []) {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
    return 'wall';
  }
  if (obstacles.some(obs => obs.x === x && obs.y === y)) {
    return 'obstacle';
  }
  return null;
}
