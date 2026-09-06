/**
 * tokihomu-lab 条件判定ドメインロジック (FP: 純粋関数)
 */

import { getNextPosition } from './movement.js';
import { findUncollectedToy } from './toys.js';

export function getConditionTargetPos(x, y, direction, target) {
  if (target === 'front') {
    return getNextPosition(x, y, direction);
  }
  return { x, y };
}

function matchesToyCondition(toy, conditionItem) {
  if (!toy) return false;
  if (conditionItem === 'toy' || conditionItem === 'おもちゃ') {
    return !toy.isTrap;
  }
  return toy.icon === conditionItem;
}

export function checkCondition({
  x,
  y,
  direction,
  target = 'feet',
  conditionItem,
  obstacles = [],
  toys = [],
  collectedToys = [],
  collectedTraps = []
}) {
  const checkPos = getConditionTargetPos(x, y, direction, target);

  if (conditionItem === 'obstacle' || conditionItem === 'ダンボール') {
    return obstacles.some(obs => obs.x === checkPos.x && obs.y === checkPos.y);
  }

  const toy = findUncollectedToy(toys, collectedToys, collectedTraps, checkPos.x, checkPos.y);
  return matchesToyCondition(toy, conditionItem);
}
