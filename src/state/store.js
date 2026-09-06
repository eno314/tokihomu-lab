/**
 * tokihomu-lab 状態管理ストア (FP志向: イミュータブル更新 + Store)
 */

import { LEVELS_CHASE, LEVELS_TOY, LEVELS_SORT } from '../constants/levels.js';
import { shuffleBoxes as shuffleBoxesPure } from '../domain/toys.js';

/**
 * 初期状態を生成する純粋関数
 * @returns {Object}
 */
export function createInitialState() {
  return {
    currentMode: 'chase', // 'chase' | 'toy' | 'sort'
    currentLevel: 1,
    GRID_SIZE: 5,
    startX: 0,
    startY: 0,
    goalX: 4,
    goalY: 4,
    obstacles: [],
    toys: [],
    collectedToys: [],
    collectedTraps: [],
    movingGoal: false,
    homuraInitialDir: -1,
    homuraX: 4,
    homuraY: 4,
    homuraDir: -1,
    sortPointer: 0,
    sortLanes: [],
    x: 0,
    y: 0,
    direction: 1, // 0:上, 1:右, 2:下, 3:左
    totalRotation: 90,
    isRunning: false,
    shouldStop: false
  };
}

const LEVELS_BY_MODE = {
  sort: LEVELS_SORT,
  toy: LEVELS_TOY,
  chase: LEVELS_CHASE
};

export function getLevelsForMode(mode) {
  return LEVELS_BY_MODE[mode] || LEVELS_CHASE;
}

export function getCurrentLevelData(state) {
  const levels = getLevelsForMode(state.currentMode);
  return levels.find(l => l.id === state.currentLevel) || levels[0];
}

function createSortLevelState(prevState, level, mode) {
  return {
    ...prevState,
    currentMode: mode,
    currentLevel: level.id,
    sortPointer: 0,
    sortLanes: (level.lanes || []).map(lane => ({
      ...lane,
      cats: lane.cats.map(c => ({ ...c }))
    })),
    isRunning: false,
    shouldStop: false
  };
}

function createGridLevelState(prevState, level, mode) {
  return {
    ...prevState,
    currentMode: mode,
    currentLevel: level.id,
    GRID_SIZE: level.gridSize,
    startX: level.startX,
    startY: level.startY,
    goalX: level.goalX,
    goalY: level.goalY,
    movingGoal: !!level.movingGoal,
    homuraInitialDir: level.homuraInitialDir || -1,
    homuraX: level.goalX,
    homuraY: level.goalY,
    homuraDir: level.homuraInitialDir || -1,
    obstacles: [...(level.obstacles || [])],
    toys: (level.toys || []).map(t => ({ ...t })),
    collectedToys: [],
    collectedTraps: [],
    x: level.startX,
    y: level.startY,
    direction: level.startDirection,
    totalRotation: level.startRotation,
    isRunning: false,
    shouldStop: false
  };
}

export function applyLoadLevel(prevState, levelId, mode = prevState.currentMode) {
  const levels = getLevelsForMode(mode);
  const level = levels.find(l => l.id === levelId) || levels[0];
  if (mode === 'sort') {
    return createSortLevelState(prevState, level, mode);
  }
  return createGridLevelState(prevState, level, mode);
}

function resolveSwapValue(boxCount) {
  if (typeof window !== 'undefined' && window.__forceBoxSwap !== undefined) {
    return window.__forceBoxSwap;
  }
  return boxCount <= 2 ? Math.random() < 0.5 : Math.floor(Math.random() * boxCount);
}

function resolveResetToys(level) {
  const baseToys = (level.toys || []).map(t => ({ ...t }));
  if (!level.hasRandomBoxes) return baseToys;
  return shuffleBoxesPure(baseToys, resolveSwapValue(baseToys.length));
}

function resetSortState(prevState, level) {
  return {
    ...prevState,
    sortPointer: 0,
    sortLanes: (level.lanes || []).map(lane => ({
      ...lane,
      cats: lane.cats.map(c => ({ ...c }))
    })),
    isRunning: false,
    shouldStop: false
  };
}

