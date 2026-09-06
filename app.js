/**
 * tokihomu-lab (ときほむラボ)
 * 子供向けプログラミング学習ゲーム メインエントリポイント
 */

import { elements, initElements } from './src/ui/dom.js';
import { store, GameState } from './src/state/store.js';
import {
  registerCustomBlocks,
  setupInitialBlocks,
  updateToolboxForCurrentState
} from './src/blockly/blocks.js';
import {
  createGridBoard,
  updateToysDisplay,
  updateToyCounterDisplay,
  updateGoalDisplay,
  updateTokiPosition,
  renderSortStage,
  updateModeUI,
  renderLevelButtons,
  onResize
} from './src/ui/renderer.js';
import { setMessage, setPlayerMood } from './src/ui/message.js';
import { onGoalReached, hideVictoryModal } from './src/ui/modal.js';
import { runProgram } from './src/execution/runner.js';

let workspace = null;

/**
 * Blockly の初期化
 * @param {number} [retries=30]
 */
function initBlockly(retries = 100) {
  const blocklyDiv = elements.blocklyDiv || document.getElementById('blocklyDiv');
  if (typeof Blockly === 'undefined' || !blocklyDiv) {
    if (retries > 0) {
      setTimeout(() => initBlockly(retries - 1), 100);
      return;
    }
    console.error('Blockly が読み込まれていません。CDN接続を確認してください。');
    setMessage('Blocklyの読み込みにしっぱいしました。ネット接続をかくにんしてね。');
    return;
  }

  registerCustomBlocks();

  const toolboxXml = document.getElementById('toolbox');
  workspace = Blockly.inject(elements.blocklyDiv, {
    toolbox: toolboxXml,
    trashcan: true,
    scrollbars: true,
    sounds: false,
    zoom: {
      controls: true,
      wheel: false,
      startScale: 1.1,
      maxScale: 1.5,
      minScale: 0.7,
      scaleSpeed: 1.1
    },
    grid: {
      spacing: 24,
      length: 2,
      colour: '#e0e0e0',
      snap: true
    }
  });

  // テスト互換性のため window.workspace にもエクスポート
  window.workspace = workspace;

  setupInitialBlocks(workspace, store.getState().currentMode);

  window.addEventListener('resize', () => onResize(workspace));
  setTimeout(() => onResize(workspace), 100);
}

/**
 * レベル切り替え
 * @param {number} levelId
 */
export function setLevel(levelId) {
  if (store.getState().isRunning) {
    store.setState({ shouldStop: true });
  }

  store.loadLevel(levelId);
  updateToolboxForCurrentState(workspace);

  if (elements.levelButtons) {
    elements.levelButtons.forEach(btn => {
      if (parseInt(btn.dataset.level, 10) === levelId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  if (store.getState().currentMode === 'sort') {
    renderSortStage();
  } else {
    createGridBoard();
  }
  resetGame();

  const currentLevelData = store.getCurrentLevelData();
  if (currentLevelData) {
    const isToyMode = store.getState().currentMode === 'toy';
    setMessage(currentLevelData.startMessage, isToyMode ? 'homura' : 'toki');
  }
}

/**
 * モード切り替え (おにごっこ / ぬいぐるみあつめ / おおきさくらべ)
 * @param {'chase' | 'toy' | 'sort'} mode
 */
export function setMode(mode) {
  if (store.getState().currentMode === mode) return;
  if (store.getState().isRunning) {
    store.setState({ shouldStop: true });
  }

  store.setState({ currentMode: mode });

  if (elements.modeTabs) {
    elements.modeTabs.forEach(tab => {
      if (tab.dataset.mode === mode) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  updateModeUI();
  renderLevelButtons();
  setupInitialBlocks(workspace, mode);
  setLevel(1);
}

/**
 * 盤面とプレイヤーのリセット
 */
export function resetGame() {
  store.setState({ shouldStop: true });
  store.reset();

  setPlayerMood('normal');
  if (elements.toki) {
    elements.toki.classList.remove('victory-jump', 'shake-animation', 'tilt-animation');
  }
  hideVictoryModal();

  if (store.getState().currentMode === 'sort') {
    renderSortStage();
  } else {
    updateTokiPosition(true);
    updateGoalDisplay();
    updateToysDisplay();
    updateToyCounterDisplay();
  }

  updateModeUI();

  if (workspace) {
    workspace.highlightBlock(null);
  }

  const currentLevelData = store.getCurrentLevelData();
  const isToyMode = store.getState().currentMode === 'toy';
  const defaultMsg = store.getState().currentMode === 'sort'
    ? 'さいしょの ならびかたに もどったよ！「うごかす！」をおしてね。'
    : 'スタートちてんに もどったよ！「うごかす！」をおしてね。';
  const msg = currentLevelData ? currentLevelData.startMessage : defaultMsg;
  setMessage(msg, isToyMode ? 'homura' : 'toki');

  if (elements.runBtn) elements.runBtn.disabled = false;
}

/**
 * イベントリスナーの登録
 */
function setupEventListeners() {
  if (elements.runBtn) {
    elements.runBtn.addEventListener('click', () => runProgram(workspace));
  }
  if (elements.resetBtn) {
    elements.resetBtn.addEventListener('click', resetGame);
  }
  if (elements.modalCloseBtn) {
    elements.modalCloseBtn.addEventListener('click', () => {
      hideVictoryModal();
      resetGame();
    });
  }
  if (elements.modalNextBtn) {
    elements.modalNextBtn.addEventListener('click', () => {
      hideVictoryModal();
      const currentLevels = store.getCurrentLevels();
      const nextLevel = currentLevels.find(l => l.id === store.getState().currentLevel + 1);
      if (nextLevel) {
        setLevel(nextLevel.id);
      } else {
        resetGame();
      }
    });
  }

  if (elements.levelButtonsContainer) {
    elements.levelButtonsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.level-btn');
      if (!btn) return;
      const levelId = parseInt(btn.dataset.level, 10);
      if (levelId && levelId !== store.getState().currentLevel) {
        setLevel(levelId);
      }
    });
  }

  if (elements.modeTabs) {
    elements.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        if (mode && mode !== store.getState().currentMode) {
          setMode(mode);
        }
      });
    });
  }
}

// 起動時初期化
function init() {
  initElements();
  store.loadLevel(1);
  createGridBoard();
  initBlockly();
  setupEventListeners();
  updateModeUI();

  requestAnimationFrame(() => {
    updateTokiPosition(false);
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// E2Eテスト・後方互換用グローバルプロパティ
window.store = store;
window.GameState = GameState;
window.setLevel = setLevel;
window.setMode = setMode;
window.resetGame = resetGame;
window.runProgram = () => runProgram(workspace);
window.onGoalReached = () => onGoalReached(workspace);
