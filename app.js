/**
 * tokihomu-lab (ときほむラボ)
 * 子供向けプログラミング学習ゲーム コアスクリプト
 */

// レベルデータ定義: おにごっこモード (きほん)
const LEVELS_CHASE = [
  {
    id: 1,
    name: 'レベル 1',
    title: 'はじめての プログラミング',
    description: 'まっすぐ すすんで ホムラをつかまえよう！（おにごっこ）',
    gridSize: 5,
    startX: 0,
    startY: 0,
    startDirection: 1, // 0:上, 1:右, 2:下, 3:左
    startRotation: 90,
    goalX: 4,
    goalY: 4,
    obstacles: [],
    toys: [],
    startMessage: '「うごかす！」ボタンをおすと、トキがうごきだすよ！',
    minBlocks: 5
  },
  {
    id: 2,
    name: 'レベル 2',
    title: 'ダンボールを よけよう！',
    description: 'みちに ダンボールが あるよ！ まわって ホムラをつかまえよう！',
    gridSize: 5,
    startX: 0,
    startY: 0,
    startDirection: 1,
    startRotation: 90,
    goalX: 4,
    goalY: 4,
    obstacles: [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 3, y: 3 }
    ],
    toys: [],
    startMessage: 'ダンボールに ぶつからないように まわりみちをして ホムラをつかまえよう！',
    minBlocks: 8
  },
  {
    id: 3,
    name: 'レベル 3',
    title: 'にげるホムラをつかまえよう！',
    description: 'ホムラが てくてく にげているよ！ トキが めいれいを 1つ じっこうするたびに うごくよ！',
    gridSize: 5,
    startX: 0,
    startY: 0,
    startDirection: 1,
    startRotation: 90,
    goalX: 4,
    goalY: 4,
    movingGoal: true,
    homuraInitialDir: -1, // -1: 左, 1: 右
    obstacles: [],
    toys: [],
    startMessage: 'ホムラが トキのめいれい（すすむ・むく）ごとに にげるよ！ 左端についたら右へ、右端についたら左へおりかえすよ！',
    minBlocks: 3
  },
  {
    id: 4,
    name: 'レベル 4',
    title: 'ダンボールと おにごっこ',
    description: 'ダンボールを よけながら、にげる ホムラを つかまえよう！',
    gridSize: 5,
    startX: 0,
    startY: 0,
    startDirection: 1,
    startRotation: 90,
    goalX: 4,
    goalY: 4,
    movingGoal: true,
    homuraInitialDir: -1, // -1: 左, 1: 右
    obstacles: [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 3, y: 3 }
    ],
    toys: [],
    startMessage: 'ダンボールに ぶつからないように まわりみちをしながら、にげるホムラを つかまえよう！',
    minBlocks: 11
  }
];

// レベルデータ定義: おもちゃあつめモード (おうよう)
const LEVELS_TOY = [
  {
    id: 1,
    name: 'レベル 1',
    title: 'はじめての おもちゃあつめ',
    description: 'おもちゃを ひろってから、ホムラにあいにいこう！',
    gridSize: 5,
    startX: 0,
    startY: 0,
    startDirection: 1,
    startRotation: 90,
    goalX: 4,
    goalY: 0,
    obstacles: [],
    toys: [
      { id: 'toy-1', x: 2, y: 0, icon: '🧸', name: 'くまのぬいぐるみ' }
    ],
    startMessage: 'みちにおもちゃが あるよ！「ひろう」ブロックをつかって おもちゃを ひろってから ホムラのところへいこう！',
    minBlocks: 5
  },
  {
    id: 2,
    name: 'レベル 2',
    title: 'おもちゃを 2つ あつめよう！',
    description: 'ダンボールを よけながら、2つのおもちゃを あつめて ホムラにあいにいこう！',
    gridSize: 5,
    startX: 0,
    startY: 0,
    startDirection: 1,
    startRotation: 90,
    goalX: 4,
    goalY: 4,
    obstacles: [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 }
    ],
    toys: [
      { id: 'toy-1', x: 2, y: 0, icon: '🧸', name: 'くまのぬいぐるみ' },
      { id: 'toy-2', x: 2, y: 4, icon: '🧶', name: 'けいとだま' }
    ],
    startMessage: 'おもちゃが 2つ あるよ！ ダンボールをよけて ぜんぶひろってから ホムラに あいにいこう！',
    minBlocks: 11
  }
];

// 後方互換用エイリアス
const LEVELS = LEVELS_CHASE;

// ゲーム状態の管理
const GameState = {
  currentMode: 'chase', // 'chase' | 'toy'
  currentLevel: 1,
  GRID_SIZE: 5,
  startX: 0,
  startY: 0,
  goalX: 4,
  goalY: 4,
  obstacles: [],
  toys: [],
  collectedToys: [], // 収集済みtoyのid配列
  movingGoal: false,
  homuraX: 4,
  homuraY: 4,
  homuraDir: -1, // -1: 左, 1: 右

  // 現在のプレイヤー状態
  x: 0,
  y: 0,
  // 向き: 0 = 上 (↑), 1 = 右 (→), 2 = 下 (↓), 3 = 左 (←)
  direction: 1,
  totalRotation: 90, // スムーズな連続回転用の累積角度

  // 実行状態フラグ
  isRunning: false,
  shouldStop: false,

  // 現在のモードのレベル一覧を取得
  getCurrentLevels() {
    return this.currentMode === 'toy' ? LEVELS_TOY : LEVELS_CHASE;
  },

  // 現在のレベルデータを取得
  getCurrentLevelData() {
    const levels = this.getCurrentLevels();
    return levels.find(l => l.id === this.currentLevel) || levels[0];
  },

  // レベルの読み込み
  loadLevel(levelId, mode = this.currentMode) {
    this.currentMode = mode;
    const levels = this.getCurrentLevels();
    const level = levels.find(l => l.id === levelId) || levels[0];
    this.currentLevel = level.id;
    this.GRID_SIZE = level.gridSize;
    this.startX = level.startX;
    this.startY = level.startY;
    this.goalX = level.goalX;
    this.goalY = level.goalY;
    this.movingGoal = !!level.movingGoal;
    this.homuraInitialDir = level.homuraInitialDir || -1;
    this.homuraX = level.goalX;
    this.homuraY = level.goalY;
    this.homuraDir = this.homuraInitialDir;
    this.obstacles = [...(level.obstacles || [])];
    this.toys = (level.toys || []).map(t => ({ ...t }));
    this.direction = level.startDirection;
    this.totalRotation = level.startRotation;
    this.reset();
  },

  // 初期化・リセット
  reset() {
    const level = this.getCurrentLevelData();
    this.x = this.startX;
    this.y = this.startY;
    this.direction = level.startDirection;
    this.totalRotation = level.startRotation;
    this.homuraX = level.goalX;
    this.homuraY = level.goalY;
    this.homuraDir = level.homuraInitialDir || -1;
    this.toys = (level.toys || []).map(t => ({ ...t }));
    this.collectedToys = [];
    this.isRunning = false;
    this.shouldStop = false;
  }
};

