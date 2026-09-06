/**
 * tokihomu-lab メインプログラム実行エンジン (おにごっこ・おもちゃあつめ)
 */

import { elements } from '../ui/dom.js';
import { store } from '../state/store.js';
import { setMessage, setPlayerMood } from '../ui/message.js';
import { updateTokiPosition, updateToysDisplay, updateToyCounterDisplay, updateGoalDisplay } from '../ui/renderer.js';
import { getNextPosition, turn, checkCollision } from '../domain/movement.js';
import { stepHomura, checkGoalReached } from '../domain/goal.js';
import { pickupToy, openBoxAt } from '../domain/toys.js';
import { checkCondition } from '../domain/condition.js';
import { onGoalReached } from '../ui/modal.js';
import { runSortProgram, sleep } from './sort-runner.js';
import { getCommandsFromWorkspace } from '../blockly/parser.js';

const COLLISION_MESSAGES = {
  wall: 'いたいっ！ かべに ぶつかっちゃった！(＞＜) 「リセット」をおして やりなおしてね！',
  obstacle: 'あぶない！ ダンボールに ぶつかっちゃった！(＞＜) 「リセット」をおして やりなおしてね！'
};

async function handleCollision(collision, delay) {
  setPlayerMood('sad');
  setMessage(COLLISION_MESSAGES[collision], 'sad');
  if (elements.toki) elements.toki.classList.add('shake-animation');
  await sleep(delay + 200);
  if (elements.toki) elements.toki.classList.remove('shake-animation');
  store.setState({ shouldStop: true });
}

async function handleBoxOpening(nextPos, isToyMode, delay) {
  const { newToys, openedBox } = openBoxAt(store.getState().toys, nextPos.x, nextPos.y);
  if (!openedBox) return;
  store.setState({ toys: newToys });
  updateToysDisplay();
  setMessage(`パカッ！ はこを あけたら ${openedBox.name}（${openedBox.icon}）が はいっていたよ！`, isToyMode ? 'homura' : 'toki');
  await sleep(Math.min(300, delay));
}

async function checkAndHandleGoal(workspace) {
  const state = store.getState();
  const targetTotal = state.toys.filter(t => !t.isTrap).length;
  const result = checkGoalReached({
    mode: state.currentMode,
    x: state.x,
    y: state.y,
    goalX: state.goalX,
    goalY: state.goalY,
    homuraX: state.homuraX,
    homuraY: state.homuraY,
    collectedToysCount: state.collectedToys.length,
    targetToysCount: targetTotal,
    hasTrap: state.collectedTraps.length > 0
  });

  if (!result.isAtGoal) return false;
  if (result.reason === 'trap') {
    setMessage('トキ「トイレットペーパーで イタズラしちゃダメニャ〜！🧻💦 エビのぬいぐるみを もってきてね！」', 'toki');
    return false;
  }
  if (result.reason === 'missing_toys') {
    const remaining = targetTotal - state.collectedToys.length;
    setMessage(`トキ「ぬいぐるみが まだ たりないニャ〜！(あと ${remaining}こ) あつめてきてね！」`, 'toki');
    return false;
  }
  if (result.isSuccess) {
    onGoalReached(workspace);
    return true;
  }
  return false;
}

async function executeMove(cmd, ctx) {
  const curState = store.getState();
  const nextPos = getNextPosition(curState.x, curState.y, curState.direction);
  const collision = checkCollision(nextPos.x, nextPos.y, curState.GRID_SIZE, curState.obstacles);

  if (collision) {
    await handleCollision(collision, ctx.delay);
    return { stop: true };
  }

  store.setState({ x: nextPos.x, y: nextPos.y });
  updateTokiPosition(true);
  setMessage(`まえに すすんだよ！ (いまの ばしょ: ${nextPos.x}, ${nextPos.y})`, ctx.isToyMode ? 'homura' : 'toki');
  await handleBoxOpening(nextPos, ctx.isToyMode, ctx.delay);

  const reached = await checkAndHandleGoal(ctx.workspace);
  return { actionExecuted: true, isSuccess: reached };
}

