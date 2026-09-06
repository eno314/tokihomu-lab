/**
 * tokihomu-lab 盤面・キャラクター・ソートステージのレンダリング
 */

import { elements } from './dom.js';
import { store } from '../state/store.js';
import { TOKI_SVG, HOMURA_SVG, getCatSvg } from '../constants/assets.js';
import { isLaneSorted } from '../domain/sort.js';
import { setPlayerMood } from './message.js';

/**
 * リサイズ時の描画更新
 * @param {Object} [workspace]
 */
export function onResize(workspace) {
  if (workspace && typeof Blockly !== 'undefined' && Blockly.svgResize) {
    Blockly.svgResize(workspace);
  }
  updateTokiPosition(false);
}

/**
 * 5×5 グリッド盤面の描画
 */
export function createGridBoard() {
  if (!elements.gridBoard) return;
  const state = store.getState();

  elements.gridBoard.innerHTML = '';
  for (let y = 0; y < state.GRID_SIZE; y++) {
    for (let x = 0; x < state.GRID_SIZE; x++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.classList.add((x + y) % 2 === 0 ? 'cell-even' : 'cell-odd');
      cell.dataset.x = x;
      cell.dataset.y = y;

      // スタート地点
      if (x === state.startX && y === state.startY) {
        cell.classList.add('start-cell');
        const startLabel = document.createElement('span');
        startLabel.className = 'start-indicator';
        startLabel.textContent = 'スタート';
        cell.appendChild(startLabel);
      }

      // 障害物セル（ダンボール箱）
      const isObstacle = state.obstacles.some(obs => obs.x === x && obs.y === y);
      if (isObstacle) {
        cell.classList.add('obstacle-cell');
        const obstacleItem = document.createElement('div');
        obstacleItem.className = 'obstacle-item';
        obstacleItem.innerHTML = `
          <span>📦</span>
          <span class="obstacle-label">ダンボール</span>
        `;
        cell.appendChild(obstacleItem);
      }

      elements.gridBoard.appendChild(cell);
    }
  }

  updateGoalDisplay();
  updateToysDisplay();

  if (elements.legendObstacle) {
    elements.legendObstacle.style.display = state.obstacles.length > 0 ? 'inline-flex' : 'none';
  }

  updateToyCounterDisplay();
  updateTokiPosition(false);
}

/**
 * 盤面のおもちゃ（ぬいぐるみ・箱）表示更新
 */
export function updateToysDisplay() {
  if (!elements.gridBoard) return;
  const state = store.getState();

  const allCells = elements.gridBoard.querySelectorAll('.grid-cell');
  allCells.forEach(cell => {
    cell.classList.remove('toy-cell');
    const toyItem = cell.querySelector('.toy-item');
    if (toyItem) toyItem.remove();
  });

  state.toys.forEach(toy => {
    const isCollected = state.collectedToys.includes(toy.id) ||
      (state.collectedTraps && state.collectedTraps.includes(toy.id));
    if (!isCollected) {
      const targetCell = elements.gridBoard.querySelector(
        `.grid-cell[data-x="${toy.x}"][data-y="${toy.y}"]`
      );
      if (targetCell) {
        targetCell.classList.add('toy-cell');
        const toyItem = document.createElement('div');
        toyItem.className = 'toy-item';
        toyItem.dataset.toyId = toy.id;

        if (toy.isBox && !toy.isOpened) {
          toyItem.classList.add('box-unopened');
          toyItem.innerHTML = `
            <span>🎁</span>
            <span class="toy-label">はこ</span>
          `;
        } else {
          if (toy.isBox && toy.isOpened) {
            toyItem.classList.add('box-opened-anim');
          }
          toyItem.innerHTML = `
            <span>${toy.icon || '🦐'}</span>
            <span class="toy-label">${toy.name || 'ぬいぐるみ'}</span>
          `;
        }
        targetCell.appendChild(toyItem);
      }
    }
  });
}

/**
 * おもちゃカウンターと凡例の表示更新
 */