// 白黒ハチワレ猫（タキシード猫）のSVGアイコン定数
const TOKI_SVG = `
<svg class="toki-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="18,44 8,10 42,22" fill="#263238" />
  <polygon points="82,44 92,10 58,22" fill="#263238" />
  <polygon points="20,38 14,17 38,24" fill="#ffab91" />
  <polygon points="80,38 86,17 62,24" fill="#ffab91" />
  <ellipse cx="50" cy="54" rx="38" ry="34" fill="#263238" />
  <!-- ハチワレの八の字模様（白毛） -->
  <path d="M 50,22 L 32,50 C 26,62 30,82 50,86 C 70,82 74,62 68,50 Z" fill="#ffffff" />
  <ellipse cx="40" cy="68" rx="14" ry="11" fill="#ffffff" />
  <ellipse cx="60" cy="68" rx="14" ry="11" fill="#ffffff" />
  <ellipse cx="33" cy="50" rx="7.5" ry="8" fill="#fbc02d" />
  <ellipse cx="33" cy="50" rx="5" ry="6" fill="#1a1a1a" />
  <circle cx="31" cy="47" r="2.2" fill="#ffffff" />
  <circle cx="34.5" cy="52.5" r="1" fill="#ffffff" />
  <ellipse cx="67" cy="50" rx="7.5" ry="8" fill="#fbc02d" />
  <ellipse cx="67" cy="50" rx="5" ry="6" fill="#1a1a1a" />
  <circle cx="65" cy="47" r="2.2" fill="#ffffff" />
  <circle cx="68.5" cy="52.5" r="1" fill="#ffffff" />
  <polygon points="46,60 54,60 50,64" fill="#ff8a80" />
  <path d="M 44,65 Q 47,69 50,65 Q 53,69 56,65" fill="none" stroke="#546e7a" stroke-width="2" stroke-linecap="round" />
  <line x1="26" y1="62" x2="6" y2="59" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="26" y1="68" x2="8" y2="72" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="74" y1="62" x2="94" y2="59" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="74" y1="68" x2="92" y2="72" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <path d="M 28,84 Q 50,92 72,84" fill="none" stroke="#e53935" stroke-width="4" stroke-linecap="round" />
  <circle cx="50" cy="89" r="4.5" fill="#fbc02d" stroke="#f57f17" stroke-width="1" />
</svg>
`;

const TOKI_SAD_SVG = `
<svg class="toki-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="18,44 8,10 42,22" fill="#263238" />
  <polygon points="82,44 92,10 58,22" fill="#263238" />
  <polygon points="20,38 14,17 38,24" fill="#ffab91" />
  <polygon points="80,38 86,17 62,24" fill="#ffab91" />
  <ellipse cx="50" cy="54" rx="38" ry="34" fill="#263238" />
  <!-- ハチワレの八の字模様（白毛） -->
  <path d="M 50,22 L 32,50 C 26,62 30,82 50,86 C 70,82 74,62 68,50 Z" fill="#ffffff" />
  <ellipse cx="40" cy="68" rx="14" ry="11" fill="#ffffff" />
  <ellipse cx="60" cy="68" rx="14" ry="11" fill="#ffffff" />
  <!-- ＞ ＜ の困り目 -->
  <path d="M 27,47 L 37,52 L 27,57" fill="none" stroke="#fbc02d" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 73,47 L 63,52 L 73,57" fill="none" stroke="#fbc02d" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  <!-- なみだのしずく -->
  <path d="M 22,63 Q 20,69 23,71 Q 26,71 25,67 Z" fill="#29b6f6" />
  <polygon points="46,60 54,60 50,64" fill="#ff8a80" />
  <path d="M 45,68 Q 50,63 55,68" fill="none" stroke="#546e7a" stroke-width="2" stroke-linecap="round" />
  <line x1="26" y1="62" x2="6" y2="59" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="26" y1="68" x2="8" y2="72" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="74" y1="62" x2="94" y2="59" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="74" y1="68" x2="92" y2="72" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <path d="M 28,84 Q 50,92 72,84" fill="none" stroke="#e53935" stroke-width="4" stroke-linecap="round" />
  <circle cx="50" cy="89" r="4.5" fill="#fbc02d" stroke="#f57f17" stroke-width="1" />
</svg>
`;

