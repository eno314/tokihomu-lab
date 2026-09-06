/**
 * tokihomu-lab 盤面・キャラクター・ソートステージのレンダリング
 */

import { elements } from './dom.js';
import { store } from '../state/store.js';
import { TOKI_SVG, HOMURA_SVG, getCatSvg } from '../constants/assets.js';
import { isLaneSorted } from '../domain/sort.js';
import { setPlayerMood } from './message.js';

export function onResize(workspace) {
  if (workspace && typeof Blockly !== 'undefined' && Blockly.svgResize) {
    Blockly.svgResize(workspace);
  }
  updateTokiPosition(false);
}

function attachStartIndicator(cell) {
  cell.classList.add('start-cell');
  const startLabel = document.createElement('span');
  startLabel.className = 'start-indicator';
  startLabel.textContent = 'スタート';
  cell.appendChild(startLabel);
}

function attachObstacleItem(cell) {
  cell.classList.add('obstacle-cell');
  const obstacleItem = document.createElement('div');
  obstacleItem.className = 'obstacle-item';
  obstacleItem.innerHTML = '<span>📦</span><span class="obstacle-label">ダンボール</span>';
  cell.appendChild(obstacleItem);
}

function createGridCell(x, y, state) {
  const cell = document.createElement('div');
  cell.classList.add('grid-cell', (x + y) % 2 === 0 ? 'cell-even' : 'cell-odd');
  cell.dataset.x = x;
  cell.dataset.y = y;

  if (x === state.startX && y === state.startY) {
    attachStartIndicator(cell);
  }
  if (state.obstacles.some(obs => obs.x === x && obs.y === y)) {
    attachObstacleItem(cell);
  }
  return cell;
}

function populateGridCells(board, state) {
  board.innerHTML = '';
  for (let y = 0; y < state.GRID_SIZE; y++) {
    for (let x = 0; x < state.GRID_SIZE; x++) {
      board.appendChild(createGridCell(x, y, state));
    }
  }
}

export function createGridBoard() {
  if (!elements.gridBoard) return;
  const state = store.getState();
  populateGridCells(elements.gridBoard, state);
  updateGoalDisplay();
  updateToysDisplay();
  if (elements.legendObstacle) {
    elements.legendObstacle.style.display = state.obstacles.length > 0 ? 'inline-flex' : 'none';
  }
  updateToyCounterDisplay();
  updateTokiPosition(false);
}

function createToyElement(toy) {
  const toyItem = document.createElement('div');
  toyItem.className = 'toy-item';
  toyItem.dataset.toyId = toy.id;

  if (toy.isBox && !toy.isOpened) {
    toyItem.classList.add('box-unopened');
    toyItem.innerHTML = '<span>🎁</span><span class="toy-label">はこ</span>';
    return toyItem;
  }
  if (toy.isBox && toy.isOpened) {
    toyItem.classList.add('box-opened-anim');
  }
  toyItem.innerHTML = `<span>${toy.icon || '🦐'}</span><span class="toy-label">${toy.name || 'ぬいぐるみ'}</span>`;
  return toyItem;
}

function renderToyOnBoard(board, toy) {
  const targetCell = board.querySelector(`.grid-cell[data-x="${toy.x}"][data-y="${toy.y}"]`);
  if (!targetCell) return;
  targetCell.classList.add('toy-cell');
  targetCell.appendChild(createToyElement(toy));
}

export function updateToysDisplay() {
  if (!elements.gridBoard) return;
  const state = store.getState();

  elements.gridBoard.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('toy-cell');
    const toyItem = cell.querySelector('.toy-item');
    if (toyItem) toyItem.remove();
  });

  state.toys.forEach(toy => {
    const isCollected = state.collectedToys.includes(toy.id) ||
      (state.collectedTraps && state.collectedTraps.includes(toy.id));
    if (!isCollected) {
      renderToyOnBoard(elements.gridBoard, toy);
    }
  });
}

export function updateToyCounterDisplay() {
  const state = store.getState();
  const total = state.toys.filter(t => !t.isTrap).length;
  const isToyMode = state.currentMode === 'toy' && total > 0;

  if (elements.toyCounter) {
    elements.toyCounter.style.display = isToyMode ? 'inline-flex' : 'none';
    if (elements.toyCounterText) {
      elements.toyCounterText.textContent = `${state.collectedToys.length} / ${total}`;
    }
  }
  if (elements.legendToy) {
    elements.legendToy.style.display = isToyMode ? 'inline-flex' : 'none';
  }
}

