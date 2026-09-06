import { describe, it, expect } from 'vitest';
import {
  isLaneSorted,
  areAllLanesSorted,
  swapCatsInLane,
  stepSortPointer,
  filterLanesByCondition
} from '../../src/domain/sort.js';

describe('sort domain logic', () => {
  const catSmall = { type: 'munchkin', size: 1, name: 'マンチカン' };
  const catMid = { type: 'americanshorthair', size: 2, name: 'アメショ' };
  const catBig = { type: 'siberian', size: 3, name: 'サイベ' };
  const catHuge = { type: 'mainecoon', size: 4, name: 'メインクーン' };

  describe('isLaneSorted', () => {
    const cases = [
      { name: '昇順整列済み [小, 中, 大]', cats: [catSmall, catMid, catBig], expected: true },
      { name: '降順 [大, 中, 小]', cats: [catBig, catMid, catSmall], expected: false },
      { name: '一部不順 [中, 小, 大]', cats: [catMid, catSmall, catBig], expected: false },
      { name: '昇順整列済み 4匹 [小, 中, 大, 特大]', cats: [catSmall, catMid, catBig, catHuge], expected: true },
      { name: '降順 4匹 [特大, 大, 中, 小]', cats: [catHuge, catBig, catMid, catSmall], expected: false },
      { name: '不順 4匹 [中, 特大, 小, 大]', cats: [catMid, catHuge, catSmall, catBig], expected: false },
      { name: '要素1匹 [小]', cats: [catSmall], expected: true },
      { name: '空レーン []', cats: [], expected: true }
    ];

    it.each(cases)('$name で $expected を返すこと', ({ cats, expected }) => {
      expect(isLaneSorted({ cats })).toBe(expected);
    });
  });

  describe('areAllLanesSorted', () => {
    const cases = [
      {
        name: '全レーン整列済み',
        lanes: [{ cats: [catSmall, catMid, catBig] }, { cats: [catSmall, catMid, catBig] }],
        expected: true
      },
      {
        name: '全レーン整列済み 4匹',
        lanes: [
          { cats: [catSmall, catMid, catBig, catHuge] },
          { cats: [catSmall, catMid, catBig, catHuge] }
        ],
        expected: true
      },
      {
        name: '未整列レーンを含む',
        lanes: [{ cats: [catSmall, catMid, catBig] }, { cats: [catMid, catSmall, catBig] }],
        expected: false
      }
    ];

    it.each(cases)('$name で $expected を返すこと', ({ lanes, expected }) => {
      expect(areAllLanesSorted(lanes)).toBe(expected);
    });
  });

  describe('swapCatsInLane', () => {
    const lane = { id: 'test', cats: [catBig, catMid, catSmall] };

    it('always条件の場合、常に指定ポインタの要素をスワップすること', () => {
      const { newLane, swapped } = swapCatsInLane(lane, 0, 'always');
      expect(swapped).toBe(true);
      expect(newLane.cats[0]).toEqual(catMid);
      expect(newLane.cats[1]).toEqual(catBig);
      expect(lane.cats[0]).toEqual(catBig);
    });

    const conditionCases = [
      {
        name: '左 > 右 (3 > 2) でスワップ成立',
        testLane: lane,
        pointer: 0,
        expectedSwapped: true
      },
      {
        name: '左 <= 右 (1 < 2) でスワップ不成立',
        testLane: { id: 'test2', cats: [catSmall, catMid] },
        pointer: 0,
        expectedSwapped: false
      },
      {
        name: '4匹レーンで末尾ペア (3 vs 4) でスワップ不成立',
        testLane: { id: 'test4', cats: [catSmall, catMid, catBig, catHuge] },
        pointer: 2,
        expectedSwapped: false
      },
      {
        name: '4匹レーンで末尾ペア (4 > 3) でスワップ成立',
        testLane: { id: 'test4', cats: [catSmall, catMid, catHuge, catBig] },
        pointer: 2,
        expectedSwapped: true
      },
      {
        name: 'ポインタ範囲外でスワップ不成立',
        testLane: lane,
        pointer: 2,
        expectedSwapped: false
      }
    ];

    it.each(conditionCases)('if_greater条件: $name', ({ testLane, pointer, expectedSwapped }) => {
      const result = swapCatsInLane(testLane, pointer, 'if_greater');
      expect(result.swapped).toBe(expectedSwapped);
    });
  });

  describe('stepSortPointer', () => {
    const cases = [
      { current: 0, max: 1, expected: { nextPointer: 1, isOutOfBounds: false } },
      { current: 1, max: 1, expected: { nextPointer: 1, isOutOfBounds: true } },
      { current: 1, max: 2, expected: { nextPointer: 2, isOutOfBounds: false } },
      { current: 2, max: 2, expected: { nextPointer: 2, isOutOfBounds: true } }
    ];

    it.each(cases)('pointer=$current, max=$max', ({ current, max, expected }) => {
      expect(stepSortPointer(current, max)).toEqual(expected);
    });
  });

  describe('filterLanesByCondition', () => {
    const lane1 = { id: 'l1', cats: [catBig, catSmall, catMid] };
    const lane2 = { id: 'l2', cats: [catSmall, catBig, catMid] };

    it('greater条件: 左の猫 > 右の猫 となっているレーンのみを抽出すること', () => {
      const filtered = filterLanesByCondition([lane1, lane2], 0, 'greater');
      expect(filtered).toEqual([lane1]);
    });

    it('at_end条件: 一番後ろのペアにいるレーンのみを抽出すること', () => {
      // 3匹の場合、一番後ろのペアは pointer = 1 (cats.length - 2)
      expect(filterLanesByCondition([lane1], 0, 'at_end')).toEqual([]);
      expect(filterLanesByCondition([lane1], 1, 'at_end')).toEqual([lane1]);
    });

    it('at_end条件: 4匹の場合、pointer = 2 で抽出されること', () => {
      const lane4 = { id: 'l4', cats: [catSmall, catMid, catBig, catHuge] };
      expect(filterLanesByCondition([lane4], 1, 'at_end')).toEqual([]);
      expect(filterLanesByCondition([lane4], 2, 'at_end')).toEqual([lane4]);
    });
  });
});