const TOKI_HAPPY_SVG = `
<svg class="toki-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="18,44 8,10 42,22" fill="#263238" />
  <polygon points="82,44 92,10 58,22" fill="#263238" />
  <polygon points="20,38 14,17 38,24" fill="#ffab91" />
  <polygon points="80,38 86,17 62,24" fill="#ffab91" />
  <ellipse cx="50" cy="54" rx="38" ry="34" fill="#263238" />
  <!-- ハチワレの八の字模様（白毛） -->
  <path d="M 50,22 L 32,50 C 26,62 30,82 50,86 C 70,82 74,62 68,50 Z" fill="#ffffff" />
  <ellipse cx="40" cy="68" rx="14" ry="11" fill="#ffffff" />
  <ellipse cx="60" cy="68" rx="14" ry="11" fill="#ffffff" />
  <!-- にっこり目 (⌒ ⌒) -->
  <path d="M 27,52 Q 33,43 39,52" fill="none" stroke="#263238" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 61,52 Q 67,43 73,52" fill="none" stroke="#263238" stroke-width="3.5" stroke-linecap="round" />
  <!-- ほんのりほっぺ -->
  <circle cx="27" cy="59" r="4" fill="#ff8a80" opacity="0.6" />
  <circle cx="73" cy="59" r="4" fill="#ff8a80" opacity="0.6" />
  <polygon points="46,60 54,60 50,64" fill="#ff8a80" />
  <path d="M 44,65 Q 47,70 50,65 Q 53,70 56,65" fill="none" stroke="#546e7a" stroke-width="2" stroke-linecap="round" />
  <line x1="26" y1="62" x2="6" y2="59" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="26" y1="68" x2="8" y2="72" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="74" y1="62" x2="94" y2="59" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="74" y1="68" x2="92" y2="72" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <path d="M 28,84 Q 50,92 72,84" fill="none" stroke="#e53935" stroke-width="4" stroke-linecap="round" />
  <circle cx="50" cy="89" r="4.5" fill="#fbc02d" stroke="#f57f17" stroke-width="1" />
</svg>
`;

// クリーム色の長毛猫「ホムラ」のSVGアイコン定数
const HOMURA_SVG = `
<svg class="homura-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- ふわふわファー（襟巻き・長毛の毛並み） -->
  <path d="M 18,70 C 8,76 12,88 24,86 C 20,93 32,95 42,91 C 48,96 56,96 62,91 C 70,95 82,92 78,85 C 88,86 92,76 82,70 C 90,62 82,52 82,52 C 90,42 78,34 78,34 C 84,22 70,16 62,24 C 52,16 42,20 40,24 C 32,16 18,22 24,34 C 12,40 20,52 20,52 C 10,60 18,70 18,70 Z" fill="#ffe082" />
  <!-- ふわふわ耳（外側・クリームベージュ） -->
  <polygon points="22,42 12,12 40,24" fill="#ffca28" />
  <polygon points="78,42 88,12 60,24" fill="#ffca28" />
  <!-- 耳（内側・やわらかピンク） -->
  <polygon points="24,36 18,18 36,25" fill="#ffccbc" />
  <polygon points="76,36 82,18 64,25" fill="#ffccbc" />
  <!-- 長毛特有のふさふさ飾り耳毛（淡いクリーム） -->
  <path d="M 18,28 Q 28,24 32,32 Q 22,34 18,28 Z" fill="#fffde7" />
  <path d="M 82,28 Q 72,24 68,32 Q 78,34 82,28 Z" fill="#fffde7" />
  <!-- 顔ベース（やわらかいクリームミルク色） -->
  <ellipse cx="50" cy="54" rx="36" ry="31" fill="#fff8e1" />
  <!-- ほっぺのふんわり飾り毛 -->
  <path d="M 16,56 C 10,62 16,72 26,70 C 18,76 26,82 34,78" fill="#ffe082" opacity="0.6" />
  <path d="M 84,56 C 90,62 84,72 74,70 C 82,76 74,82 66,78" fill="#ffe082" opacity="0.6" />
  <!-- 額のふんわり模様（淡いミルクティー色） -->
  <path d="M 38,28 Q 50,38 62,28 Q 50,33 38,28 Z" fill="#ffe082" />
  <ellipse cx="50" cy="36" rx="4" ry="7" fill="#ffe082" opacity="0.7" />
  <!-- 澄んだアクアブルーの瞳 -->
  <ellipse cx="34" cy="50" rx="7.5" ry="8" fill="#4fc3f7" />
  <ellipse cx="34" cy="50" rx="5" ry="6" fill="#01579b" />
  <circle cx="32" cy="47" r="2.2" fill="#ffffff" />
  <circle cx="35.5" cy="52.5" r="1" fill="#ffffff" />
  <ellipse cx="66" cy="50" rx="7.5" ry="8" fill="#4fc3f7" />
  <ellipse cx="66" cy="50" rx="5" ry="6" fill="#01579b" />
  <circle cx="64" cy="47" r="2.2" fill="#ffffff" />
  <circle cx="67.5" cy="52.5" r="1" fill="#ffffff" />
  <!-- ほんのりピンクのほっぺ -->
  <circle cx="26" cy="58" r="5" fill="#ffab91" opacity="0.5" />
  <circle cx="74" cy="58" r="5" fill="#ffab91" opacity="0.5" />
  <!-- 鼻（ピンク） -->
  <polygon points="47,59 53,59 50,63" fill="#ff8a80" />
  <!-- 口（ω） -->
  <path d="M 45,64 Q 47.5,68 50,64 Q 52.5,68 55,64" fill="none" stroke="#8d6e63" stroke-width="1.8" stroke-linecap="round" />
  <!-- ふわふわヒゲ（左右） -->
  <line x1="28" y1="62" x2="10" y2="60" stroke="#bcaaa4" stroke-width="1.5" stroke-linecap="round" />
  <line x1="28" y1="67" x2="12" y2="71" stroke="#bcaaa4" stroke-width="1.5" stroke-linecap="round" />
  <line x1="72" y1="62" x2="90" y2="60" stroke="#bcaaa4" stroke-width="1.5" stroke-linecap="round" />
  <line x1="72" y1="67" x2="88" y2="71" stroke="#bcaaa4" stroke-width="1.5" stroke-linecap="round" />
  <!-- 水色の首輪リボン -->
  <path d="M 32,82 Q 50,89 68,82" fill="none" stroke="#29b6f6" stroke-width="3.5" stroke-linecap="round" />
  <circle cx="50" cy="86" r="4" fill="#0288d1" />
</svg>
`;

