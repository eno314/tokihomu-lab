import { describe, it, expect } from 'vitest';
import { stepHomura, checkGoalReached } from '../../src/domain/goal.js';

describe('goal domain logic', () => {
  describe('stepHomura', () => {
    it('左進行時、通常はx座標が-1されること', () => {
      const result = stepHomura(3, -1, 5);
      expect(result).toEqual({ homuraX: 2, homuraDir: -1 });
    });

    it('左端(0)に到達すると0で留まり、向きが右(1)に反転すること', () => {
      const result = stepHomura(1, -1, 5);
      expect(result).toEqual({ homuraX: 0, homuraDir: 1 });

      const fromZero = stepHomura(0, -1, 5);
      expect(fromZero).toEqual({ homuraX: 0, homuraDir: 1 });
    });

    it('右端(gridSize - 1)に到達すると端で留まり、向きが左(-1)に反転すること', () => {
      const result = stepHomura(3, 1, 5);
      expect(result).toEqual({ homuraX: 4, homuraDir: -1 });

      const fromMax = stepHomura(4, 1, 5);
      expect(fromMax).toEqual({ homuraX: 4, homuraDir: -1 });
    });
  });

  describe('checkGoalReached', () => {
    describe('chase mode', () => {
      it('プレイヤーがホムラと同座標にいる場合はクリア成功となること', () => {
        const result = checkGoalReached({
          mode: 'chase',
          x: 4,
          y: 4,
          homuraX: 4,
          homuraY: 4
        });
        expect(result).toEqual({ isAtGoal: true, isSuccess: true, reason: 'success' });
      });

      it('プレイヤーがホムラと異なる座標にいる場合はゴール未到達となること', () => {
        const result = checkGoalReached({
          mode: 'chase',
          x: 3,
          y: 4,
          homuraX: 4,
          homuraY: 4
        });
        expect(result).toEqual({ isAtGoal: false, isSuccess: false });
      });
    });

    describe('toy mode', () => {
      it('おもちゃが全回収済みでゴール(4, 4)に到達した場合はクリア成功となること', () => {
        const result = checkGoalReached({
          mode: 'toy',
          x: 4,
          y: 4,
          goalX: 4,
          goalY: 4,
          collectedToysCount: 2,
          targetToysCount: 2,
          hasTrap: false
        });
        expect(result).toEqual({ isAtGoal: true, isSuccess: true, reason: 'success' });
      });

      it('おもちゃが不足している場合はゴール到達でもクリア失敗(missing_toys)となること', () => {
        const result = checkGoalReached({
          mode: 'toy',
          x: 4,
          y: 4,
          goalX: 4,
          goalY: 4,
          collectedToysCount: 1,
          targetToysCount: 2,
          hasTrap: false
        });
        expect(result).toEqual({ isAtGoal: true, isSuccess: false, reason: 'missing_toys' });
      });

      it('トイレットペーパー罠を拾っている場合はクリア失敗(trap)となること', () => {
        const result = checkGoalReached({
          mode: 'toy',
          x: 4,
          y: 4,
          goalX: 4,
          goalY: 4,
          collectedToysCount: 2,
          targetToysCount: 2,
          hasTrap: true
        });
        expect(result).toEqual({ isAtGoal: true, isSuccess: false, reason: 'trap' });
      });
    });
  });
});