async function executeTurn(turnType, ctx, msg) {
  const curState = store.getState();
  const nextTurn = turn(curState.direction, curState.totalRotation, turnType);
  store.setState({ direction: nextTurn.direction, totalRotation: nextTurn.totalRotation });
  updateTokiPosition(true);
  setMessage(msg, ctx.isToyMode ? 'homura' : 'toki');
  return { actionExecuted: true };
}

function showToyPickupMessage(toy, remaining, isToyMode) {
  const name = toy.name || 'ぬいぐるみ';
  const icon = toy.icon || '🦐';
  if (remaining > 0) {
    setMessage(`${name}（${icon}）を ひろったよ！ (のこり: ${remaining}こ)`, 'happy');
    return;
  }
  const nextGoalName = isToyMode ? 'トキ' : 'ホムラ';
  setMessage(`${name}（${icon}）を ひろったよ！ ぜんぶあつまった！${nextGoalName}のところへいこう！🎉`, 'happy');
}

async function handleSuccessfulPickup(pickedToy, collectedToys, isToyMode, delay) {
  if (pickedToy.isTrap) {
    setPlayerMood('sad');
    setMessage(`${pickedToy.name}（${pickedToy.icon}）を ひろっちゃった！ からまっちゃうニャ〜！💦`, 'sad');
    await sleep(Math.min(350, delay));
    return;
  }
  setPlayerMood('happy');
  const targetTotal = store.getState().toys.filter(t => !t.isTrap).length;
  showToyPickupMessage(pickedToy, targetTotal - collectedToys.length, isToyMode);
  await sleep(Math.min(350, delay));
  setPlayerMood('normal');
}

async function handleEmptyPickup(isToyMode, delay) {
  if (elements.toki) elements.toki.classList.add('tilt-animation');
  setMessage('あれ？ ここには ぬいぐるみが ないよ？ キョロキョロ…(・_・ )', isToyMode ? 'homura' : 'toki');
  await sleep(delay);
  if (elements.toki) elements.toki.classList.remove('tilt-animation');
}

async function executePickup(cmd, ctx) {
  const curState = store.getState();
  const { collectedToys, collectedTraps, pickedToy } = pickupToy(
    curState.toys,
    curState.collectedToys,
    curState.collectedTraps,
    curState.x,
    curState.y
  );

  if (!pickedToy) {
    await handleEmptyPickup(ctx.isToyMode, ctx.delay);
    return { actionExecuted: true };
  }

  store.setState({ collectedToys, collectedTraps });
  updateToysDisplay();
  updateToyCounterDisplay();
  await handleSuccessfulPickup(pickedToy, collectedToys, ctx.isToyMode, ctx.delay);
  return { actionExecuted: true };
}

async function executeIf(cmd, ctx) {
  const curState = store.getState();
  const matches = checkCondition({
    x: curState.x,
    y: curState.y,
    direction: curState.direction,
    target: cmd.target || 'feet',
    conditionItem: cmd.conditionItem,
    obstacles: curState.obstacles,
    toys: curState.toys,
    collectedToys: curState.collectedToys,
    collectedTraps: curState.collectedTraps
  });

  if (matches) {
    await ctx.executeCommandList(cmd.branch);
    return { isBranch: true };
  }
  await sleep(Math.min(200, ctx.delay));
  return { isBranch: true };
}

const COMMAND_EXECUTORS = {
  MOVE: executeMove,
  TURN_RIGHT: (cmd, ctx) => executeTurn('right', ctx, 'みぎを むいたよ！ ↷'),
  TURN_LEFT: (cmd, ctx) => executeTurn('left', ctx, 'ひだりを むいたよ！ ↶'),
  PICKUP: executePickup,
  IF: executeIf
};

async function handleMovingGoal(ctx) {
  await sleep(Math.min(250, Math.floor(ctx.delay / 2)));
  if (store.getState().shouldStop) return { stop: true };

  const curState = store.getState();
  const nextHomura = stepHomura(curState.homuraX, curState.homuraDir, curState.GRID_SIZE);
  store.setState({ homuraX: nextHomura.homuraX, homuraDir: nextHomura.homuraDir });
  updateGoalDisplay();
  setMessage(`ホムラも てくてく にげたよ！ (ホムラの ばしょ: ${nextHomura.homuraX}, ${curState.homuraY})`, 'homura');

  const reached = await checkAndHandleGoal(ctx.workspace);
  return { isSuccess: reached };
}

