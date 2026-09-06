/**
 * tokihomu-lab クリア演出・モーダル表示
 */

import { elements } from './dom.js';
import { store } from '../state/store.js';
import { evaluateClear } from '../domain/scoring.js';
import { setPlayerMood, setMessage } from './message.js';
import {
  TOKI_SVG,
  TOKI_HAPPY_SVG,
  HOMURA_SVG,
  HOMURA_HAPPY_SVG,
  MUNCHKIN_SVG,
  AMERICAN_SHORTHAIR_SVG,
  SIBERIAN_SVG
} from '../constants/assets.js';
import { countProgramBlocks } from '../blockly/parser.js';

/**
 * ゴール達成時の演出およびモーダル表示
 * @param {Object} [workspace]
 */
export function onGoalReached(workspace) {
  setPlayerMood('happy');
  if (elements.toki) {
    elements.toki.classList.add('victory-jump');
  }

  const state = store.getState();
  const currentLevelData = store.getCurrentLevelData();
  const minBlocks = currentLevelData ? currentLevelData.minBlocks : 0;
  const usedBlocks = countProgramBlocks(workspace);

  const evaluation = evaluateClear({
    mode: state.currentMode,
    usedBlocks,
    minBlocks
  });

  // 吹き出しメッセージ
  setMessage(evaluation.bubbleMessage, 'happy');

  // モーダル内の猫アイコン
  if (elements.modalCatsContainer) {
    if (state.currentMode === 'sort') {
      elements.modalCatsContainer.innerHTML = `
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
    } else {
      const isToyMode = state.currentMode === 'toy';
      elements.modalCatsContainer.innerHTML = `
        <div class="modal-cat-box">
          <div class="modal-cat-avatar">${isToyMode ? HOMURA_HAPPY_SVG : TOKI_HAPPY_SVG}</div>
          <span class="modal-cat-name">${isToyMode ? 'ホムラ (クリーム長毛)' : 'トキ (ハチワレ)'}</span>
        </div>
        <div class="modal-heart">💖</div>
        <div class="modal-cat-box">
          <div class="modal-cat-avatar">${isToyMode ? TOKI_HAPPY_SVG : HOMURA_SVG}</div>
          <span class="modal-cat-name">${isToyMode ? 'トキ (ハチワレ)' : 'ホムラ (クリーム長毛)'}</span>
        </div>
      `;
    }
  }

  // モーダル内テキスト
  if (elements.victoryTitle) {
    elements.victoryTitle.textContent = evaluation.victoryTitle;
  }
  if (elements.victoryDesc) {
    elements.victoryDesc.innerHTML = evaluation.victoryDescHtml;
  }
  if (elements.victoryEvaluation) {
    elements.victoryEvaluation.className = evaluation.evalBadgeClass;
    elements.victoryEvaluation.innerHTML = `
      <div class="eval-badge">${evaluation.evalBadgeText}</div>
      <div class="eval-detail">${evaluation.evalDetailHtml}</div>
    `;
  }

  // 次のレベルボタン
  const currentLevels = store.getCurrentLevels();
  const nextLevel = currentLevels.find(l => l.id === state.currentLevel + 1);
  if (elements.modalNextBtn) {
    if (nextLevel) {
      elements.modalNextBtn.style.display = 'inline-flex';
      elements.modalNextBtn.textContent = `${nextLevel.name} へすすむ！ 🐾`;
    } else {
      elements.modalNextBtn.style.display = 'none';
    }
  }

  setTimeout(() => {
    if (elements.victoryModal) {
      elements.victoryModal.classList.remove('hidden');
    }
  }, 400);
}

/**
 * モーダルを閉じる
 */
export function hideVictoryModal() {
  if (elements.victoryModal) {
    elements.victoryModal.classList.add('hidden');
  }
}
