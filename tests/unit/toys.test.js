import { describe, it, expect } from 'vitest';
import { findUncollectedToy, pickupToy, openBoxAt, shuffleBoxes } from '../../src/domain/toys.js';

describe('toys domain logic', () => {
  const sampleToys = [
    { id: 'toy-1', x: 2, y: 2, icon: '🦐', name: 'エビ', isTrap: false },
    { id: 'box-1', x: 1, y: 2, isBox: true, isOpened: false, icon: '🧻', name: '紙', isTrap: true }
  ];

  describe('findUncollectedToy', () => {
    const cases = [
      { name: '未回収マス (2,2)', collected: [], traps: [], x: 2, y: 2, expected: sampleToys[0] },
      { name: '回収済みマス (2,2)', collected: ['toy-1'], traps: [], x: 2, y: 2, expected: null },
      { name: 'おもちゃなしマス (0,0)', collected: [], traps: [], x: 0, y: 0, expected: null }
    ];

    it.each(cases)('$name', ({ collected, traps, x, y, expected }) => {
      expect(findUncollectedToy(sampleToys, collected, traps, x, y)).toEqual(expected);
    });
  });

  describe('pickupToy', () => {
    const cases = [
      {
        name: '通常のおもちゃを拾う',
        collected: [],
        traps: [],
        x: 2,
        y: 2,
        expectedCollected: ['toy-1'],
        expectedTraps: [],
        expectedPickedId: 'toy-1'
      },
      {
        name: '罠（紙）を拾う',
        collected: [],
        traps: [],
        x: 1,
        y: 2,
        expectedCollected: [],
        expectedTraps: ['box-1'],
        expectedPickedId: 'box-1'
      },
      {
        name: '空振り（おもちゃなし）',
        collected: ['toy-1'],
        traps: [],
        x: 0,
        y: 0,
        expectedCollected: ['toy-1'],
        expectedTraps: [],
        expectedPickedId: null
      }
    ];

    it.each(cases)('$name', ({ collected, traps, x, y, expectedCollected, expectedTraps, expectedPickedId }) => {
      const result = pickupToy(sampleToys, collected, traps, x, y);
      expect(result.collectedToys).toEqual(expectedCollected);
      expect(result.collectedTraps).toEqual(expectedTraps);
      expect(result.pickedToy ? result.pickedToy.id : null).toBe(expectedPickedId);
    });
  });

  describe('openBoxAt', () => {
    it('未開封の箱があるマスで呼び出すとisOpenedがtrueになった新しい配列と開いた箱を返すこと', () => {
      const { newToys, openedBox } = openBoxAt(sampleToys, 1, 2);
      expect(openedBox).not.toBeNull();
      expect(openedBox.id).toBe('box-1');
      expect(openedBox.isOpened).toBe(true);
      expect(newToys.find(t => t.id === 'box-1').isOpened).toBe(true);
      expect(sampleToys.find(t => t.id === 'box-1').isOpened).toBe(false);
    });

    it('箱がないマスではopenedBoxがnullとなること', () => {
      const { openedBox } = openBoxAt(sampleToys, 0, 0);
      expect(openedBox).toBeNull();
    });
  });

  describe('shuffleBoxes', () => {
    it('shouldSwapがtrueのとき中身が入れ替わること', () => {
      const boxes = [
        { id: 'b1', isBox: true, isOpened: true, icon: '🦐', name: 'エビ', isTrap: false },
        { id: 'b2', isBox: true, isOpened: true, icon: '🧻', name: '紙', isTrap: true }
      ];
      const swapped = shuffleBoxes(boxes, true);
      expect(swapped[0].icon).toBe('🧻');
      expect(swapped[0].isTrap).toBe(true);
      expect(swapped[1].icon).toBe('🦐');
      expect(swapped[1].isTrap).toBe(false);
      expect(swapped[0].isOpened).toBe(false);
      expect(swapped[1].isOpened).toBe(false);
    });

    it('3つ以上の箱がある場合に中身がローテーションして入れ替わること', () => {
      const boxes = [
        { id: 'b1', isBox: true, isOpened: true, icon: '🦐', name: 'エビ', isTrap: false },
        { id: 'b2', isBox: true, isOpened: true, icon: '🧻', name: '紙', isTrap: true },
        { id: 'b3', isBox: true, isOpened: true, icon: '🎾', name: 'ボール', isTrap: false }
      ];
      const swapped1 = shuffleBoxes(boxes, 1);
      expect(swapped1[0].icon).toBe('🧻');
      expect(swapped1[1].icon).toBe('🎾');
      expect(swapped1[2].icon).toBe('🦐');
      expect(swapped1.every(b => !b.isOpened)).toBe(true);

      const swapped2 = shuffleBoxes(boxes, 2);
      expect(swapped2[0].icon).toBe('🎾');
      expect(swapped2[1].icon).toBe('🦐');
      expect(swapped2[2].icon).toBe('🧻');
    });
  });
});
