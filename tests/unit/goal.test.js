import { describe, it, expect } from 'vitest';
import { stepHomura, checkGoalReached } from '../../src/domain/goal.js';

describe('goal domain logic', () => {
  describe('stepHomura', () => {
    const cases = [
      { name: '左進行の通常移動 (3 -> 2)', currentX: 3, dir: -1, expected: { homuraX: 2, homuraDir: -1 } },
      { name: '左端到達で反転 (1 -> 0, dir: 1)', currentX: 1, dir: -1, expected: { homuraX: 0, homuraDir: 1 } },
      { name: '左端から進行時 (0 -> 0, dir: 1)', currentX: 0, dir: -1, expected: { homuraX: 0, homuraDir: 1 } },
      { name: '右端到達で反転 (3 -> 4, dir: -1)', currentX: 3, dir: 1, expected: { homuraX: 4, homuraDir: -1 } },
      { name: '右端から進行時 (4 -> 4, dir: -1)', currentX: 4, dir: 1, expected: { homuraX: 4, homuraDir: -1 } }
    ];

    it.each(cases)('$name', ({ currentX, dir, expected }) => {
      expect(stepHomura(currentX, dir, 5)).toEqual(expected);
    });
  });

  describe('checkGoalReached', () => {
    describe('chase mode', () => {
      const chaseCases = [
        {
          name: 'ホムラと同座標にいる場合はクリア成功',
          params: { mode: 'chase', x: 4, y: 4, homuraX: 4, homuraY: 4 },
          expected: { isAtGoal: true, isSuccess: true, reason: 'success' }
        },
        {
          name: '異なる座標にいる場合はゴール未到達',
          params: { mode: 'chase', x: 3, y: 4, homuraX: 4, homuraY: 4 },
          expected: { isAtGoal: false, isSuccess: false }
        }
      ];

      it.each(chaseCases)('$name', ({ params, expected }) => {
        expect(checkGoalReached(params)).toEqual(expected);
      });
    });

    describe('toy mode', () => {
      const toyCases = [
        {
          name: 'おもちゃ全回収でゴール到達時はクリア成功',
          params: { mode: 'toy', x: 4, y: 4, goalX: 4, goalY: 4, collectedToysCount: 2, targetToysCount: 2, hasTrap: false },
          expected: { isAtGoal: true, isSuccess: true, reason: 'success' }
        },
        {
          name: 'おもちゃ不足時はゴール到達でも missing_toys 失敗',
          params: { mode: 'toy', x: 4, y: 4, goalX: 4, goalY: 4, collectedToysCount: 1, targetToysCount: 2, hasTrap: false },
          expected: { isAtGoal: true, isSuccess: false, reason: 'missing_toys' }
        },
        {
          name: '罠を拾っている場合は trap 失敗',
          params: { mode: 'toy', x: 4, y: 4, goalX: 4, goalY: 4, collectedToysCount: 2, targetToysCount: 2, hasTrap: true },
          expected: { isAtGoal: true, isSuccess: false, reason: 'trap' }
        }
      ];

      it.each(toyCases)('$name', ({ params, expected }) => {
        expect(checkGoalReached(params)).toEqual(expected);
      });
    });
  });
});
