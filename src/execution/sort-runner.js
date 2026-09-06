/**
 * tokihomu-lab ソートモード実行エンジン
 */

import { elements } from '../ui/dom.js';
import { store } from '../state/store.js';
import { setMessage, setPlayerMood } from '../ui/message.js';
import { renderSortStage, updateSupervisorPositions } from '../ui/renderer.js';
import { areAllLanesSorted, swapCatsInLane, stepSortPointer, filterLanesByCondition } from '../domain/sort.js';
import { onGoalReached } from '../ui/modal.js';

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function triggerSwapAnimation(laneId, p) {
  const slotA = document.getElementById(`cat-slot-${laneId}-${p}`);
  const slotB = document.getElementById(`cat-slot-${laneId}-${p + 1}`);
  if (!slotA || !slotB) return;
  const itemA = slotA.querySelector('.sort-cat-item');
  const itemB = slotB.querySelector('.sort-cat-item');
  if (itemA) itemA.classList.add('cat-swapping');
  if (itemB) itemB.classList.add('cat-swapping');
}

function processLaneSwap(lane, activeLaneIds, pointer, condition, swappedLanes) {
  if (!activeLaneIds.includes(lane.id)) return lane;
  const { newLane, swapped } = swapCatsInLane(lane, pointer, condition);
  if (swapped) {
    swappedLanes.push(lane.name);
    triggerSwapAnimation(lane.id, pointer);
  }
  return newLane;
}

async function executeSortSwap(cmd, ctx) {
  const state = store.getState();
  const activeLaneIds = ctx.activeLaneIds || state.sortLanes.map(l => l.id);
  const condition = cmd.type === 'SORT_SWAP' ? 'always' : 'if_greater';
  const swappedLanes = [];

  const nextLanes = state.sortLanes.map(lane =>
    processLaneSwap(lane, activeLaneIds, state.sortPointer, condition, swappedLanes)
  );

  if (swappedLanes.length > 0) {
    store.setState({ sortLanes: nextLanes });
    setMessage(`「${swappedLanes.join(' と ')}で ねこを いれかえたよ！🔄」`, 'toki');
    await sleep(ctx.delay);
    renderSortStage();
    return;
  }
  await sleep(Math.min(250, ctx.delay));
}

function getSortIfSkipMessage(condition) {
  if (condition === 'at_end' || condition === 'いちばんうしろ') {
    return '「まだ いちばんうしろ じゃないから そのままでOKニャ！」';
  }
  return '「ひだりのほうが ちいさい（または おなじ）から そのままでOKニャ！」';
}

function getSortIfMatchMessage(condition, names) {
  if (condition === 'at_end' || condition === 'いちばんうしろ') {
    return `「いちばんうしろニャ！（${names}） なかのブロックを じっこうするよ！」`;
  }
  return `「ひだりのほうが おおきいニャ！（${names}） なかのブロックを じっこうするよ！」`;
}

async function executeSortIf(cmd, ctx) {
  const state = store.getState();
  const lanes = ctx.activeLaneIds
    ? state.sortLanes.filter(l => ctx.activeLaneIds.includes(l.id))
    : state.sortLanes;
  const condition = cmd.condition || 'greater';
  const matching = filterLanesByCondition(lanes, state.sortPointer, condition);

  if (matching.length === 0) {
    setMessage(getSortIfSkipMessage(condition), 'toki');
    await sleep(Math.min(300, ctx.delay));
    return;
  }

  const names = matching.map(l => l.name).join(' と ');
  setMessage(getSortIfMatchMessage(condition, names), 'toki');
  await sleep(Math.min(300, ctx.delay));
  await ctx.executeCommands(cmd.branch, matching.map(l => l.id));
}