function resetGridState(prevState, level) {
  return {
    ...prevState,
    x: level.startX,
    y: level.startY,
    direction: level.startDirection,
    totalRotation: level.startRotation,
    homuraX: level.goalX,
    homuraY: level.goalY,
    homuraDir: level.homuraInitialDir || -1,
    toys: resolveResetToys(level),
    collectedToys: [],
    collectedTraps: [],
    isRunning: false,
    shouldStop: false
  };
}

export function applyReset(prevState) {
  const level = getCurrentLevelData(prevState);
  if (prevState.currentMode === 'sort') {
    return resetSortState(prevState, level);
  }
  return resetGridState(prevState, level);
}

/**
 * 最小限のStoreクラス
 */
class Store {
  constructor() {
    this._state = createInitialState();
    this._listeners = new Set();
  }

  getState() {
    return this._state;
  }

  setState(nextStateOrUpdater) {
    const nextState = typeof nextStateOrUpdater === 'function'
      ? nextStateOrUpdater(this._state)
      : nextStateOrUpdater;
    this._state = { ...this._state, ...nextState };
    this._notify();
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify() {
    for (const listener of this._listeners) {
      listener(this._state);
    }
  }

  // 便利ヘルパー（後方互換用プロパティアクセスも兼ねる）
  get currentMode() { return this._state.currentMode; }
  set currentMode(val) { this._state.currentMode = val; }
  get currentLevel() { return this._state.currentLevel; }
  set currentLevel(val) { this._state.currentLevel = val; }
  get GRID_SIZE() { return this._state.GRID_SIZE; }
  set GRID_SIZE(val) { this._state.GRID_SIZE = val; }
  get startX() { return this._state.startX; }
  set startX(val) { this._state.startX = val; }
  get startY() { return this._state.startY; }
  set startY(val) { this._state.startY = val; }
  get goalX() { return this._state.goalX; }
  set goalX(val) { this._state.goalX = val; }
  get goalY() { return this._state.goalY; }
  set goalY(val) { this._state.goalY = val; }
  get obstacles() { return this._state.obstacles; }
  set obstacles(val) { this._state.obstacles = val; }
  get toys() { return this._state.toys; }
  set toys(val) { this._state.toys = val; }
  get collectedToys() { return this._state.collectedToys; }
  set collectedToys(val) { this._state.collectedToys = val; }
  get collectedTraps() { return this._state.collectedTraps; }
  set collectedTraps(val) { this._state.collectedTraps = val; }
  get movingGoal() { return this._state.movingGoal; }
  set movingGoal(val) { this._state.movingGoal = val; }
  get homuraX() { return this._state.homuraX; }
  set homuraX(val) { this._state.homuraX = val; }
  get homuraY() { return this._state.homuraY; }
  set homuraY(val) { this._state.homuraY = val; }
  get homuraDir() { return this._state.homuraDir; }
  set homuraDir(val) { this._state.homuraDir = val; }
  get homuraInitialDir() { return this._state.homuraInitialDir; }
  set homuraInitialDir(val) { this._state.homuraInitialDir = val; }
  get sortPointer() { return this._state.sortPointer; }
  set sortPointer(val) { this._state.sortPointer = val; }
  get sortLanes() { return this._state.sortLanes; }
  set sortLanes(val) { this._state.sortLanes = val; }
  get x() { return this._state.x; }
  set x(val) { this._state.x = val; }
  get y() { return this._state.y; }
  set y(val) { this._state.y = val; }
  get direction() { return this._state.direction; }
  set direction(val) { this._state.direction = val; }
  get totalRotation() { return this._state.totalRotation; }
  set totalRotation(val) { this._state.totalRotation = val; }
  get isRunning() { return this._state.isRunning; }
  set isRunning(val) { this._state.isRunning = val; }
  get shouldStop() { return this._state.shouldStop; }
  set shouldStop(val) { this._state.shouldStop = val; }

  getCurrentLevels() {
    return getLevelsForMode(this._state.currentMode);
  }

  getCurrentLevelData() {
    return getCurrentLevelData(this._state);
  }

  loadLevel(levelId, mode = this._state.currentMode) {
    this._state = applyLoadLevel(this._state, levelId, mode);
    this.reset();
  }

  reset() {
    this._state = applyReset(this._state);
    this._notify();
  }
}

export const store = new Store();
export const GameState = store;