function createGoalIndicatorElements(isToyMode, homuraDir) {
  const goalLabel = document.createElement('span');
  goalLabel.className = 'goal-indicator';
  goalLabel.textContent = 'ゴール';

  const goalItems = document.createElement('div');
  goalItems.className = 'goal-items';
  if (isToyMode) {
    goalItems.innerHTML = `<div class="toki-avatar">${TOKI_SVG}</div>`;
    return [goalLabel, goalItems];
  }
  const flipStyle = homuraDir === 1 ? 'transform: scaleX(-1);' : '';
  goalItems.innerHTML = `<div class="homura-avatar" style="${flipStyle}">${HOMURA_SVG}</div>`;
  return [goalLabel, goalItems];
}

export function updateGoalDisplay() {
  if (!elements.gridBoard) return;
  const state = store.getState();

  elements.gridBoard.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('goal-cell');
    const indicator = cell.querySelector('.goal-indicator');
    if (indicator) indicator.remove();
    const items = cell.querySelector('.goal-items');
    if (items) items.remove();
  });

  const isToyMode = state.currentMode === 'toy';
  const goalX = isToyMode ? state.goalX : state.homuraX;
  const goalY = isToyMode ? state.goalY : state.homuraY;
  const targetCell = elements.gridBoard.querySelector(`.grid-cell[data-x="${goalX}"][data-y="${goalY}"]`);
  if (!targetCell) return;

  targetCell.classList.add('goal-cell');
  const [label, items] = createGoalIndicatorElements(isToyMode, state.homuraDir);
  targetCell.appendChild(label);
  targetCell.appendChild(items);
}

export function updateTokiPosition(animate = true) {
  if (!elements.gridBoard || !elements.toki) return;
  const state = store.getState();
  const cellSize = elements.gridBoard.clientWidth / state.GRID_SIZE;
  if (!cellSize) return;

  const posX = state.x * cellSize;
  const posY = state.y * cellSize;
  elements.toki.style.setProperty('--current-x', `${posX}px`);
  elements.toki.style.setProperty('--current-y', `${posY}px`);
  elements.toki.style.setProperty('--current-rot', `${state.totalRotation}deg`);
  elements.toki.style.transition = animate ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none';
  elements.toki.style.transform = `translate(${posX}px, ${posY}px) rotate(${state.totalRotation}deg)`;
}

function createCatSlot(laneId, cat, catIdx, sortPointer) {
  const slot = document.createElement('div');
  const isFocused = catIdx === sortPointer || catIdx === sortPointer + 1;
  slot.className = `sort-cat-slot${isFocused ? ' focus-cat' : ''}`;
  slot.dataset.index = catIdx;
  slot.id = `cat-slot-${laneId}-${catIdx}`;

  const catItem = document.createElement('div');
  catItem.className = 'sort-cat-item';
  catItem.innerHTML = `
    <div class="sort-cat-svg sort-cat-${cat.type}">${getCatSvg(cat.type)}</div>
    <span class="cat-badge cat-badge-${cat.type}">🐱 ${cat.name} ${cat.badge}</span>
  `;
  slot.appendChild(catItem);
  return slot;
}

function createPointerBar(lane) {
  const pointerBar = document.createElement('div');
  pointerBar.className = 'sort-pointer-bar';
  pointerBar.id = `sort-pointer-bar-${lane.id}`;

  const supervisor = document.createElement('div');
  supervisor.className = 'sort-supervisor-indicator';
  supervisor.id = `sort-supervisor-${lane.id}`;
  const avatar = lane.supervisor === 'toki' ? TOKI_SVG : HOMURA_SVG;
  supervisor.innerHTML = `<div class="supervisor-mini-avatar">${avatar}</div><div class="supervisor-bracket">くらべるニャ🔍</div>`;
  pointerBar.appendChild(supervisor);
  return pointerBar;
}

function renderLane(lane, state, isSingle) {
  const laneDiv = document.createElement('div');
  laneDiv.className = `sort-lane${isSingle ? ' single-lane' : ''}`;
  laneDiv.id = `sort-lane-${lane.id}`;

  const isSorted = isLaneSorted(lane);
  const header = document.createElement('div');
  header.className = 'sort-lane-header';
  header.innerHTML = `
    <span>${lane.supervisor === 'toki' ? '🐾 トキ組' : '🐈 ホムラ組'}</span>
    <span class="sort-lane-status ${isSorted ? 'is-sorted' : 'not-sorted'}" id="status-${lane.id}">
      ${isSorted ? '✨ せいれつOK！' : '🐾 ならびかえ中…'}
    </span>
  `;
  laneDiv.appendChild(header);

  const row = document.createElement('div');
  row.className = 'sort-cats-row';
  row.id = `sort-cats-row-${lane.id}`;
  lane.cats.forEach((cat, idx) => {
    row.appendChild(createCatSlot(lane.id, cat, idx, state.sortPointer));
  });
  row.appendChild(createPointerBar(lane));
  laneDiv.appendChild(row);
  return laneDiv;
}