// DOM要素の参照
const elements = {
  gridBoard: document.getElementById('grid-board'),
  toki: document.getElementById('toki-character'),
  tokiInner: document.querySelector('.character-inner'),
  runBtn: document.getElementById('run-btn'),
  resetBtn: document.getElementById('reset-btn'),
  speedSelect: document.getElementById('speed-select'),
  statusMessage: document.getElementById('status-message'),
  speakerAvatar: document.querySelector('.speaker-avatar'),
  victoryModal: document.getElementById('victory-modal'),
  victoryTitle: document.getElementById('victory-title'),
  victoryDesc: document.getElementById('victory-desc'),
  victoryEvaluation: document.getElementById('victory-evaluation'),
  modalCatsContainer: document.getElementById('modal-cats-container'),
  modalNextBtn: document.getElementById('modal-next-btn'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  legendObstacle: document.getElementById('legend-obstacle'),
  legendToy: document.getElementById('legend-toy'),
  toyCounter: document.getElementById('toy-counter'),
  toyCounterText: document.getElementById('toy-counter-text'),
  levelButtonsContainer: document.getElementById('level-buttons'),
  levelButtons: document.querySelectorAll('.level-btn'),
  modeTabs: document.querySelectorAll('.mode-tab'),
  blocklyDiv: document.getElementById('blocklyDiv')
};

let workspace = null;

/**
 * 1. Blockly の初期化とカスタムブロック定義
 */
function initBlockly() {
  if (typeof Blockly === 'undefined') {
    console.error('Blockly が読み込まれていません。CDN接続を確認してください。');
    setMessage('Blocklyの読み込みにしっぱいしました。ネット接続をかくにんしてね。');
    return;
  }

  // --- カスタムブロック: まえに すすむ ---
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

  // --- カスタムブロック: みぎを むく ---
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

  // --- カスタムブロック: ひだりを むく ---
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

  // --- カスタムブロック: おもちゃを ひろう ---
  Blockly.Blocks['toki_pickup'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('おもちゃを ひろう 🐾');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e91e63');
      this.setTooltip('いまいるマスの おもちゃを ひろいます');
    }
  };

  // --- カスタムブロック: くりかえす ---
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

  // ワークスペースの注入
  const toolboxXml = document.getElementById('toolbox');
  workspace = Blockly.inject(elements.blocklyDiv, {
    toolbox: toolboxXml,
    trashcan: true,
    scrollbars: true,
    sounds: false,
    zoom: {
      controls: true,
      wheel: false,
      startScale: 1.1,
      maxScale: 1.5,
      minScale: 0.7,
      scaleSpeed: 1.1
    },
    grid: {
      spacing: 24,
      length: 2,
      colour: '#e0e0e0',
      snap: true
    }
  });

  // 初期ブロック（例としてサンプルブロックを少し配置）
  setupInitialBlocks();

  // ウィンドウリサイズ対応
  window.addEventListener('resize', onResize);
  setTimeout(onResize, 100);
}

/**
 * 初期配置サンプルブロックの登録
 */
function setupInitialBlocks() {
  const initialXml = `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <block type="toki_move" x="30" y="30">
        <next>
          <block type="toki_move"></block>
        </next>
      </block>
    </xml>
  `;
  try {
    const dom = Blockly.utils.xml.textToDom(initialXml);
    Blockly.Xml.domToWorkspace(dom, workspace);
  } catch (e) {
    console.warn('初期ブロックの読み込みをスキップしました:', e);
  }
}

/**
 * ワークスペースのリサイズ処理
 */
function onResize() {
  if (workspace) {
    Blockly.svgResize(workspace);
  }
  updateTokiPosition(false);
}

/**
 * 2. 5×5 グリッド盤面の描画
 */
function createGridBoard() {
  elements.gridBoard.innerHTML = '';
  for (let y = 0; y < GameState.GRID_SIZE; y++) {
    for (let x = 0; x < GameState.GRID_SIZE; x++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.classList.add((x + y) % 2 === 0 ? 'cell-even' : 'cell-odd');
      cell.dataset.x = x;
      cell.dataset.y = y;

      // スタート地点 (0, 0)
      if (x === GameState.startX && y === GameState.startY) {
        cell.classList.add('start-cell');
        const startLabel = document.createElement('span');
        startLabel.className = 'start-indicator';
        startLabel.textContent = 'スタート';
        cell.appendChild(startLabel);
      }

      // 障害物セル（ダンボール箱）
      const isObstacle = GameState.obstacles.some(obs => obs.x === x && obs.y === y);
      if (isObstacle) {
        cell.classList.add('obstacle-cell');
        const obstacleItem = document.createElement('div');
        obstacleItem.className = 'obstacle-item';
        obstacleItem.innerHTML = `
          <span>📦</span>
          <span class="obstacle-label">ダンボール</span>
        `;
        cell.appendChild(obstacleItem);
      }

      // おもちゃセル
      const toy = GameState.toys.find(t => t.x === x && t.y === y && !GameState.collectedToys.includes(t.id));
      if (toy) {
        cell.classList.add('toy-cell');
        const toyItem = document.createElement('div');
        toyItem.className = 'toy-item';
        toyItem.dataset.toyId = toy.id;
        toyItem.innerHTML = `
          <span>${toy.icon || '🧸'}</span>
          <span class="toy-label">おもちゃ</span>
        `;
        cell.appendChild(toyItem);
      }

      elements.gridBoard.appendChild(cell);
    }
  }

  // ゴール（ホムラ）の描画
  updateGoalDisplay();

  // 凡例の障害物表示切り替え
  if (elements.legendObstacle) {
    elements.legendObstacle.style.display = GameState.obstacles.length > 0 ? 'inline-flex' : 'none';
  }

  // おもちゃカウンターと凡例の表示更新
  updateToyCounterDisplay();

  updateTokiPosition(false);
}

/**
 * おもちゃカウンターと凡例の表示更新
 */
