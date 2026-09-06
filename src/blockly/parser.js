/**
 * tokihomu-lab Blockly ワークスペース解析・コマンド抽出パーサー
 */

function extractBranchCommands(block, traverseFn) {
  if (!block || typeof block.getInputTargetBlock !== 'function') return [];
  const branchBlock = block.getInputTargetBlock('DO');
  if (!branchBlock) return [];
  const branchCommands = [];
  traverseFn(branchBlock, branchCommands);
  return branchCommands;
}

const BLOCK_PARSERS = {
  toki_move: (block) => [{ type: 'MOVE', blockId: block.id }],
  toki_turn_right: (block) => [{ type: 'TURN_RIGHT', blockId: block.id }],
  toki_turn_left: (block) => [{ type: 'TURN_LEFT', blockId: block.id }],
  toki_pickup: (block) => [{ type: 'PICKUP', blockId: block.id }],
  toki_if: (block, traverseFn) => {
    const item = (typeof block.getFieldValue === 'function' ? block.getFieldValue('ITEM') : null) || '🦐';
    return [{
      type: 'IF',
      conditionItem: item,
      branch: extractBranchCommands(block, traverseFn),
      blockId: block.id
    }];
  },
  toki_repeat: (block, traverseFn) => {
    const times = parseInt(typeof block.getFieldValue === 'function' ? block.getFieldValue('TIMES') : '1', 10) || 1;
    const branchCommands = extractBranchCommands(block, traverseFn);
    const repeated = [];
    for (let i = 0; i < times; i++) {
      repeated.push(...branchCommands);
    }
    return repeated;
  },
  sort_if: (block, traverseFn) => [{
    type: 'SORT_IF',
    branch: extractBranchCommands(block, traverseFn),
    blockId: block.id
  }],
  sort_swap: (block) => [{ type: 'SORT_SWAP', blockId: block.id }],
  sort_compare_swap: (block) => [{
    type: 'SORT_IF',
    branch: [{ type: 'SORT_SWAP', blockId: block.id }],
    blockId: block.id
  }],
  sort_step_next: (block) => [{ type: 'SORT_STEP_NEXT', blockId: block.id }],
  sort_reset_pointer: (block) => [{ type: 'SORT_RESET_POINTER', blockId: block.id }]
};

function traverseBlockChain(startBlock, targetList) {
  let current = startBlock;
  while (current) {
    const parser = BLOCK_PARSERS[current.type];
    if (parser) {
      targetList.push(...parser(current, traverseBlockChain));
    }
    current = typeof current.getNextBlock === 'function' ? current.getNextBlock() : null;
  }
}

export function getCommandsFromWorkspace(workspace) {
  if (!workspace || typeof workspace.getTopBlocks !== 'function') return [];
  const topBlocks = workspace.getTopBlocks(true);
  if (topBlocks.length === 0) return [];

  const commands = [];
  traverseBlockChain(topBlocks[0], commands);
  return commands;
}

function countBlocksInChain(startBlock) {
  let count = 0;
  let current = startBlock;
  while (current) {
    count++;
    if (typeof current.getInputTargetBlock === 'function') {
      const branchBlock = current.getInputTargetBlock('DO');
      if (branchBlock) {
        count += countBlocksInChain(branchBlock);
      }
    }
    current = typeof current.getNextBlock === 'function' ? current.getNextBlock() : null;
  }
  return count;
}

export function countProgramBlocks(workspace) {
  if (!workspace || typeof workspace.getTopBlocks !== 'function') return 0;
  const topBlocks = workspace.getTopBlocks(true);
  if (topBlocks.length === 0) return 0;
  return countBlocksInChain(topBlocks[0]);
}
