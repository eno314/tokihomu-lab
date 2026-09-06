import { describe, it, expect } from 'vitest';
import { getNextPosition, turn, checkCollision, DIRECTIONS } from '../../src/domain/movement.js';

describe('movement domain logic', () => {
  describe('getNextPosition', () => {
    it('上向き(0)のときyが-1されること', () => {
      expect(getNextPosition(2, 2, DIRECTIONS.UP)).toEqual({ x: 2, y: 1 });
    });

    it('右向き(1)のときxが+1されること', () => {
      expect(getNextPosition(2, 2, DIRECTIONS.RIGHT)).toEqual({ x: 3, y: 2 });
    });

    it('下向き(2)のときyが+1されること', () => {
      expect(getNextPosition(2, 2, DIRECTIONS.DOWN)).toEqual({ x: 2, y: 3 });
    });

    it('左向き(3)のときxが-1されること', () => {
      expect(getNextPosition(2, 2, DIRECTIONS.LEFT)).toEqual({ x: 1, y: 2 });
    });
  });

  describe('turn', () => {
    it('右回転時、向きが時計回りに進み角度が+90度されること', () => {
      const step1 = turn(DIRECTIONS.UP, 0, 'right');
      expect(step1).toEqual({ direction: DIRECTIONS.RIGHT, totalRotation: 90 });

      const step2 = turn(step1.direction, step1.totalRotation, 'right');
      expect(step2).toEqual({ direction: DIRECTIONS.DOWN, totalRotation: 180 });

      const step3 = turn(step2.direction, step2.totalRotation, 'right');
      expect(step3).toEqual({ direction: DIRECTIONS.LEFT, totalRotation: 270 });

      const step4 = turn(step3.direction, step3.totalRotation, 'right');
      expect(step4).toEqual({ direction: DIRECTIONS.UP, totalRotation: 360 });
    });

    it('左回転時、向きが反時計回りに戻り角度が-90度されること', () => {
      const step1 = turn(DIRECTIONS.UP, 0, 'left');
      expect(step1).toEqual({ direction: DIRECTIONS.LEFT, totalRotation: -90 });

      const step2 = turn(step1.direction, step1.totalRotation, 'left');
      expect(step2).toEqual({ direction: DIRECTIONS.DOWN, totalRotation: -180 });
    });
  });

  describe('checkCollision', () => {
    const gridSize = 5;
    const obstacles = [
      { x: 1, y: 1 },
      { x: 2, y: 3 }
    ];

    it('盤面内かつ障害物なしの場合はnullを返すこと', () => {
      expect(checkCollision(0, 0, gridSize, obstacles)).toBeNull();
      expect(checkCollision(4, 4, gridSize, obstacles)).toBeNull();
      expect(checkCollision(2, 2, gridSize, obstacles)).toBeNull();
    });

    it('盤面外の境界値ではwallを返すこと', () => {
      expect(checkCollision(-1, 2, gridSize, obstacles)).toBe('wall');
      expect(checkCollision(5, 2, gridSize, obstacles)).toBe('wall');
      expect(checkCollision(2, -1, gridSize, obstacles)).toBe('wall');
      expect(checkCollision(2, 5, gridSize, obstacles)).toBe('wall');
    });

    it('障害物があるマスではobstacleを返すこと', () => {
      expect(checkCollision(1, 1, gridSize, obstacles)).toBe('obstacle');
      expect(checkCollision(2, 3, gridSize, obstacles)).toBe('obstacle');
    });
  });
});
