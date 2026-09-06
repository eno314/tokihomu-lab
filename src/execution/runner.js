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
import { onGoalReached } from '../ui/modal.js';
import { runSortProgram, sleep } from './sort-runner.js';
import { getCommandsFromWorkspace } from '../blockly/parser.js';

/**
 * プログラム実行
 * @param {Object} [workspace]
 */
export async function runProgram(workspace) {
  const state = store.getState();
  if (state.isRunning || (elements.runBtn && elements.runBtn.disabled)) return;

  const commands = getCommandsFromWorkspace(workspace);
  if (commands.length === 0) {
    setMessage('ブロックが つながっていないよ！ブロックをならべてみてね。', '🐾');
    return;
  }

  store.setState({ isRunning: true, shouldStop: false });
  if (elements.runBtn) elements.runBtn.disabled = true;
  setPlayerMood('normal');
  if (elements.toki) {
    elements.toki.classList.remove('victory-jump', 'shake-animation');
  }

  if (store.getState().currentMode === 'sort') {
    await runSortProgram(commands, workspace);
    return;
  }

  const isToyMode = store.getState().currentMode === 'toy';
  setMessage('出発進行！にゃ〜ん！🐾', isToyMode ? 'homura' : 'toki');

  const getStepDelay = () => parseInt(elements.speedSelect ? elements.speedSelect.value : 450, 10) || 450;
  let isSuccess = false;

  async function executeCommandList(cmdList) {
    for (let i = 0; i < cmdList.length; i++) {
      if (store.getState().shouldStop || isSuccess) break;

      const cmd = cmdList[i];
      if (workspace && cmd.blockId) {
        workspace.highlightBlock(cmd.blockId);
      }

      if (cmd.type === 'IF') {
        const curState = store.getState();
        const currentToy = curState.toys.find(
          t => t.x === curState.x && t.y === curState.y &&
            !curState.collectedToys.includes(t.id) &&
            !(curState.collectedTraps && curState.collectedTraps.includes(t.id))
        );
        const matches = currentToy && currentToy.icon === cmd.conditionItem;
        if (matches) {
          await executeCommandList(cmd.branch);
        } else {
          await sleep(Math.min(200, getStepDelay()));
        }
        await sleep(getStepDelay());
        continue;
      }

      let actionExecuted = false;

      if (cmd.type === 'MOVE') {
        const curState = store.getState();
        const nextPos = getNextPosition(curState.x, curState.y, curState.direction);
        const collision = checkCollision(nextPos.x, nextPos.y, curState.GRID_SIZE, curState.obstacles);

        if (collision === 'wall') {
          setPlayerMood('sad');
          setMessage('いたいっ！ かべに ぶつかっちゃった！(＞＜) 「リセット」をおして やりなおしてね！', 'sad');
          if (elements.toki) elements.toki.classList.add('shake-animation');
          await sleep(getStepDelay() + 200);
          if (elements.toki) elements.toki.classList.remove('shake-animation');
          store.setState({ shouldStop: true });
          break;
        } else if (collision === 'obstacle') {
          setPlayerMood('sad');
          setMessage('あぶない！ ダンボールに ぶつかっちゃった！(＞＜) 「リセット」をおして やりなおしてね！', 'sad');
          if (elements.toki) elements.toki.classList.add('shake-animation');
          await sleep(getStepDelay() + 200);
          if (elements.toki) elements.toki.classList.remove('shake-animation');
          store.setState({ shouldStop: true });
          break;
        } else {
          store.setState({ x: nextPos.x, y: nextPos.y });
          updateTokiPosition(true);
          setMessage(`まえに すすんだよ！ (いまの ばしょ: ${nextPos.x}, ${nextPos.y})`, isToyMode ? 'homura' : 'toki');

          // 箱の自動オープン判定
          const { newToys, openedBox } = openBoxAt(store.getState().toys, nextPos.x, nextPos.y);
          if (openedBox) {
            store.setState({ toys: newToys });
            updateToysDisplay();
            setMessage(`パカッ！ はこを あけたら ${openedBox.name}（${openedBox.icon}）が はいっていたよ！`, isToyMode ? 'homura' : 'toki');
            await sleep(Math.min(300, getStepDelay()));
          }

          // ゴール判定
          const targetTotal = store.getState().toys.filter(t => !t.isTrap).length;
          const goalResult = checkGoalReached({
            mode: store.getState().currentMode,
            x: store.getState().x,
            y: store.getState().y,
            goalX: store.getState().goalX,
            goalY: store.getState().goalY,
            homuraX: store.getState().homuraX,
            homuraY: store.getState().homuraY,
            collectedToysCount: store.getState().collectedToys.length,
            targetToysCount: targetTotal,
            hasTrap: store.getState().collectedTraps.length > 0
          });

          if (goalResult.isAtGoal) {
            if (goalResult.reason === 'trap') {
              setMessage('トキ「トイレットペーパーで イタズラしちゃダメニャ〜！🧻💦 エビのぬいぐるみを もってきてね！」', 'toki');
            } else if (goalResult.reason === 'missing_toys') {
              const remaining = targetTotal - store.getState().collectedToys.length;
              setMessage(`トキ「ぬいぐるみが まだ たりないニャ〜！(あと ${remaining}こ) あつめてきてね！」`, 'toki');
            } else if (goalResult.isSuccess) {
              isSuccess = true;
              onGoalReached(workspace);
              break;
            }
          }

          actionExecuted = true;
        }
      } else if (cmd.type === 'TURN_RIGHT') {
        const curState = store.getState();
        const nextTurn = turn(curState.direction, curState.totalRotation, 'right');
        store.setState({ direction: nextTurn.direction, totalRotation: nextTurn.totalRotation });
        updateTokiPosition(true);
        setMessage('みぎを むいたよ！ ↷', isToyMode ? 'homura' : 'toki');
        actionExecuted = true;
      } else if (cmd.type === 'TURN_LEFT') {
        const curState = store.getState();
        const nextTurn = turn(curState.direction, curState.totalRotation, 'left');
        store.setState({ direction: nextTurn.direction, totalRotation: nextTurn.totalRotation });
        updateTokiPosition(true);
        setMessage('ひだりを むいたよ！ ↶', isToyMode ? 'homura' : 'toki');
        actionExecuted = true;
      } else if (cmd.type === 'PICKUP') {
        const curState = store.getState();
        const { collectedToys, collectedTraps, pickedToy } = pickupToy(
          curState.toys,
          curState.collectedToys,
          curState.collectedTraps,
          curState.x,
          curState.y
        );

        if (pickedToy) {
          store.setState({ collectedToys, collectedTraps });
          updateToysDisplay();
          updateToyCounterDisplay();

          if (pickedToy.isTrap) {
            setPlayerMood('sad');
            setMessage(`${pickedToy.name}（${pickedToy.icon}）を ひろっちゃった！ からまっちゃうニャ〜！💦`, 'sad');
            await sleep(Math.min(350, getStepDelay()));
          } else {
            setPlayerMood('happy');
            const targetTotal = curState.toys.filter(t => !t.isTrap).length;
            const remaining = targetTotal - collectedToys.length;
            const toyName = pickedToy.name || 'ぬいぐるみ';
            const toyIcon = pickedToy.icon || '🦐';
            if (remaining > 0) {
              setMessage(`${toyName}（${toyIcon}）を ひろったよ！ (のこり: ${remaining}こ)`, 'happy');
            } else {
              const nextGoalName = isToyMode ? 'トキ' : 'ホムラ';
              setMessage(`${toyName}（${toyIcon}）を ひろったよ！ ぜんぶあつまった！${nextGoalName}のところへいこう！🎉`, 'happy');
            }
            await sleep(Math.min(350, getStepDelay()));
            setPlayerMood('normal');
          }
        } else {
          if (elements.toki) elements.toki.classList.add('tilt-animation');
          setMessage('あれ？ ここには ぬいぐるみが ないよ？ キョロキョロ…(・_・ )', isToyMode ? 'homura' : 'toki');
          await sleep(getStepDelay());
          if (elements.toki) elements.toki.classList.remove('tilt-animation');
        }
        actionExecuted = true;
      }

      // にげるホムラの移動（movingGoal）
      if (actionExecuted && store.getState().movingGoal) {
        await sleep(Math.min(250, Math.floor(getStepDelay() / 2)));
        if (store.getState().shouldStop) break;

        const curState = store.getState();
        const nextHomura = stepHomura(curState.homuraX, curState.homuraDir, curState.GRID_SIZE);
        store.setState({ homuraX: nextHomura.homuraX, homuraDir: nextHomura.homuraDir });
        updateGoalDisplay();
        setMessage(`ホムラも てくてく にげたよ！ (ホムラの ばしょ: ${nextHomura.homuraX}, ${curState.homuraY})`, 'homura');

        const targetTotal = store.getState().toys.filter(t => !t.isTrap).length;
        const goalResult = checkGoalReached({
          mode: store.getState().currentMode,
          x: store.getState().x,
          y: store.getState().y,
          goalX: store.getState().goalX,
          goalY: store.getState().goalY,
          homuraX: store.getState().homuraX,
          homuraY: store.getState().homuraY,
          collectedToysCount: store.getState().collectedToys.length,
          targetToysCount: targetTotal,
          hasTrap: store.getState().collectedTraps.length > 0
        });

        if (goalResult.isAtGoal) {
          if (goalResult.reason === 'trap') {
            setMessage('トキ「トイレットペーパーで イタズラしちゃダメニャ〜！🧻💦 エビのぬいぐるみを もってきてね！」', 'toki');
          } else if (goalResult.reason === 'missing_toys') {
            const remaining = targetTotal - store.getState().collectedToys.length;
            setMessage(`トキ「ぬいぐるみが まだ たりないニャ〜！(あと ${remaining}こ) あつめてきてね！」`, 'toki');
          } else if (goalResult.isSuccess) {
            isSuccess = true;
            onGoalReached(workspace);
            break;
          }
        }
      }

      await sleep(getStepDelay());
    }
  }

  await executeCommandList(commands);

  if (workspace) {
    workspace.highlightBlock(null);
  }

  if (!isSuccess && !store.getState().shouldStop) {
    setPlayerMood('sad');
    const curState = store.getState();
    const isAtGoal = isToyMode
      ? (curState.x === curState.goalX && curState.y === curState.goalY)
      : (curState.x === curState.homuraX && curState.y === curState.homuraY);

    const targetTotal = curState.toys.filter(t => !t.isTrap).length;
    const hasTrap = curState.collectedTraps.length > 0;

    if (isToyMode && hasTrap) {
      if (isAtGoal) {
        setMessage('トキ「トイレットペーパーで イタズラしちゃダメニャ〜！🧻💦 「リセット」をおして やりなおしてね！」', 'toki');
      } else {
        setMessage('トイレットペーパーを ひろっちゃったよ…！🧻💦 「リセット」をおして やりなおしてね！', 'sad');
      }
    } else if (isToyMode && curState.collectedToys.length < targetTotal) {
      const remaining = targetTotal - curState.collectedToys.length;
      if (isAtGoal) {
        setMessage(`トキ「ぬいぐるみが まだ たりないニャ〜！(あと ${remaining}こ) 「リセット」をおして やりなおしてね！」`, 'toki');
      } else {
        setMessage(`ぬいぐるみを ぜんぶ あつめられなかったよ…！(あと ${remaining}こ) 「リセット」をおして やりなおしてね！`, 'sad');
      }
    } else {
      const failMsg = isToyMode
        ? 'トキのところへ たどりつけなかったよ…！(＞＜) 「リセット」をおして やりなおしてね！'
        : 'ホムラをつかまえられなかったよ…！(＞＜) 「リセット」をおして やりなおしてね！';
      setMessage(failMsg, 'sad');
    }
  }

  if (!store.getState().shouldStop && elements.runBtn) {
    elements.runBtn.disabled = true;
  }
  store.setState({ isRunning: false });
}