function getFailureMessage(isToyMode, isAtGoal, hasTrap, remaining) {
  if (isToyMode && hasTrap) {
    if (isAtGoal) return 'トキ「トイレットペーパーで イタズラしちゃダメニャ〜！🧻💦 「リセット」をおして やりなおしてね！」';
    return 'トイレットペーパーを ひろっちゃったよ…！🧻💦 「リセット」をおして やりなおしてね！';
  }
  if (isToyMode && remaining > 0) {
    if (isAtGoal) return `トキ「ぬいぐるみが まだ たりないニャ〜！(あと ${remaining}こ) 「リセット」をおして やりなおしてね！」`;
    return `ぬいぐるみを ぜんぶ あつめられなかったよ…！(あと ${remaining}こ) 「リセット」をおして やりなおしてね！`;
  }
  if (isToyMode) {
    return 'トキのところへ たどりつけなかったよ…！(＞＜) 「リセット」をおして やりなおしてね！';
  }
  return 'ホムラをつかまえられなかったよ…！(＞＜) 「リセット」をおして やりなおしてね！';
}

function handleExecutionFailure(isToyMode) {
  setPlayerMood('sad');
  const curState = store.getState();
  const isAtGoal = isToyMode
    ? (curState.x === curState.goalX && curState.y === curState.goalY)
    : (curState.x === curState.homuraX && curState.y === curState.homuraY);
  const targetTotal = curState.toys.filter(t => !t.isTrap).length;
  const remaining = targetTotal - curState.collectedToys.length;
  const hasTrap = curState.collectedTraps.length > 0;
  const msg = getFailureMessage(isToyMode, isAtGoal, hasTrap, remaining);
  const speaker = isAtGoal && isToyMode ? 'toki' : 'sad';
  setMessage(msg, speaker);
}

function prepareRunUI() {
  store.setState({ isRunning: true, shouldStop: false });
  if (elements.runBtn) elements.runBtn.disabled = true;
  setPlayerMood('normal');
  if (elements.toki) {
    elements.toki.classList.remove('victory-jump', 'shake-animation');
  }
}

export async function runProgram(workspace) {
  const state = store.getState();
  if (state.isRunning || (elements.runBtn && elements.runBtn.disabled)) return;

  const commands = getCommandsFromWorkspace(workspace);
  if (commands.length === 0) {
    setMessage('ブロックが つながっていないよ！ブロックをならべてみてね。', '🐾');
    return;
  }

  prepareRunUI();
  if (store.getState().currentMode === 'sort') {
    await runSortProgram(commands, workspace);
    return;
  }

  const isToyMode = store.getState().currentMode === 'toy';
  setMessage('出発進行！にゃ〜ん！🐾', isToyMode ? 'homura' : 'toki');

  const getStepDelay = () => parseInt(elements.speedSelect ? elements.speedSelect.value : 450, 10) || 450;
  let isSuccess = false;

  const ctx = {
    workspace,
    isToyMode,
    get delay() { return getStepDelay(); },
    executeCommandList: async (list) => executeCommandList(list)
  };

  async function executeCommandList(cmdList) {
    for (const cmd of cmdList) {
      if (store.getState().shouldStop || isSuccess) break;
      if (workspace && cmd.blockId) workspace.highlightBlock(cmd.blockId);

      const executor = COMMAND_EXECUTORS[cmd.type];
      if (!executor) continue;

      const result = (await executor(cmd, ctx)) || {};
      if (result.stop) break;
      if (result.isSuccess) {
        isSuccess = true;
        break;
      }

      if (result.actionExecuted && store.getState().movingGoal) {
        const goalStep = await handleMovingGoal(ctx);
        if (goalStep.stop) break;
        if (goalStep.isSuccess) {
          isSuccess = true;
          break;
        }
      }

      await sleep(getStepDelay());
    }
  }

  await executeCommandList(commands);
  if (workspace) workspace.highlightBlock(null);
  if (!isSuccess && !store.getState().shouldStop) {
    handleExecutionFailure(isToyMode);
  }
  if (!store.getState().shouldStop && store.getState().isRunning && elements.runBtn) {
    elements.runBtn.disabled = true;
  }
  store.setState({ isRunning: false });
}
