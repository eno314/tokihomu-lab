import { describe, it, expect } from 'vitest';
import { createInitialState, applyLoadLevel, applyReset } from '../../src/state/store.js';

describe('store state management', () => {
  it('createInitialState で正しい初期値が生成されること', () => {
    const state = createInitialState();
    expect(state.currentMode).toBe('chase');
    expect(state.currentLevel).toBe(1);
    expect(state.x).toBe(0);
    expect(state.y).toBe(0);
    expect(state.direction).toBe(1);
  });

  it('applyLoadLevel でレベル情報が反映され、新状態オブジェクトが返ること', () => {
    const initialState = createInitialState();
    const nextState = applyLoadLevel(initialState, 2, 'chase');

    expect(nextState.currentLevel).toBe(2);
    expect(nextState.obstacles.length).toBe(5);
    // 元の状態が破壊されていないこと
    expect(initialState.currentLevel).toBe(1);
  });

  it('applyReset でプレイヤー座標・向き・収集アイテムが初期化されること', () => {
    const state = {
      ...createInitialState(),
      x: 3,
      y: 3,
      collectedToys: ['toy-1'],
      collectedTraps: ['box-1'],
      direction: 3,
      totalRotation: 270
    };

    const resetState = applyReset(state);
    expect(resetState.x).toBe(0);
    expect(resetState.y).toBe(0);
    expect(resetState.direction).toBe(1);
    expect(resetState.totalRotation).toBe(90);
    expect(resetState.collectedToys).toEqual([]);
    expect(resetState.collectedTraps).toEqual([]);
  });
});