function updateToyCounterDisplay() {
  const total = GameState.toys.length;
  const isToyMode = GameState.currentMode === 'toy' && total > 0;

  if (elements.toyCounter) {
    elements.toyCounter.style.display = isToyMode ? 'inline-flex' : 'none';
    if (elements.toyCounterText) {
      elements.toyCounterText.textContent = `${GameState.collectedToys.length} / ${total}`;
    }
  }

  if (elements.legendToy) {
    elements.legendToy.style.display = isToyMode ? 'inline-flex' : 'none';
  }
}

/**
 * 指定座標のおもちゃを回収
 */
function pickupToyAt(x, y) {
  const toyIndex = GameState.toys.findIndex(
    t => t.x === x && t.y === y && !GameState.collectedToys.includes(t.id)
  );
  if (toyIndex === -1) {
    return null; // おもちゃがない
  }

  const toy = GameState.toys[toyIndex];
  GameState.collectedToys.push(toy.id);

  // 盤面セルの見た目を更新
  const cell = elements.gridBoard.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
  if (cell) {
    cell.classList.remove('toy-cell');
    const toyItem = cell.querySelector('.toy-item');
    if (toyItem) toyItem.remove();
  }

  // カウンターの表示更新とポップアニメーション
  updateToyCounterDisplay();
  if (elements.toyCounter) {
    elements.toyCounter.classList.remove('bounce');
    void elements.toyCounter.offsetWidth; // リフロー発生
    elements.toyCounter.classList.add('bounce');
  }

  return toy;
}

/**
 * ゴール（ホムラ）の盤面表示更新
 */
function updateGoalDisplay() {
  // 全セルからゴール表示をクリア
  const allCells = elements.gridBoard.querySelectorAll('.grid-cell');
  allCells.forEach(cell => {
    cell.classList.remove('goal-cell');
    const indicator = cell.querySelector('.goal-indicator');
    if (indicator) indicator.remove();
    const items = cell.querySelector('.goal-items');
    if (items) items.remove();
  });

  // 現在のホムラ座標のセルを取得
  const targetCell = elements.gridBoard.querySelector(
    `.grid-cell[data-x="${GameState.homuraX}"][data-y="${GameState.homuraY}"]`
  );

  if (targetCell) {
    targetCell.classList.add('goal-cell');

    const goalLabel = document.createElement('span');
    goalLabel.className = 'goal-indicator';
    goalLabel.textContent = 'ゴール';
    targetCell.appendChild(goalLabel);

    const goalItems = document.createElement('div');
    goalItems.className = 'goal-items';
    // 向きに応じてホムラの向きを反映（1: 右向きなら反転、-1: 左向きなら通常）
    const flipStyle = GameState.homuraDir === 1 ? 'transform: scaleX(-1);' : '';
    goalItems.innerHTML = `
      <div class="homura-avatar" style="${flipStyle}">
        ${HOMURA_SVG}
      </div>
    `;
    targetCell.appendChild(goalItems);
  }
}

/**
 * ホムラの移動ロジック（レベル3用）
 * トキが1歩動くたびにホムラが移動
 * 左端に来たら右に移動するようになり、右端に来たら左に移動するようになる
 */
function moveHomura() {
  if (!GameState.movingGoal) return;

  GameState.homuraX += GameState.homuraDir;

  // 端に来たら進行方向を切り替え
  if (GameState.homuraX <= 0) {
    GameState.homuraX = 0;
    GameState.homuraDir = 1; // 右に移動するようになる
  } else if (GameState.homuraX >= GameState.GRID_SIZE - 1) {
    GameState.homuraX = GameState.GRID_SIZE - 1;
    GameState.homuraDir = -1; // 左に移動するようになる
  }

  updateGoalDisplay();
}

/**
 * トキの画面位置・向きの更新
 */
function updateTokiPosition(animate = true) {
  const cellSize = elements.gridBoard.clientWidth / GameState.GRID_SIZE;
  if (!cellSize) return;

  const posX = GameState.x * cellSize;
  const posY = GameState.y * cellSize;

  elements.toki.style.setProperty('--current-x', `${posX}px`);
  elements.toki.style.setProperty('--current-y', `${posY}px`);
  elements.toki.style.setProperty('--current-rot', `${GameState.totalRotation}deg`);

  if (!animate) {
    elements.toki.style.transition = 'none';
  } else {
    elements.toki.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }

  elements.toki.style.transform = `translate(${posX}px, ${posY}px) rotate(${GameState.totalRotation}deg)`;
}

/**
 * トキの表情・状態の更新
 * mood: 'normal' | 'sad' | 'happy'
 */
function setTokiMood(mood = 'normal') {
  if (!elements.tokiInner) return;
  if (mood === 'sad') {
    elements.tokiInner.innerHTML = TOKI_SAD_SVG;
  } else if (mood === 'happy') {
    elements.tokiInner.innerHTML = TOKI_HAPPY_SVG;
  } else {
    elements.tokiInner.innerHTML = TOKI_SVG;
  }
}

/**
 * 吹き出しメッセージの更新
 */
function setMessage(text, speaker = 'toki') {
  elements.statusMessage.textContent = text;
  if (!elements.speakerAvatar) return;

  if (speaker === 'toki' || speaker === '🐱' || speaker === 'normal') {
    elements.speakerAvatar.innerHTML = TOKI_SVG;
  } else if (speaker === 'sad' || speaker === '😿') {
    elements.speakerAvatar.innerHTML = TOKI_SAD_SVG;
  } else if (speaker === 'happy' || speaker === '😸') {
    elements.speakerAvatar.innerHTML = TOKI_HAPPY_SVG;
  } else if (speaker === 'homura' || speaker === '🐈') {
    elements.speakerAvatar.innerHTML = HOMURA_SVG;
  } else {
    elements.speakerAvatar.textContent = speaker;
  }
}

/**
 * 3. コマンド抽出パーサー
 * Blocklyワークスペースから実行コマンドのシーケンスを抽出
 */
