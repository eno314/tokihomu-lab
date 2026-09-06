import { describe, it, expect } from 'vitest';
import { getNextPosition, turn, checkCollision, DIRECTIONS } from '../../src/domain/movement.js';

describe('movement domain logic', () => {
  describe('getNextPosition', () => {
    const cases = [
      { name: '上向き (0) で y が -1', dir: DIRECTIONS.UP, expected: { x: 2, y: 1 } },
      { name: '右向き (1) で x が +1', dir: DIRECTIONS.RIGHT, expected: { x: 3, y: 2 } },
      { name: '下向き (2) で y が +1', dir: DIRECTIONS.DOWN, expected: { x: 2, y: 3 } },
      { name: '左向き (3) で x が -1', dir: DIRECTIONS.LEFT, expected: { x: 1, y: 2 } }
    ];

    it.each(cases)('$name', ({ dir, expected }) => {
      expect(getNextPosition(2, 2, dir)).toEqual(expected);
    });
  });

  describe('turn', () => {
    const rightTurnCases = [
      { from: DIRECTIONS.UP, rot: 0, expectedDir: DIRECTIONS.RIGHT, expectedRot: 90 },
      { from: DIRECTIONS.RIGHT, rot: 90, expectedDir: DIRECTIONS.DOWN, expectedRot: 180 },
      { from: DIRECTIONS.DOWN, rot: 180, expectedDir: DIRECTIONS.LEFT, expectedRot: 270 },
      { from: DIRECTIONS.LEFT, rot: 270, expectedDir: DIRECTIONS.UP, expectedRot: 360 }
    ];

    it.each(rightTurnCases)('右回転: $from から $expectedDir (角度: $expectedRot)', ({ from, rot, expectedDir, expectedRot }) => {
      expect(turn(from, rot, 'right')).toEqual({ direction: expectedDir, totalRotation: expectedRot });
    });

    const leftTurnCases = [
      { from: DIRECTIONS.UP, rot: 0, expectedDir: DIRECTIONS.LEFT, expectedRot: -90 },
      { from: DIRECTIONS.LEFT, rot: -90, expectedDir: DIRECTIONS.DOWN, expectedRot: -180 }
    ];

    it.each(leftTurnCases)('左回転: $from から $expectedDir (角度: $expectedRot)', ({ from, rot, expectedDir, expectedRot }) => {
      expect(turn(from, rot, 'left')).toEqual({ direction: expectedDir, totalRotation: expectedRot });
    });
  });

  describe('checkCollision', () => {
    const gridSize = 5;
    const obstacles = [
      { x: 1, y: 1 },
      { x: 2, y: 3 }
    ];

    const collisionCases = [
      { name: '盤面内 (0,0)', x: 0, y: 0, expected: null },
      { name: '盤面内 (4,4)', x: 4, y: 4, expected: null },
      { name: '盤面内 (2,2)', x: 2, y: 2, expected: null },
      { name: '左壁の外 (-1,2)', x: -1, y: 2, expected: 'wall' },
      { name: '右壁の外 (5,2)', x: 5, y: 2, expected: 'wall' },
      { name: '上壁の外 (2,-1)', x: 2, y: -1, expected: 'wall' },
      { name: '下壁の外 (2,5)', x: 2, y: 5, expected: 'wall' },
      { name: '障害物 (1,1)', x: 1, y: 1, expected: 'obstacle' },
      { name: '障害物 (2,3)', x: 2, y: 3, expected: 'obstacle' }
    ];

    it.each(collisionCases)('$name で $expected を返すこと', ({ x, y, expected }) => {
      expect(checkCollision(x, y, gridSize, obstacles)).toBe(expected);
    });
  });
});
