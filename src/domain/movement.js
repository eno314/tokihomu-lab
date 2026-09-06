/**
 * tokihomu-lab 移動・衝突判定ドメインロジック (FP: 純粋関数)
 */

export const DIRECTIONS = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3
};

const DIRECTION_DELTAS = {
  [DIRECTIONS.UP]: { dx: 0, dy: -1 },
  [DIRECTIONS.RIGHT]: { dx: 1, dy: 0 },
  [DIRECTIONS.DOWN]: { dx: 0, dy: 1 },
  [DIRECTIONS.LEFT]: { dx: -1, dy: 0 }
};

const TURN_OFFSETS = {
  right: { dDir: 1, dRot: 90 },
  left: { dDir: 3, dRot: -90 }
};

export function getNextPosition(x, y, direction) {
  const delta = DIRECTION_DELTAS[direction] || { dx: 0, dy: 0 };
  return { x: x + delta.dx, y: y + delta.dy };
}

export function turn(currentDirection, currentTotalRotation, turnType) {
  const offset = TURN_OFFSETS[turnType];
  if (!offset) {
    return { direction: currentDirection, totalRotation: currentTotalRotation };
  }
  return {
    direction: (currentDirection + offset.dDir) % 4,
    totalRotation: currentTotalRotation + offset.dRot
  };
}

export function checkCollision(x, y, gridSize, obstacles = []) {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
    return 'wall';
  }
  if (obstacles.some(obs => obs.x === x && obs.y === y)) {
    return 'obstacle';
  }
  return null;
}
