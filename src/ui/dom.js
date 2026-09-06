/**
 * tokihomu-lab DOM要素の参照管理
 */

export const elements = {};

/**
 * DOM要素のキャッシュを初期化
 */
export function initElements() {
  elements.gridWrapper = document.getElementById('grid-wrapper');
  elements.gridBoard = document.getElementById('grid-board');
  elements.sortStage = document.getElementById('sort-stage');
  elements.toki = document.getElementById('toki-character');
  elements.tokiInner = document.querySelector('.character-inner');
  elements.runBtn = document.getElementById('run-btn');
  elements.resetBtn = document.getElementById('reset-btn');
  elements.speedSelect = document.getElementById('speed-select');
  elements.statusMessage = document.getElementById('status-message');
  elements.speakerAvatar = document.querySelector('.speaker-avatar');
  elements.victoryModal = document.getElementById('victory-modal');
  elements.victoryTitle = document.getElementById('victory-title');
  elements.victoryDesc = document.getElementById('victory-desc');
  elements.victoryEvaluation = document.getElementById('victory-evaluation');
  elements.modalCatsContainer = document.getElementById('modal-cats-container');
  elements.modalNextBtn = document.getElementById('modal-next-btn');
  elements.modalCloseBtn = document.getElementById('modal-close-btn');
  elements.legendStart = document.getElementById('legend-start');
  elements.legendGoal = document.getElementById('legend-goal');
  elements.legendObstacle = document.getElementById('legend-obstacle');
  elements.legendToy = document.getElementById('legend-toy');
  elements.legendSort = document.getElementById('legend-sort');
  elements.toyCounter = document.getElementById('toy-counter');
  elements.toyCounterText = document.getElementById('toy-counter-text');
  elements.levelButtonsContainer = document.getElementById('level-buttons');
  elements.levelButtons = document.querySelectorAll('.level-btn');
  elements.modeTabs = document.querySelectorAll('.mode-tab');
  elements.blocklyDiv = document.getElementById('blocklyDiv');
}