function getCommandsFromWorkspace() {
  if (!workspace) return [];

  const topBlocks = workspace.getTopBlocks(true);
  if (topBlocks.length === 0) return [];

  // 最も上にあるトップブロックから順に取得
  const commands = [];

  function traverse(block) {
    let current = block;
    while (current) {
      if (current.type === 'toki_move') {
        commands.push({ type: 'MOVE', blockId: current.id });
      } else if (current.type === 'toki_turn_right') {
        commands.push({ type: 'TURN_RIGHT', blockId: current.id });
      } else if (current.type === 'toki_turn_left') {
        commands.push({ type: 'TURN_LEFT', blockId: current.id });
      } else if (current.type === 'toki_pickup') {
        commands.push({ type: 'PICKUP', blockId: current.id });
      } else if (current.type === 'toki_repeat') {
        const times = parseInt(current.getFieldValue('TIMES'), 10) || 1;
        const branchBlock = current.getInputTargetBlock('DO');
        for (let i = 0; i < times; i++) {
          if (branchBlock) {
            traverse(branchBlock);
          }
        }
      }
      current = current.getNextBlock();
    }
  }

  // 1番目（最上位）のトップブロックを実行対象とする
  traverse(topBlocks[0]);
  return commands;
}

/**
 * 実行されたプログラム（最上位ブロックスレッド）のブロック総数をカウント
 */
function countProgramBlocks() {
  if (!workspace) return 0;

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
      current = current.getNextBlock();
    }
  }

  traverse(topBlocks[0]);
  return count;
}

/**
 * 指定ミリ秒スリープ
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 4. コマンド実行エンジン
 */
async function runProgram() {
  if (GameState.isRunning || elements.runBtn.disabled) return;

  const commands = getCommandsFromWorkspace();
  if (commands.length === 0) {
    setMessage('ブロックが つながっていないよ！ブロックをならべてみてね。', '🐾');
    return;
  }

  // 実行状態へ移行
  GameState.isRunning = true;
  GameState.shouldStop = false;
  elements.runBtn.disabled = true;
  setTokiMood('normal');
  elements.toki.classList.remove('victory-jump', 'shake-animation');
  setMessage('出発進行！にゃ〜ん！🐾', 'toki');

  const getStepDelay = () => parseInt(elements.speedSelect.value, 10) || 450;
  let isSuccess = false;

  for (let i = 0; i < commands.length; i++) {
    if (GameState.shouldStop) break;

    const cmd = commands[i];

    // 実行中ブロックのハイライト
    if (workspace && cmd.blockId) {
      workspace.highlightBlock(cmd.blockId);
    }

    let actionExecuted = false;

    if (cmd.type === 'MOVE') {
      // 向きに応じた移動ベクトル
      // 0: 上, 1: 右, 2: 下, 3: 左
      let nextX = GameState.x;
      let nextY = GameState.y;

      if (GameState.direction === 0) nextY -= 1;
      else if (GameState.direction === 1) nextX += 1;
      else if (GameState.direction === 2) nextY += 1;
      else if (GameState.direction === 3) nextX -= 1;

      // 壁衝突判定
      if (nextX < 0 || nextX >= GameState.GRID_SIZE || nextY < 0 || nextY >= GameState.GRID_SIZE) {
        // 壁に衝突！
        setTokiMood('sad');
        setMessage('いたいっ！ かべに ぶつかっちゃった！(＞＜) 「リセット」をおして やりなおしてね！', 'sad');
        elements.toki.classList.add('shake-animation');
        await sleep(getStepDelay() + 200);
        elements.toki.classList.remove('shake-animation');
        break; // 停止
      } else if (GameState.obstacles.some(obs => obs.x === nextX && obs.y === nextY)) {
        // 障害物（ダンボール）に衝突！
        setTokiMood('sad');
        setMessage('あぶない！ ダンボールに ぶつかっちゃった！(＞＜) 「リセット」をおして やりなおしてね！', 'sad');
        elements.toki.classList.add('shake-animation');
        await sleep(getStepDelay() + 200);
        elements.toki.classList.remove('shake-animation');
        break; // 停止
      } else {
        // 正常移動
        GameState.x = nextX;
        GameState.y = nextY;
        updateTokiPosition(true);
        setMessage(`まえに すすんだよ！ (いまの ばしょ: ${GameState.x}, ${GameState.y})`, 'toki');

        // トキが移動したマスにホムラが居たか判定
        if (GameState.x === GameState.homuraX && GameState.y === GameState.homuraY) {
          if (GameState.currentMode === 'toy' && GameState.collectedToys.length < GameState.toys.length) {
            const remaining = GameState.toys.length - GameState.collectedToys.length;
            setMessage(`ホムラ「おもちゃが まだ たりないニャ〜！(あと ${remaining}こ) あつめてきてね！」`, 'homura');
          } else {
            isSuccess = true;
            onGoalReached();
            break;
          }
        }

        actionExecuted = true;
      }
    } else if (cmd.type === 'TURN_RIGHT') {
      // 右を向く（+90度）
      GameState.direction = (GameState.direction + 1) % 4;
      GameState.totalRotation += 90;
      updateTokiPosition(true);
      setMessage('みぎを むいたよ！ ↷', 'toki');
      actionExecuted = true;
    } else if (cmd.type === 'TURN_LEFT') {
      // 左を向く（-90度）
      GameState.direction = (GameState.direction + 3) % 4;
      GameState.totalRotation -= 90;
      updateTokiPosition(true);
      setMessage('ひだりを むいたよ！ ↶', 'toki');
      actionExecuted = true;
    } else if (cmd.type === 'PICKUP') {
      // おもちゃをひろう
      const pickedToy = pickupToyAt(GameState.x, GameState.y);
      if (pickedToy) {
        setTokiMood('happy');
        const remaining = GameState.toys.length - GameState.collectedToys.length;
        if (remaining > 0) {
          setMessage(`おもちゃ（${pickedToy.icon || '🧸'}）を ひろったよ！ (のこり: ${remaining}こ)`, 'happy');
        } else {
          setMessage(`おもちゃ（${pickedToy.icon || '🧸'}）を ひろったよ！ ぜんぶあつまった！ホムラのところへいこう！🎉`, 'happy');
        }
        await sleep(Math.min(350, getStepDelay()));
        setTokiMood('normal');
      } else {
        // 空振り：おもちゃがないマスでの実行（エラー停止せず次に進む）
        elements.toki.classList.add('tilt-animation');
        setMessage('あれ？ ここには おもちゃが ないよ？ キョロキョロ…(・_・ )', 'toki');
        await sleep(getStepDelay());
        elements.toki.classList.remove('tilt-animation');
      }
      actionExecuted = true;
    }

    // トキが命令（進む・向く・ひろう）を実行するたびに動くゴールの処理（レベル3・4）
    if (actionExecuted && GameState.movingGoal) {
      await sleep(Math.min(250, Math.floor(getStepDelay() / 2)));
      if (GameState.shouldStop) break;
      moveHomura();
      setMessage(`ホムラも てくてく にげたよ！ (ホムラの ばしょ: ${GameState.homuraX}, ${GameState.homuraY})`, 'homura');

      // ホムラがトキのいるマスに移動してきたか判定
      if (GameState.x === GameState.homuraX && GameState.y === GameState.homuraY) {
        if (GameState.currentMode === 'toy' && GameState.collectedToys.length < GameState.toys.length) {
          const remaining = GameState.toys.length - GameState.collectedToys.length;
          setMessage(`ホムラ「おもちゃが まだ たりないニャ〜！(あと ${remaining}こ) あつめてきてね！」`, 'homura');
        } else {
          isSuccess = true;
          onGoalReached();
          break;
        }
      }
    }

    await sleep(getStepDelay());
  }

  // ブロックハイライト解除
  if (workspace) {
    workspace.highlightBlock(null);
  }

  // 終了時のメッセージ（ゴール未到達時）
  if (!isSuccess && !GameState.shouldStop) {
    setTokiMood('sad');
    if (GameState.currentMode === 'toy' && GameState.collectedToys.length < GameState.toys.length) {
      const remaining = GameState.toys.length - GameState.collectedToys.length;
      setMessage(`おもちゃを ぜんぶ あつめられなかったよ…！(あと ${remaining}こ) 「リセット」をおして やりなおしてね！`, 'sad');
    } else {
      setMessage('ホムラをつかまえられなかったよ…！(＞＜) 「リセット」をおして やりなおしてね！', 'sad');
    }
  }

  // リセットによって中断されたのでなければ、失敗時・ゴール達成時はリセットされるまで「うごかす」ボタンを無効化
  if (!GameState.shouldStop) {
    elements.runBtn.disabled = true;
  }
  GameState.isRunning = false;
}

