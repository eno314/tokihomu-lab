import { describe, it, expect } from 'vitest';
import { getConditionTargetPos, checkCondition } from '../../src/domain/condition.js';

describe('condition domain logic', () => {
  describe('getConditionTargetPos', () => {
    it.each([
      { x: 2, y: 2, dir: 1, target: 'feet', expected: { x: 2, y: 2 } },
      { x: 2, y: 2, dir: 0, target: 'front', expected: { x: 2, y: 1 } },
      { x: 2, y: 2, dir: 1, target: 'front', expected: { x: 3, y: 2 } },
      { x: 2, y: 2, dir: 2, target: 'front', expected: { x: 2, y: 3 } },
      { x: 2, y: 2, dir: 3, target: 'front', expected: { x: 1, y: 2 } }
    ])('target=$target, dir=$dir のとき判定座標は $expected であること', ({ x, y, dir, target, expected }) => {
      expect(getConditionTargetPos(x, y, dir, target)).toEqual(expected);
    });
  });

  describe('checkCondition', () => {
    const obstacles = [{ x: 3, y: 0 }, { x: 0, y: 2 }];
    const toys = [
      { id: 'toy-1', x: 2, y: 0, icon: '🦐', isTrap: false },
      { id: 'trap-1', x: 1, y: 1, icon: '🧻', isTrap: true }
    ];

    it.each([
      {
        desc: '目の前がダンボールの場合にtrueになること',
        params: { x: 2, y: 0, direction: 1, target: 'front', conditionItem: 'obstacle', obstacles },
        expected: true
      },
      {
        desc: '目の前が空きマスのときobstacle条件がfalseになること',
        params: { x: 1, y: 0, direction: 1, target: 'front', conditionItem: 'obstacle', obstacles },
        expected: false
      },
      {
        desc: '足元がおもちゃの場合にtrueになること',
        params: { x: 2, y: 0, direction: 1, target: 'feet', conditionItem: 'toy', toys },
        expected: true
      },
      {
        desc: '足元がトラップの場合にtoy条件がfalseになること',
        params: { x: 1, y: 1, direction: 1, target: 'feet', conditionItem: 'toy', toys },
        expected: false
      },
      {
        desc: '回収済みのおもちゃは判定されないこと',
        params: { x: 2, y: 0, direction: 1, target: 'feet', conditionItem: 'toy', toys, collectedToys: ['toy-1'] },
        expected: false
      },
      {
        desc: 'エビ判定で該当アイコンが一致するときtrueになること',
        params: { x: 2, y: 0, direction: 1, target: 'feet', conditionItem: '🦐', toys },
        expected: true
      }
    ])('$desc', ({ params, expected }) => {
      expect(checkCondition(params)).toBe(expected);
    });
  });
});
