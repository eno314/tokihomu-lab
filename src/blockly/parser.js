/**
 * tokihomu-lab Blockly ワークスペース解析・コマンド抽出パーサー
 */

/**
 * Blocklyワークスペースから実行コマンドのシーケンス（AST）を抽出
 * @param {Object} workspace
 * @returns {Array<Object>}
 */
export function getCommandsFromWorkspace(workspace) {
  if (!workspace || typeof workspace.getTopBlocks !== 'function') return [];

  const topBlocks = workspace.getTopBlocks(true);
  if (topBlocks.length === 0) return [];

  const commands = [];

  function traverse(block, targetList) {
    let current = block;
    while (current) {
      if (current.type === 'toki_move') {
        targetList.push({ type: 'MOVE', blockId: current.id });
      } else if (current.type === 'toki_turn_right') {
        targetList.push({ type: 'TURN_RIGHT', blockId: current.id });
      } else if (current.type === 'toki_turn_left') {
        targetList.push({ type: 'TURN_LEFT', blockId: current.id });
      } else if (current.type === 'toki_pickup') {
        targetList.push({ type: 'PICKUP', blockId: current.id });
      } else if (current.type === 'toki_if') {
        const item = (typeof current.getFieldValue === 'function' ? current.getFieldValue('ITEM') : null) || '🦐';
        const branchBlock = typeof current.getInputTargetBlock === 'function' ? current.getInputTargetBlock('DO') : null;
        const branchCommands = [];
        if (branchBlock) {
          traverse(branchBlock, branchCommands);
        }
        targetList.push({
          type: 'IF',
          conditionItem: item,
          branch: branchCommands,
          blockId: current.id
        });
      } else if (current.type === 'toki_repeat') {
        const times = parseInt(typeof current.getFieldValue === 'function' ? current.getFieldValue('TIMES') : '1', 10) || 1;
        const branchBlock = typeof current.getInputTargetBlock === 'function' ? current.getInputTargetBlock('DO') : null;
        for (let i = 0; i < times; i++) {
          if (branchBlock) {
            traverse(branchBlock, targetList);
          }
        }
      } else if (current.type === 'sort_if') {
        const branchBlock = typeof current.getInputTargetBlock === 'function' ? current.getInputTargetBlock('DO') : null;
        const branchCommands = [];
        if (branchBlock) {
          traverse(branchBlock, branchCommands);
        }
        targetList.push({
          type: 'SORT_IF',
          branch: branchCommands,
          blockId: current.id
        });
      } else if (current.type === 'sort_swap') {
        targetList.push({ type: 'SORT_SWAP', blockId: current.id });
      } else if (current.type === 'sort_compare_swap') {
        targetList.push({
          type: 'SORT_IF',
          branch: [{ type: 'SORT_SWAP', blockId: current.id }],
          blockId: current.id
        });
      } else if (current.type === 'sort_step_next') {
        targetList.push({ type: 'SORT_STEP_NEXT', blockId: current.id });
      } else if (current.type === 'sort_reset_pointer') {
        targetList.push({ type: 'SORT_RESET_POINTER', blockId: current.id });
      }

      current = typeof current.getNextBlock === 'function' ? current.getNextBlock() : null;
    }
  }

  traverse(topBlocks[0], commands);
  return commands;
}

/**
 * 実行されたプログラム（最上位ブロックスレッド）のブロック総数をカウント
 * @param {Object} workspace
 * @returns {number}
 */
export function countProgramBlocks(workspace) {
  if (!workspace || typeof workspace.getTopBlocks !== 'function') return 0;

  const topBlocks = workspace.getTopBlocks(true);
  if (topBlocks.length === 0) return 0;

  let count = 0;

  function traverse(block) {
    let current = block;
    while (current) {
      count++;
      if (typeof current.getInputTargetBlock === 'function') {
        const branchBlock = current.getInputTargetBlock('DO');
        if (branchBlock) {
          traverse(branchBlock);
        }
      }
      current = typeof current.getNextBlock === 'function' ? current.getNextBlock() : null;
    }
  }

  traverse(topBlocks[0]);
  return count;
}