export function updateToyCounterDisplay() {
  const state = store.getState();
  const targetToys = state.toys.filter(t => !t.isTrap);
  const total = targetToys.length;
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

/**
 * ゴール（ホムラ／トキ）の盤面表示更新
 */
export function updateGoalDisplay() {
  if (!elements.gridBoard) return;
  const state = store.getState();

  const allCells = elements.gridBoard.querySelectorAll('.grid-cell');
  allCells.forEach(cell => {
    cell.classList.remove('goal-cell');
    const indicator = cell.querySelector('.goal-indicator');
    if (indicator) indicator.remove();
    const items = cell.querySelector('.goal-items');
    if (items) items.remove();
  });

  const isToyMode = state.currentMode === 'toy';
  const goalX = isToyMode ? state.goalX : state.homuraX;
  const goalY = isToyMode ? state.goalY : state.homuraY;

  const targetCell = elements.gridBoard.querySelector(
    `.grid-cell[data-x="${goalX}"][data-y="${goalY}"]`
  );

  if (targetCell) {
    targetCell.classList.add('goal-cell');

    const goalLabel = document.createElement('span');
    goalLabel.className = 'goal-indicator';
    goalLabel.textContent = 'ゴール';
    targetCell.appendChild(goalLabel);

    const goalItems = document.createElement('div');
    goalItems.className = 'goal-items';

    if (isToyMode) {
      goalItems.innerHTML = `
        <div class="toki-avatar">
          ${TOKI_SVG}
        </div>
      `;
    } else {
      const flipStyle = state.homuraDir === 1 ? 'transform: scaleX(-1);' : '';
      goalItems.innerHTML = `
        <div class="homura-avatar" style="${flipStyle}">
          ${HOMURA_SVG}
        </div>
      `;
    }
    targetCell.appendChild(goalItems);
  }
}

/**
 * 操作キャラクター（トキ／ホムラ）の画面位置・向きの更新
 * @param {boolean} [animate=true]
 */
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

  if (!animate) {
    elements.toki.style.transition = 'none';
  } else {
    elements.toki.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }

  elements.toki.style.transform = `translate(${posX}px, ${posY}px) rotate(${state.totalRotation}deg)`;
}

/**
 * ソートモード専用ステージの描画
 */
export function renderSortStage() {
  if (!elements.sortStage) return;
  const state = store.getState();
  elements.sortStage.innerHTML = '';
  const isSingle = state.sortLanes.length === 1;
  elements.sortStage.classList.toggle('single-lane-stage', isSingle);
  elements.sortStage.classList.toggle('two-lanes', !isSingle);
  elements.sortStage.classList.toggle('level-2', !isSingle);

  state.sortLanes.forEach(lane => {
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

    lane.cats.forEach((cat, catIdx) => {
      const slot = document.createElement('div');
      slot.className = `sort-cat-slot${(catIdx === state.sortPointer || catIdx === state.sortPointer + 1) ? ' focus-cat' : ''}`;
      slot.dataset.index = catIdx;
      slot.id = `cat-slot-${lane.id}-${catIdx}`;

      const catItem = document.createElement('div');
      catItem.className = 'sort-cat-item';
      catItem.innerHTML = `
        <div class="sort-cat-svg sort-cat-${cat.type}">
          ${getCatSvg(cat.type)}
        </div>
        <span class="cat-badge cat-badge-${cat.type}">🐱 ${cat.name} ${cat.badge}</span>
      `;
      slot.appendChild(catItem);
      row.appendChild(slot);
    });

    const pointerBar = document.createElement('div');
    pointerBar.className = 'sort-pointer-bar';
    pointerBar.id = `sort-pointer-bar-${lane.id}`;

    const supervisor = document.createElement('div');
    supervisor.className = 'sort-supervisor-indicator';
    supervisor.id = `sort-supervisor-${lane.id}`;
    const supervisorAvatarSvg = lane.supervisor === 'toki' ? TOKI_SVG : HOMURA_SVG;
    supervisor.innerHTML = `
      <div class="supervisor-mini-avatar">${supervisorAvatarSvg}</div>
      <div class="supervisor-bracket">くらべるニャ🔍</div>
    `;
    pointerBar.appendChild(supervisor);
    row.appendChild(pointerBar);

    laneDiv.appendChild(row);
    elements.sortStage.appendChild(laneDiv);
  });

  updateSupervisorPositions();
}