/**
 * ゴール到達時の演出
 */
function onGoalReached() {
  setTokiMood('happy');
  elements.toki.classList.add('victory-jump');

  // 作成したプログラムのブロック数を取得・判定
  const currentLevelData = GameState.getCurrentLevelData();
  const minBlocks = currentLevelData ? currentLevelData.minBlocks : 0;
  const usedBlocks = countProgramBlocks();
  const isPerfect = minBlocks > 0 && usedBlocks <= minBlocks;
  const isToyMode = GameState.currentMode === 'toy';

  // 吹き出しメッセージの更新
  if (isPerfect) {
    setMessage(`やったー！これ以上短くできない完璧なプログラムだよ！すごい！おめでとう！💮✨ (使ったブロック: ${usedBlocks}個)`, 'happy');
  } else {
    const successAction = isToyMode ? 'おもちゃをあつめて ホムラにあえたよ！🎉' : 'ホムラをつかまえたよ！🎉';
    setMessage(`${successAction} くりかえし等をつかうと、もっと短くできるよ！ちょうせんしてみてね！💡 (いまのブロック: ${usedBlocks}個)`, 'happy');
  }

  // モーダル内の猫アイコン表示
  if (elements.modalCatsContainer) {
    elements.modalCatsContainer.innerHTML = `
      <div class="modal-cat-box">
        <div class="modal-cat-avatar">${TOKI_HAPPY_SVG}</div>
        <span class="modal-cat-name">トキ (ハチワレ)</span>
      </div>
      <div class="modal-heart">💖</div>
      <div class="modal-cat-box">
        <div class="modal-cat-avatar">${HOMURA_SVG}</div>
        <span class="modal-cat-name">ホムラ (クリーム長毛)</span>
      </div>
    `;
  }

  // モーダル内のメッセージ・評価の更新
  if (elements.victoryTitle) {
    elements.victoryTitle.textContent = isPerfect
      ? (isToyMode ? '🌟 かんぺき！ おもちゃを ぜんぶ とどけたよ！ 🌟' : '🌟 かんぺき！ 大せいこう！ 🌟')
      : (isToyMode ? '🎉 おもちゃを ぜんぶ とどけたよ！ 🎉' : '🎉 タッチ！ つかまえたよ！ 🎉');
  }
  if (elements.victoryDesc) {
    const clearDesc = isToyMode ? 'おもちゃをぜんぶあつめて ホムラにあえたよ！にゃーん！🎉' : 'ホムラをつかまえたよ！にゃーん！🎉';
    elements.victoryDesc.innerHTML = isPerfect
      ? `${clearDesc}<br><strong>これ以上 短くできない 完璧なプログラムです！</strong>`
      : `${clearDesc}<br>${isToyMode ? 'おもちゃあつめ だいせいこう！' : 'おにごっこ せいこう！'}`;
  }
  if (elements.victoryEvaluation) {
    if (isPerfect) {
      elements.victoryEvaluation.className = 'victory-evaluation eval-perfect';
      elements.victoryEvaluation.innerHTML = `
        <div class="eval-badge">💮 かんぺき！ これ以上短くできないよ！</div>
        <div class="eval-detail">つかったブロック：<strong>${usedBlocks}こ</strong><br>むだのない、さいこうのプログラムだよ！すばらしい！✨</div>
      `;
    } else {
      elements.victoryEvaluation.className = 'victory-evaluation eval-can-improve';
      elements.victoryEvaluation.innerHTML = `
        <div class="eval-badge">💡 もっと短くできるよ！</div>
        <div class="eval-detail">
          つかったブロック：<strong>${usedBlocks}こ</strong><br>
          「くりかえし」ブロックなどを使うと、もっとすくないブロック数でクリアできるよ！<br>さらにみじかいプログラムに ちょうせんしてみてね！🐾
        </div>
      `;
    }
  }

  // 次のレベルの存在確認
  const currentLevels = GameState.getCurrentLevels();
  const nextLevel = currentLevels.find(l => l.id === GameState.currentLevel + 1);
  if (elements.modalNextBtn) {
    if (nextLevel) {
      elements.modalNextBtn.style.display = 'inline-flex';
      elements.modalNextBtn.textContent = `${nextLevel.name} へすすむ！ 🐾`;
    } else {
      elements.modalNextBtn.style.display = 'none';
    }
  }

  setTimeout(() => {
    elements.victoryModal.classList.remove('hidden');
  }, 400);
}

