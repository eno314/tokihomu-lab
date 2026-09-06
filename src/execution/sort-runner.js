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

/**
 * ソートモード専用の実行エンジン
 * @param {Array<Object>} commands
 * @param {Object} [workspace]
 */
export async function runSortProgram(commands, workspace) {
  const getStepDelay = () => parseInt(elements.speedSelect ? elements.speedSelect.value : 450, 10) || 450;
  setMessage('大きさ比べ スタートニャ！🐾', 'toki');

  async function executeSortCommands(cmdList, activeLaneIds = null) {
    for (let i = 0; i < cmdList.length; i++) {
      if (store.getState().shouldStop) break;

      const cmd = cmdList[i];
      if (workspace && cmd.blockId) {
        workspace.highlightBlock(cmd.blockId);
      }

      if (cmd.type === 'SORT_IF') {
        const state = store.getState();
        const currentActiveLanes = activeLaneIds
          ? state.sortLanes.filter(l => activeLaneIds.includes(l.id))
          : state.sortLanes;
        const matchingLanes = filterLanesByCondition(currentActiveLanes, state.sortPointer);

        if (matchingLanes.length > 0) {
          const names = matchingLanes.map(l => l.name).join(' と ');
          setMessage(`「ひだりのほうが おおきいニャ！（${names}） なかのブロックを じっこうするよ！」`, 'toki');
          await sleep(Math.min(300, getStepDelay()));
          await executeSortCommands(cmd.branch, matchingLanes.map(l => l.id));
        } else {
          setMessage('「ひだりのほうが ちいさい（または おなじ）から そのままでOKニャ！」', 'toki');
          await sleep(Math.min(300, getStepDelay()));
        }
        await sleep(Math.floor(getStepDelay() / 2));
      } else if (cmd.type === 'SORT_SWAP' || cmd.type === 'SORT_COMPARE_SWAP') {
        let anySwapped = false;
        const swapLaneNames = [];
        const state = store.getState();
        const currentActiveLaneIds = activeLaneIds || state.sortLanes.map(l => l.id);
        const p = state.sortPointer;

        const nextLanes = state.sortLanes.map(lane => {
          if (!currentActiveLaneIds.includes(lane.id)) return lane;

          const condition = cmd.type === 'SORT_SWAP' ? 'always' : 'if_greater';
          const { newLane, swapped } = swapCatsInLane(lane, p, condition);
          if (swapped) {
            anySwapped = true;
            swapLaneNames.push(lane.name);

            const slotA = document.getElementById(`cat-slot-${lane.id}-${p}`);
            const slotB = document.getElementById(`cat-slot-${lane.id}-${p + 1}`);
            if (slotA && slotB) {
              const itemA = slotA.querySelector('.sort-cat-item');
              const itemB = slotB.querySelector('.sort-cat-item');
              if (itemA) itemA.classList.add('cat-swapping');
              if (itemB) itemB.classList.add('cat-swapping');
            }
          }
          return newLane;
        });

        if (anySwapped) {
          store.setState({ sortLanes: nextLanes });
          setMessage(`「${swapLaneNames.join(' と ')}で ねこを いれかえたよ！🔄」`, 'toki');
          await sleep(getStepDelay());
          renderSortStage();
        } else {
          await sleep(Math.min(250, getStepDelay()));
        }
        await sleep(Math.floor(getStepDelay() / 2));
      } else if (cmd.type === 'SORT_STEP_NEXT') {
        const state = store.getState();
        const maxPointer = (state.sortLanes[0] ? state.sortLanes[0].cats.length : 3) - 2;
        const { nextPointer, isOutOfBounds } = stepSortPointer(state.sortPointer, maxPointer);

        if (!isOutOfBounds) {
          store.setState({ sortPointer: nextPointer });
          updateSupervisorPositions();
          setMessage('つぎの ペアへ すすんだよ！🐾', 'toki');
          await sleep(getStepDelay());
        } else {
          setPlayerMood('sad');
          setMessage('「ここが はしっこニャ！ これいじょう みぎには すすめないよ」 「リセット」をおして やりなおしてね！', 'sad');
          store.setState({ shouldStop: true });
          break;
        }
      } else if (cmd.type === 'SORT_RESET_POINTER') {
        store.setState({ sortPointer: 0 });
        updateSupervisorPositions();
        setMessage('さいしょの ペア（1ばんめと 2ばんめ）に もどったよ！⏪', 'toki');
        await sleep(getStepDelay());
      }

      await sleep(Math.floor(getStepDelay() / 2));
    }
  }

  await executeSortCommands(commands);

  if (workspace) {
    workspace.highlightBlock(null);
  }

  const state = store.getState();
  const allSorted = areAllLanesSorted(state.sortLanes);
  if (allSorted) {
    onGoalReached(workspace);
  } else if (!state.shouldStop) {
    setPlayerMood('sad');
    setMessage('プログラムが おわったよ！ でも まだ ちいさいじゅんに ならんでいないニャ〜。「リセット」してお手本やくりかえしをためしてみてね！', 'sad');
  }

  if (!store.getState().shouldStop && elements.runBtn) {
    elements.runBtn.disabled = true;
  }
  store.setState({ isRunning: false });
}
