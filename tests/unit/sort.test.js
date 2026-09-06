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

  describe('isLaneSorted', () => {
    it('小 -> 中 -> 大 に並んでいる場合はtrueを返すこと', () => {
      const lane = { cats: [catSmall, catMid, catBig] };
      expect(isLaneSorted(lane)).toBe(true);
    });

    it('順序が崩れている場合はfalseを返すこと', () => {
      expect(isLaneSorted({ cats: [catBig, catMid, catSmall] })).toBe(false);
      expect(isLaneSorted({ cats: [catMid, catSmall, catBig] })).toBe(false);
    });

    it('猫が1匹以下の場合はtrueを返すこと', () => {
      expect(isLaneSorted({ cats: [catSmall] })).toBe(true);
      expect(isLaneSorted({ cats: [] })).toBe(true);
    });
  });

  describe('areAllLanesSorted', () => {
    it('すべてのレーンが整列している場合のみtrueを返すこと', () => {
      const lane1 = { cats: [catSmall, catMid, catBig] };
      const lane2 = { cats: [catSmall, catMid, catBig] };
      expect(areAllLanesSorted([lane1, lane2])).toBe(true);

      const laneUnsorted = { cats: [catMid, catSmall, catBig] };
      expect(areAllLanesSorted([lane1, laneUnsorted])).toBe(false);
    });
  });

  describe('swapCatsInLane', () => {
    const lane = { id: 'test', cats: [catBig, catMid, catSmall] };

    it('always条件の場合、常に指定ポインタの要素をスワップすること', () => {
      const { newLane, swapped } = swapCatsInLane(lane, 0, 'always');
      expect(swapped).toBe(true);
      expect(newLane.cats[0]).toEqual(catMid);
      expect(newLane.cats[1]).toEqual(catBig);
      // イミュータブル確認
      expect(lane.cats[0]).toEqual(catBig);
    });

    it('if_greater条件の場合、左 > 右のときのみスワップすること', () => {
      // [catBig(3), catMid(2)]: 3 > 2 なのでスワップ実行
      const r1 = swapCatsInLane(lane, 0, 'if_greater');
      expect(r1.swapped).toBe(true);

      // すでに [catSmall(1), catMid(2)] の場合はスワップしない
      const sortedPair = { id: 'test2', cats: [catSmall, catMid] };
      const r2 = swapCatsInLane(sortedPair, 0, 'if_greater');
      expect(r2.swapped).toBe(false);
      expect(r2.newLane).toBe(sortedPair);
    });

    it('ポインタが範囲外の場合はスワップしないこと', () => {
      const r = swapCatsInLane(lane, 2, 'always'); // 3匹の場合ポインタ最大は1
      expect(r.swapped).toBe(false);
    });
  });

  describe('stepSortPointer', () => {
    it('maxPointer未満ならポインタを+1すること', () => {
      const result = stepSortPointer(0, 1);
      expect(result).toEqual({ nextPointer: 1, isOutOfBounds: false });
    });

    it('maxPointer以上ならisOutOfBounds: trueを返すこと', () => {
      const result = stepSortPointer(1, 1);
      expect(result).toEqual({ nextPointer: 1, isOutOfBounds: true });
    });
  });

  describe('filterLanesByCondition', () => {
    it('左の猫 > 右の猫 となっているレーンのみを抽出すること', () => {
      const lane1 = { id: 'l1', cats: [catBig, catSmall, catMid] }; // 0番目: 3 > 1 (合致)
      const lane2 = { id: 'l2', cats: [catSmall, catBig, catMid] }; // 0番目: 1 < 3 (不一致)
      const filtered = filterLanesByCondition([lane1, lane2], 0);
      expect(filtered).toEqual([lane1]);
    });
  });
});