async function executeSortIfElse(cmd, ctx) {
  const state = store.getState();
  const lanes = ctx.activeLaneIds
    ? state.sortLanes.filter(l => ctx.activeLaneIds.includes(l.id))
    : state.sortLanes;
  const condition = cmd.condition || 'greater';
  const matching = filterLanesByCondition(lanes, state.sortPointer, condition);
  const matchingIds = matching.map(l => l.id);
  const nonMatchingIds = lanes.filter(l => !matchingIds.includes(l.id)).map(l => l.id);

  if (matchingIds.length > 0 && cmd.branch && cmd.branch.length > 0) {
    const names = matching.map(l => l.name).join(' と ');
    setMessage(getSortIfMatchMessage(condition, names), 'toki');
    await sleep(Math.min(300, ctx.delay));
    await ctx.executeCommands(cmd.branch, matchingIds);
  }

  if (nonMatchingIds.length > 0 && cmd.elseBranch && cmd.elseBranch.length > 0) {
    const nonMatching = lanes.filter(l => nonMatchingIds.includes(l.id));
    const names = nonMatching.map(l => l.name).join(' と ');
    setMessage(`「そうでないニャ！（${names}） なかのブロックを じっこうするよ！」`, 'toki');
    await sleep(Math.min(300, ctx.delay));
    await ctx.executeCommands(cmd.elseBranch, nonMatchingIds);
  }
}

async function executeSortStepNext(cmd, ctx) {
  const state = store.getState();
  const maxPointer = (state.sortLanes[0] ? state.sortLanes[0].cats.length : 3) - 2;
  const { nextPointer, isOutOfBounds } = stepSortPointer(state.sortPointer, maxPointer);

  if (isOutOfBounds) {
    setPlayerMood('sad');
    setMessage('「ここが はしっこニャ！ これいじょう みぎには すすめないよ」 「リセット」をおして やりなおしてね！', 'sad');
    store.setState({ shouldStop: true });
    return { stop: true };
  }

  store.setState({ sortPointer: nextPointer });
  updateSupervisorPositions();
  setMessage('つぎの ペアへ すすんだよ！🐾', 'toki');
  await sleep(ctx.delay);
  return {};
}

async function executeSortResetPointer(cmd, ctx) {
  store.setState({ sortPointer: 0 });
  updateSupervisorPositions();
  setMessage('さいしょの ペア（1ばんめと 2ばんめ）に もどったよ！⏪', 'toki');
  await sleep(ctx.delay);
  return {};
}

const SORT_COMMAND_EXECUTORS = {
  SORT_IF: executeSortIf,
  SORT_IF_ELSE: executeSortIfElse,
  SORT_SWAP: executeSortSwap,
  SORT_COMPARE_SWAP: executeSortSwap,
  SORT_STEP_NEXT: executeSortStepNext,
  SORT_RESET_POINTER: executeSortResetPointer
};

function finishSortProgram(workspace) {
  if (workspace) workspace.highlightBlock(null);
  const state = store.getState();
  if (areAllLanesSorted(state.sortLanes)) {
    onGoalReached(workspace);
    return;
  }
  if (!state.shouldStop) {
    setPlayerMood('sad');
    setMessage('プログラムが おわったよ！ でも まだ ちいさいじゅんに ならんでいないニャ〜。「リセット」してお手本やくりかえしをためしてみてね！', 'sad');
  }
}

export async function runSortProgram(commands, workspace) {
  const getStepDelay = () => parseInt(elements.speedSelect ? elements.speedSelect.value : 450, 10) || 450;
  setMessage('大きさ比べ スタートニャ！🐾', 'toki');

  async function executeSortCommands(cmdList, activeLaneIds = null) {
    for (const cmd of cmdList) {
      if (store.getState().shouldStop) break;
      if (workspace && cmd.blockId) workspace.highlightBlock(cmd.blockId);

      const executor = SORT_COMMAND_EXECUTORS[cmd.type];
      if (!executor) continue;

      const ctx = {
        activeLaneIds,
        get delay() { return getStepDelay(); },
        executeCommands: executeSortCommands
      };

      const result = await executor(cmd, ctx);
      if (result && result.stop) break;
      await sleep(Math.floor(getStepDelay() / 2));
    }
  }

  await executeSortCommands(commands);
  finishSortProgram(workspace);

  if (!store.getState().shouldStop && store.getState().isRunning && elements.runBtn) {
    elements.runBtn.disabled = true;
  }
  store.setState({ isRunning: false });
}
