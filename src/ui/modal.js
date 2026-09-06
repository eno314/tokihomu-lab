/**
 * tokihomu-lab クリア演出・モーダル表示
 */

import { elements } from './dom.js';
import { store } from '../state/store.js';
import { evaluateClear } from '../domain/scoring.js';
import { setPlayerMood, setMessage } from './message.js';
import {
  TOKI_HAPPY_SVG,
  HOMURA_SVG,
  HOMURA_HAPPY_SVG,
  MUNCHKIN_SVG,
  AMERICAN_SHORTHAIR_SVG,
  SIBERIAN_SVG
} from '../constants/assets.js';
import { countProgramBlocks } from '../blockly/parser.js';

function getSortModalCatsHtml() {
  return `
    <div class="modal-cat-box">
      <div class="modal-cat-avatar">${MUNCHKIN_SVG}</div>
      <span class="modal-cat-name">マンチカン (小)</span>
    </div>
    <div class="modal-cat-box">
      <div class="modal-cat-avatar">${AMERICAN_SHORTHAIR_SVG}</div>
      <span class="modal-cat-name">アメショ (中)</span>
    </div>
    <div class="modal-cat-box">
      <div class="modal-cat-avatar">${SIBERIAN_SVG}</div>
      <span class="modal-cat-name">サイベ (大)</span>
    </div>
  `;
}

function getGridModalCatsHtml(isToyMode) {
  const firstAvatar = isToyMode ? HOMURA_HAPPY_SVG : TOKI_HAPPY_SVG;
  const firstName = isToyMode ? 'ホムラ (クリーム長毛)' : 'トキ (ハチワレ)';
  const secondAvatar = isToyMode ? TOKI_HAPPY_SVG : HOMURA_SVG;
  const secondName = isToyMode ? 'トキ (ハチワレ)' : 'ホムラ (クリーム長毛)';
  return `
    <div class="modal-cat-box">
      <div class="modal-cat-avatar">${firstAvatar}</div>
      <span class="modal-cat-name">${firstName}</span>
    </div>
    <div class="modal-heart">💖</div>
    <div class="modal-cat-box">
      <div class="modal-cat-avatar">${secondAvatar}</div>
      <span class="modal-cat-name">${secondName}</span>
    </div>
  `;
}

function renderModalCats(mode) {
  if (!elements.modalCatsContainer) return;
  if (mode === 'sort') {
    elements.modalCatsContainer.innerHTML = getSortModalCatsHtml();
    return;
  }
  elements.modalCatsContainer.innerHTML = getGridModalCatsHtml(mode === 'toy');
}

function renderModalTexts(evaluation) {
  if (elements.victoryTitle) elements.victoryTitle.textContent = evaluation.victoryTitle;
  if (elements.victoryDesc) elements.victoryDesc.innerHTML = evaluation.victoryDescHtml;
  if (!elements.victoryEvaluation) return;
  elements.victoryEvaluation.className = evaluation.evalBadgeClass;
  elements.victoryEvaluation.innerHTML = `
    <div class="eval-badge">${evaluation.evalBadgeText}</div>
    <div class="eval-detail">${evaluation.evalDetailHtml}</div>
  `;
}

function updateModalNextButton(currentLevel) {
  if (!elements.modalNextBtn) return;
  const nextLevel = store.getCurrentLevels().find(l => l.id === currentLevel + 1);
  if (!nextLevel) {
    elements.modalNextBtn.style.display = 'none';
    return;
  }
  elements.modalNextBtn.style.display = 'inline-flex';
  elements.modalNextBtn.textContent = `${nextLevel.name} へすすむ！ 🐾`;
}

export function onGoalReached(workspace) {
  setPlayerMood('happy');
  if (elements.toki) elements.toki.classList.add('victory-jump');

  const state = store.getState();
  const currentLevelData = store.getCurrentLevelData();
  const minBlocks = currentLevelData ? currentLevelData.minBlocks : 0;
  const evaluation = evaluateClear({
    mode: state.currentMode,
    usedBlocks: countProgramBlocks(workspace),
    minBlocks
  });

  setMessage(evaluation.bubbleMessage, 'happy');
  renderModalCats(state.currentMode);
  renderModalTexts(evaluation);
  updateModalNextButton(state.currentLevel);

  setTimeout(() => {
    if (elements.victoryModal) elements.victoryModal.classList.remove('hidden');
  }, 400);
}

export function hideVictoryModal() {
  if (elements.victoryModal) elements.victoryModal.classList.add('hidden');
}
