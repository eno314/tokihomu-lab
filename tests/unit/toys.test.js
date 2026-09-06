import { describe, it, expect } from 'vitest';
import { findUncollectedToy, pickupToy, openBoxAt, shuffleBoxes } from '../../src/domain/toys.js';

describe('toys domain logic', () => {
  const sampleToys = [
    { id: 'toy-1', x: 2, y: 2, icon: '🦐', name: 'エビ', isTrap: false },
    { id: 'box-1', x: 1, y: 2, isBox: true, isOpened: false, icon: '🧻', name: '紙', isTrap: true }
  ];

  describe('findUncollectedToy', () => {
    it('未回収のおもちゃが存在するマスならオブジェクトを返すこと', () => {
      const toy = findUncollectedToy(sampleToys, [], [], 2, 2);
      expect(toy).toEqual(sampleToys[0]);
    });

    it('すでに回収済みのおもちゃのマスならnullを返すこと', () => {
      const toy = findUncollectedToy(sampleToys, ['toy-1'], [], 2, 2);
      expect(toy).toBeNull();
    });

    it('おもちゃが存在しないマスならnullを返すこと', () => {
      const toy = findUncollectedToy(sampleToys, [], [], 0, 0);
      expect(toy).toBeNull();
    });
  });

  describe('pickupToy', () => {
    it('通常のおもちゃを拾った場合、collectedToysに追加されること', () => {
      const result = pickupToy(sampleToys, [], [], 2, 2);
      expect(result.collectedToys).toEqual(['toy-1']);
      expect(result.collectedTraps).toEqual([]);
      expect(result.pickedToy).toEqual(sampleToys[0]);
    });

    it('罠（トイレットペーパー）を拾った場合、collectedTrapsに追加されること', () => {
      const result = pickupToy(sampleToys, [], [], 1, 2);
      expect(result.collectedToys).toEqual([]);
      expect(result.collectedTraps).toEqual(['box-1']);
      expect(result.pickedToy.isTrap).toBe(true);
    });

    it('空振り（おもちゃがないマス）の場合はリストが変更されずpickedToyがnullとなること', () => {
      const result = pickupToy(sampleToys, ['toy-1'], [], 0, 0);
      expect(result.collectedToys).toEqual(['toy-1']);
      expect(result.collectedTraps).toEqual([]);
      expect(result.pickedToy).toBeNull();
    });
  });

  describe('openBoxAt', () => {
    it('未開封の箱があるマスで呼び出すとisOpenedがtrueになった新しい配列と開いた箱を返すこと', () => {
      const { newToys, openedBox } = openBoxAt(sampleToys, 1, 2);
      expect(openedBox).not.toBeNull();
      expect(openedBox.id).toBe('box-1');
      expect(openedBox.isOpened).toBe(true);
      expect(newToys.find(t => t.id === 'box-1').isOpened).toBe(true);
      // 元の配列がミューテーションされていないこと (FP特性)
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
      // 箱はすべて未開封(isOpened: false)にリセットされること
      expect(swapped[0].isOpened).toBe(false);
      expect(swapped[1].isOpened).toBe(false);
    });
  });
});