/**
 * ソートモード監督猫の位置およびフォーカス枠の更新
 */
export function updateSupervisorPositions() {
  const state = store.getState();
  state.sortLanes.forEach(lane => {
    const supervisor = document.getElementById(`sort-supervisor-${lane.id}`);
    if (supervisor) {
      const leftPercent = state.sortPointer === 0 ? 33.3 : 66.6;
      supervisor.style.left = `${leftPercent}%`;
    }
    lane.cats.forEach((_, idx) => {
      const slot = document.getElementById(`cat-slot-${lane.id}-${idx}`);
      if (slot) {
        if (idx === state.sortPointer || idx === state.sortPointer + 1) {
          slot.classList.add('focus-cat');
        } else {
          slot.classList.remove('focus-cat');
        }
      }
    });
  });
}

/**
 * モード選択UIの更新
 */
export function updateModeUI() {
  const state = store.getState();
  const isToyMode = state.currentMode === 'toy';
  const isSortMode = state.currentMode === 'sort';

  if (elements.gridWrapper) {
    elements.gridWrapper.style.display = isSortMode ? 'none' : 'block';
  }
  if (elements.sortStage) {
    elements.sortStage.style.display = isSortMode ? 'flex' : 'none';
  }

  if (elements.legendStart) {
    elements.legendStart.style.display = isSortMode ? 'none' : 'inline-flex';
    elements.legendStart.textContent = isToyMode ? '🚩 スタート: ホムラ (🐈)' : '🚩 スタート: トキ (🐾)';
  }
  if (elements.legendGoal) {
    elements.legendGoal.style.display = isSortMode ? 'none' : 'inline-flex';
    elements.legendGoal.textContent = isToyMode ? '🎯 ゴール: トキ (🐾)' : '🎯 ゴール: ホムラ (🐈)';
  }
  if (elements.legendToy) {
    elements.legendToy.style.display = (isToyMode && !isSortMode) ? 'inline-flex' : 'none';
  }
  if (elements.legendObstacle) {
    elements.legendObstacle.style.display = (!isSortMode && state.obstacles.length > 0) ? 'inline-flex' : 'none';
  }
  if (elements.toyCounter) {
    elements.toyCounter.style.display = (isToyMode && !isSortMode) ? 'inline-flex' : 'none';
  }
  if (elements.legendSort) {
    elements.legendSort.style.display = isSortMode ? 'inline-flex' : 'none';
  }

  setPlayerMood('normal');
}

/**
 * レベルボタン一覧の動的描画
 */
export function renderLevelButtons() {
  if (!elements.levelButtonsContainer) return;
  const state = store.getState();
  const levels = store.getCurrentLevels();
  elements.levelButtonsContainer.innerHTML = '';

  levels.forEach(level => {
    const btn = document.createElement('button');
    btn.className = `level-btn${level.id === state.currentLevel ? ' active' : ''}`;
    btn.dataset.level = level.id;
    let icon = '🌟';
    if (state.currentMode === 'toy') {
      icon = level.id === 1 ? '🦐' : level.id === 2 ? '🎾' : '🎁';
    } else if (state.currentMode === 'sort') {
      icon = level.id === 1 ? '🌟' : '👑';
    } else {
      icon = level.id === 1 ? '🌟' : level.id === 2 ? '📦' : level.id === 3 ? '🐾' : '👑';
    }
    btn.textContent = `${icon} ${level.name}`;
    elements.levelButtonsContainer.appendChild(btn);
  });

  elements.levelButtons = elements.levelButtonsContainer.querySelectorAll('.level-btn');
}