/**
 * モードの切り替え (おにごっこ / おもちゃあつめ)
 */
function setMode(mode) {
  if (GameState.currentMode === mode) return;
  if (GameState.isRunning) {
    GameState.shouldStop = true;
  }

  GameState.currentMode = mode;

  // モードタブのactive切り替え
  if (elements.modeTabs) {
    elements.modeTabs.forEach(tab => {
      if (tab.dataset.mode === mode) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  // レベルボタンの再描画
  renderLevelButtons();

  // Blocklyツールボックスの切り替え
  if (workspace) {
    const toolboxId = mode === 'toy' ? 'toolbox-toy' : 'toolbox';
    const toolboxEl = document.getElementById(toolboxId);
    if (toolboxEl && typeof workspace.updateToolbox === 'function') {
      workspace.updateToolbox(toolboxEl);
    }
  }

  // レベル1に切り替え
  setLevel(1);
}

/**
 * レベルボタン一覧の動的描画
 */
function renderLevelButtons() {
  if (!elements.levelButtonsContainer) return;
  const levels = GameState.getCurrentLevels();
  elements.levelButtonsContainer.innerHTML = '';

  levels.forEach(level => {
    const btn = document.createElement('button');
    btn.className = `level-btn${level.id === GameState.currentLevel ? ' active' : ''}`;
    btn.dataset.level = level.id;
    let icon = '🌟';
    if (GameState.currentMode === 'toy') {
      icon = level.id === 1 ? '🧸' : '🧶';
    } else {
      icon = level.id === 1 ? '🌟' : level.id === 2 ? '📦' : level.id === 3 ? '🐾' : '👑';
    }
    btn.textContent = `${icon} ${level.name}`;
    elements.levelButtonsContainer.appendChild(btn);
  });

  elements.levelButtons = elements.levelButtonsContainer.querySelectorAll('.level-btn');
}

/**
 * レベルの切り替え
 */
function setLevel(levelId) {
  if (GameState.isRunning) {
    GameState.shouldStop = true;
  }

  GameState.loadLevel(levelId);

  // ボタンのactive表示更新
  if (elements.levelButtons) {
    elements.levelButtons.forEach(btn => {
      if (parseInt(btn.dataset.level, 10) === levelId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  createGridBoard();
  resetGame();

  const currentLevelData = GameState.getCurrentLevelData();
  if (currentLevelData) {
    setMessage(currentLevelData.startMessage, 'toki');
  }
}

/**
 * 盤面とプレイヤーのリセット
 */
function resetGame() {
  GameState.shouldStop = true;
  GameState.reset();

  setTokiMood('normal');
  elements.toki.classList.remove('victory-jump', 'shake-animation', 'tilt-animation');
  elements.victoryModal.classList.add('hidden');
  updateTokiPosition(true);
  updateGoalDisplay();
  updateToyCounterDisplay();

  if (workspace) {
    workspace.highlightBlock(null);
  }

  const currentLevelData = GameState.getCurrentLevelData();
  const msg = currentLevelData ? currentLevelData.startMessage : 'スタートちてんに もどったよ！「うごかす！」をおしてね。';
  setMessage(msg, 'toki');
  elements.runBtn.disabled = false;
}

/**
 * 5. イベントリスナーの登録
 */
function setupEventListeners() {
  elements.runBtn.addEventListener('click', runProgram);
  elements.resetBtn.addEventListener('click', resetGame);

  elements.modalCloseBtn.addEventListener('click', () => {
    elements.victoryModal.classList.add('hidden');
    resetGame();
  });

  if (elements.modalNextBtn) {
    elements.modalNextBtn.addEventListener('click', () => {
      elements.victoryModal.classList.add('hidden');
      const currentLevels = GameState.getCurrentLevels();
      const nextLevel = currentLevels.find(l => l.id === GameState.currentLevel + 1);
      if (nextLevel) {
        setLevel(nextLevel.id);
      } else {
        resetGame();
      }
    });
  }

  // レベル切り替えボタン（コンテナへのイベント委譲）
  if (elements.levelButtonsContainer) {
    elements.levelButtonsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.level-btn');
      if (!btn) return;
      const levelId = parseInt(btn.dataset.level, 10);
      if (levelId && levelId !== GameState.currentLevel) {
        setLevel(levelId);
      }
    });
  }

  // モード切り替えタブ
  if (elements.modeTabs) {
    elements.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        if (mode && mode !== GameState.currentMode) {
          setMode(mode);
        }
      });
    });
  }
}

// 起動時初期化
window.addEventListener('DOMContentLoaded', () => {
  GameState.loadLevel(1);
  createGridBoard();
  initBlockly();
  setupEventListeners();

  // レンダリング完了後に盤面位置を同期
  requestAnimationFrame(() => {
    updateTokiPosition(false);
  });
});
