/**
 * tokihomu-lab Blocklyカスタムブロック定義および初期化
 */

import { elements } from '../ui/dom.js';
import { store } from '../state/store.js';

/**
 * Blocklyカスタムブロックの登録
 */
export function registerCustomBlocks() {
  if (typeof Blockly === 'undefined') return;

  // --- まえに すすむ ---
  Blockly.Blocks['toki_move'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('まえに 1マス すすむ 🐾');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ff9800');
      this.setTooltip('むいているほうこうへ 1マス まえにすすみます');
    }
  };

  // --- みぎを むく ---
  Blockly.Blocks['toki_turn_right'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('みぎを むく ↷');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196f3');
      this.setTooltip('みぎがわ（とけいまわり）に むきをかえます');
    }
  };

  // --- ひだりを むく ---
  Blockly.Blocks['toki_turn_left'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('ひだりを むく ↶');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#00bcd4');
      this.setTooltip('ひだりがわ（はんとけいまわり）に むきをかえます');
    }
  };

  // --- ぬいぐるみを ひろう ---
  Blockly.Blocks['toki_pickup'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('ぬいぐるみを ひろう 🐾');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e91e63');
      this.setTooltip('いまいるマスの ぬいぐるみを ひろいます');
    }
  };

  // --- くりかえす ---
  Blockly.Blocks['toki_repeat'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['2', '2'],
          ['3', '3'],
          ['4', '4'],
          ['5', '5'],
          ['6', '6'],
          ['7', '7'],
          ['8', '8']
        ]), 'TIMES')
        .appendField('かい くりかえす 🔁');
      this.appendStatementInput('DO')
        .appendField('これをする');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4caf50');
      this.setTooltip('なかのブロックを していしたかいすう くりかえします');
    }
  };

  // --- もし〜なら ---
  Blockly.Blocks['toki_if'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('もし あしもとが')
        .appendField(new Blockly.FieldDropdown([
          ['🦐 エビ', '🦐'],
          ['🎾 ボール', '🎾'],
          ['🧻 かみ', '🧻']
        ]), 'ITEM')
        .appendField('なら');
      this.appendStatementInput('DO')
        .appendField('これをする');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ab47bc');
      this.setTooltip('あしもとにあるものが していしたものなら、なかのブロックをじっこうします');
    }
  };

  // --- もし ひだり ＞ みぎ なら (ソート用) ---
  Blockly.Blocks['sort_if'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('もし [ ひだり ＞ みぎ ] なら');
      this.appendStatementInput('DO')
        .appendField('これをする');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ab47bc');
      this.setTooltip('ひだりのねこが みぎのねこより おおきいときに、なかのブロックをじっこうします');
    }
  };

  // --- いれかえる (ソート用) ---
  Blockly.Blocks['sort_swap'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('いれかえる 🔄');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e91e63');
      this.setTooltip('くらべている 2ひきの ねこの ばしょを いれかえます');
    }
  };

  // --- もし ひだり ＞ みぎ なら いれかえる (旧互換用) ---
  Blockly.Blocks['sort_compare_swap'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('もし [ ひだり ＞ みぎ ] なら いれかえる 🔄');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e91e63');
      this.setTooltip('ひだりのねこが みぎのねこより おおきければ、ばしょを いれかえます');
    }
  };

  // --- つぎの ペアへ すすむ (ソート用) ---
  Blockly.Blocks['sort_step_next'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('つぎの ペアへ すすむ ➡️');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ff9800');
      this.setTooltip('くらべる ペアを みぎに 1つ ずらします');
    }
  };

  // --- さいしょに もどる (ソート用) ---
  Blockly.Blocks['sort_reset_pointer'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('さいしょに もどる ⏪');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196f3');
      this.setTooltip('くらべる ペアを いちばんひだり（1ばんめと 2ばんめ）に もどします');
    }
  };
}

/**
 * 初期配置ブロックのセットアップ
 * @param {Object} workspace
 * @param {string} [mode]
 */
export function setupInitialBlocks(workspace, mode = store.getState().currentMode) {
  if (!workspace) return;
  workspace.clear();

  let initialXml = '';
  if (mode === 'sort') {
    initialXml = `
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="sort_swap" x="30" y="30">
          <next>
            <block type="sort_step_next">
              <next>
                <block type="sort_reset_pointer"></block>
              </next>
            </block>
          </next>
        </block>
      </xml>
    `;
  } else {
    initialXml = `
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="toki_move" x="30" y="30">
          <next>
            <block type="toki_move"></block>
          </next>
        </block>
      </xml>
    `;
  }
  try {
    const dom = Blockly.utils.xml.textToDom(initialXml);
    Blockly.Xml.domToWorkspace(dom, workspace);
  } catch (e) {
    console.warn('初期ブロックの読み込みをスキップしました:', e);
  }
}

/**
 * ツールボックスの更新
 * @param {Object} workspace
 */
export function updateToolboxForCurrentState(workspace) {
  if (!workspace || typeof workspace.updateToolbox !== 'function') return;
  const state = store.getState();

  let toolboxId = 'toolbox';
  if (state.currentMode === 'toy') {
    toolboxId = 'toolbox-toy';
  } else if (state.currentMode === 'sort') {
    toolboxId = state.currentLevel === 1 ? 'toolbox-sort-lv1' : 'toolbox-sort-lv2';
  }

  const toolboxEl = document.getElementById(toolboxId) || document.getElementById('toolbox-sort');
  if (toolboxEl) {
    workspace.updateToolbox(toolboxEl);
  }
}
