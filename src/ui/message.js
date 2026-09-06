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

const MOOD_AVATARS = {
  toy: {
    sad: HOMURA_SAD_SVG,
    happy: HOMURA_HAPPY_SVG,
    normal: HOMURA_SVG
  },
  chase: {
    sad: TOKI_SAD_SVG,
    happy: TOKI_HAPPY_SVG,
    normal: TOKI_SVG
  }
};

export function setPlayerMood(mood = 'normal') {
  if (!elements.tokiInner) return;
  const modeKey = store.getState().currentMode === 'toy' ? 'toy' : 'chase';
  const avatar = MOOD_AVATARS[modeKey][mood] || MOOD_AVATARS[modeKey].normal;
  elements.tokiInner.innerHTML = avatar;
}

export const setTokiMood = setPlayerMood;

function resolveSpeakerAvatar(speaker, isToyMode) {
  const charKey = isToyMode ? 'toy' : 'chase';
  const directAvatars = {
    toki: TOKI_SVG,
    homura: HOMURA_SVG,
    sad: MOOD_AVATARS[charKey].sad,
    '😿': MOOD_AVATARS[charKey].sad,
    happy: MOOD_AVATARS[charKey].happy,
    '😸': MOOD_AVATARS[charKey].happy,
    player: MOOD_AVATARS[charKey].normal,
    auto: MOOD_AVATARS[charKey].normal,
    normal: MOOD_AVATARS[charKey].normal,
    '🐱': MOOD_AVATARS[charKey].normal,
    goal: isToyMode ? TOKI_SVG : HOMURA_SVG
  };
  return directAvatars[speaker] || null;
}

export function setMessage(text, speaker = 'auto') {
  if (elements.statusMessage) {
    elements.statusMessage.textContent = text;
  }
  if (!elements.speakerAvatar) return;

  const isToyMode = store.getState().currentMode === 'toy';
  const avatarSvg = resolveSpeakerAvatar(speaker, isToyMode);
  if (avatarSvg) {
    elements.speakerAvatar.innerHTML = avatarSvg;
    return;
  }
  elements.speakerAvatar.textContent = speaker;
}