export function renderSortStage() {
  if (!elements.sortStage) return;
  const state = store.getState();
  elements.sortStage.innerHTML = '';
  const isSingle = state.sortLanes.length === 1;
  elements.sortStage.classList.toggle('single-lane-stage', isSingle);
  elements.sortStage.classList.toggle('two-lanes', !isSingle);
  elements.sortStage.classList.toggle('level-2', !isSingle);

  state.sortLanes.forEach(lane => {
    elements.sortStage.appendChild(renderLane(lane, state, isSingle));
  });
  updateSupervisorPositions();
}

export function updateSupervisorPositions() {
  const state = store.getState();
  state.sortLanes.forEach(lane => {
    const supervisor = document.getElementById(`sort-supervisor-${lane.id}`);
    if (supervisor) {
      const numCats = (lane.cats && lane.cats.length) ? lane.cats.length : 3;
      const percent = ((state.sortPointer + 1) / numCats) * 100;
      supervisor.style.left = `${percent}%`;
    }
    lane.cats.forEach((_, idx) => {
      const slot = document.getElementById(`cat-slot-${lane.id}-${idx}`);
      if (slot) {
        slot.classList.toggle('focus-cat', idx === state.sortPointer || idx === state.sortPointer + 1);
      }
    });
  });
}

function updateModeVisibility(isSortMode, isToyMode, obstacleCount) {
  if (elements.gridWrapper) elements.gridWrapper.style.display = isSortMode ? 'none' : 'block';
  if (elements.sortStage) elements.sortStage.style.display = isSortMode ? 'flex' : 'none';
  if (elements.legendStart) {
    elements.legendStart.style.display = isSortMode ? 'none' : 'inline-flex';
    elements.legendStart.textContent = isToyMode ? '🚩 スタート: ホムラ (🐈)' : '🚩 スタート: トキ (🐾)';
  }
  if (elements.legendGoal) {
    elements.legendGoal.style.display = isSortMode ? 'none' : 'inline-flex';
    elements.legendGoal.textContent = isToyMode ? '🎯 ゴール: トキ (🐾)' : '🎯 ゴール: ホムラ (🐈)';
  }
  if (elements.legendToy) elements.legendToy.style.display = (isToyMode && !isSortMode) ? 'inline-flex' : 'none';
  if (elements.legendObstacle) elements.legendObstacle.style.display = (!isSortMode && obstacleCount > 0) ? 'inline-flex' : 'none';
  if (elements.toyCounter) elements.toyCounter.style.display = (isToyMode && !isSortMode) ? 'inline-flex' : 'none';
  if (elements.legendSort) elements.legendSort.style.display = isSortMode ? 'inline-flex' : 'none';
}

export function updateModeUI() {
  const state = store.getState();
  const isToyMode = state.currentMode === 'toy';
  const isSortMode = state.currentMode === 'sort';
  updateModeVisibility(isSortMode, isToyMode, state.obstacles.length);
  setPlayerMood('normal');
}

const LEVEL_ICONS = {
  toy: { 1: '🦐', 2: '🎾', 3: '🎁', 4: '👑' },
  sort: { 1: '🌟', 2: '🐾', 3: '👑' },
  chase: { 1: '🌟', 2: '📦', 3: '🐾', 4: '👑' }
};

function getLevelIcon(mode, levelId) {
  const modeIcons = LEVEL_ICONS[mode] || LEVEL_ICONS.chase;
  return modeIcons[levelId] || '🌟';
}

export function renderLevelButtons() {
  if (!elements.levelButtonsContainer) return;
  const state = store.getState();
  const levels = store.getCurrentLevels();
  elements.levelButtonsContainer.innerHTML = '';

  levels.forEach(level => {
    const btn = document.createElement('button');
    btn.className = `level-btn${level.id === state.currentLevel ? ' active' : ''}`;
    btn.dataset.level = level.id;
    btn.textContent = `${getLevelIcon(state.currentMode, level.id)} ${level.name}`;
    elements.levelButtonsContainer.appendChild(btn);
  });

  elements.levelButtons = elements.levelButtonsContainer.querySelectorAll('.level-btn');
}
