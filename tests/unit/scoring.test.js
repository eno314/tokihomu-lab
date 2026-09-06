import { describe, it, expect } from 'vitest';
import { evaluateClear } from '../../src/domain/scoring.js';

describe('scoring domain logic', () => {
  describe('evaluateClear', () => {
    it('usedBlocks <= minBlocks の場合、isPerfectがtrueとなり称賛メッセージが生成されること', () => {
      const result = evaluateClear({
        mode: 'chase',
        usedBlocks: 5,
        minBlocks: 5
      });

      expect(result.isPerfect).toBe(true);
      expect(result.victoryTitle).toContain('かんぺき！');
      expect(result.evalBadgeClass).toContain('eval-perfect');
      expect(result.bubbleMessage).toContain('完璧なプログラム');
    });

    it('usedBlocks > minBlocks の場合、isPerfectがfalseとなり改善ヒントメッセージが生成されること', () => {
      const result = evaluateClear({
        mode: 'chase',
        usedBlocks: 7,
        minBlocks: 5
      });

      expect(result.isPerfect).toBe(false);
      expect(result.victoryTitle).toContain('タッチ！ つかまえたよ！');
      expect(result.evalBadgeClass).toContain('eval-can-improve');
      expect(result.evalBadgeText).toContain('もっと短くできるよ！');
    });

    it('おもちゃあつめモードの場合、専用のタイトル・文言になること', () => {
      const result = evaluateClear({
        mode: 'toy',
        usedBlocks: 10,
        minBlocks: 11
      });

      expect(result.isPerfect).toBe(true);
      expect(result.victoryTitle).toContain('ぬいぐるみを ぜんぶ とどけたよ');
    });

    it('おおきさくらべモードの場合、専用のタイトル・文言になること', () => {
      const result = evaluateClear({
        mode: 'sort',
        usedBlocks: 5,
        minBlocks: 5
      });

      expect(result.isPerfect).toBe(true);
      expect(result.victoryTitle).toContain('きれいに ならんだよ');
    });
  });
});
