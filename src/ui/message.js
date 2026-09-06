/**
 * tokihomu-lab 吹き出しメッセージ・アバター表情表示
 */

import { elements } from './dom.js';
import { store } from '../state/store.js';
import {
  TOKI_SVG,
  TOKI_SAD_SVG,
  TOKI_HAPPY_SVG,
  HOMURA_SVG,
  HOMURA_SAD_SVG,
  HOMURA_HAPPY_SVG
} from '../constants/assets.js';

/**
 * プレイヤー（トキ／ホムラ）の表情を切り替える
 * @param {'normal' | 'happy' | 'sad'} mood
 */
export function setPlayerMood(mood = 'normal') {
  if (!elements.tokiInner) return;
  const state = store.getState();
  const isToyMode = state.currentMode === 'toy';

  if (isToyMode) {
    if (mood === 'sad') {
      elements.tokiInner.innerHTML = HOMURA_SAD_SVG;
    } else if (mood === 'happy') {
      elements.tokiInner.innerHTML = HOMURA_HAPPY_SVG;
    } else {
      elements.tokiInner.innerHTML = HOMURA_SVG;
    }
  } else {
    if (mood === 'sad') {
      elements.tokiInner.innerHTML = TOKI_SAD_SVG;
    } else if (mood === 'happy') {
      elements.tokiInner.innerHTML = TOKI_HAPPY_SVG;
    } else {
      elements.tokiInner.innerHTML = TOKI_SVG;
    }
  }
}

export const setTokiMood = setPlayerMood;

/**
 * 吹き出しメッセージと話者アバターを更新
 * @param {string} text
 * @param {string} speaker
 */
export function setMessage(text, speaker = 'auto') {
  if (elements.statusMessage) {
    elements.statusMessage.textContent = text;
  }
  if (!elements.speakerAvatar) return;

  const state = store.getState();
  const isToyMode = state.currentMode === 'toy';

  if (speaker === 'toki') {
    elements.speakerAvatar.innerHTML = TOKI_SVG;
  } else if (speaker === 'homura') {
    elements.speakerAvatar.innerHTML = HOMURA_SVG;
  } else if (speaker === 'sad' || speaker === '😿') {
    elements.speakerAvatar.innerHTML = isToyMode ? HOMURA_SAD_SVG : TOKI_SAD_SVG;
  } else if (speaker === 'happy' || speaker === '😸') {
    elements.speakerAvatar.innerHTML = isToyMode ? HOMURA_HAPPY_SVG : TOKI_HAPPY_SVG;
  } else if (speaker === 'player' || speaker === 'auto' || speaker === 'normal' || speaker === '🐱') {
    elements.speakerAvatar.innerHTML = isToyMode ? HOMURA_SVG : TOKI_SVG;
  } else if (speaker === 'goal') {
    elements.speakerAvatar.innerHTML = isToyMode ? TOKI_SVG : HOMURA_SVG;
  } else {
    elements.speakerAvatar.textContent = speaker;
  }
}
