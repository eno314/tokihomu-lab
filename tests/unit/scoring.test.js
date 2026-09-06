import { describe, it, expect } from 'vitest';
import { evaluateClear } from '../../src/domain/scoring.js';

describe('scoring domain logic', () => {
  describe('evaluateClear', () => {
    const cases = [
      {
        name: 'usedBlocks <= minBlocks で完璧評価',
        input: { mode: 'chase', usedBlocks: 5, minBlocks: 5 },
        expected: {
          isPerfect: true,
          titleIncludes: 'かんぺき！',
          badgeClassIncludes: 'eval-perfect',
          bubbleIncludes: '完璧なプログラム'
        }
      },
      {
        name: 'usedBlocks > minBlocks で改善ヒント',
        input: { mode: 'chase', usedBlocks: 7, minBlocks: 5 },
        expected: {
          isPerfect: false,
          titleIncludes: 'タッチ！ つかまえたよ！',
          badgeClassIncludes: 'eval-can-improve',
          badgeTextIncludes: 'もっと短くできるよ！'
        }
      },
      {
        name: 'おもちゃあつめモード専用タイトル',
        input: { mode: 'toy', usedBlocks: 10, minBlocks: 11 },
        expected: {
          isPerfect: true,
          titleIncludes: 'ぬいぐるみを ぜんぶ とどけたよ'
        }
      },
      {
        name: 'おおきさくらべモード専用タイトル',
        input: { mode: 'sort', usedBlocks: 5, minBlocks: 5 },
        expected: {
          isPerfect: true,
          titleIncludes: 'きれいに ならんだよ'
        }
      }
    ];

    it.each(cases)('$name', ({ input, expected }) => {
      const result = evaluateClear(input);
      expect(result.isPerfect).toBe(expected.isPerfect);
      if (expected.titleIncludes) expect(result.victoryTitle).toContain(expected.titleIncludes);
      if (expected.badgeClassIncludes) expect(result.evalBadgeClass).toContain(expected.badgeClassIncludes);
      if (expected.bubbleIncludes) expect(result.bubbleMessage).toContain(expected.bubbleIncludes);
      if (expected.badgeTextIncludes) expect(result.evalBadgeText).toContain(expected.badgeTextIncludes);
    });
  });
});
