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
    title: 'エビの ぬいぐるみ',
    description: 'エビの ぬいぐるみを ひろってから、トキにあいにいこう！',
    gridSize: 5,
    startX: 0,
    startY: 0,
    startDirection: 1,
    startRotation: 90,
    goalX: 4,
    goalY: 4,
    obstacles: [],
    toys: [
      { id: 'toy-1', x: 2, y: 2, icon: '🦐', name: 'エビのぬいぐるみ' }
    ],
    startMessage: 'まんなかに エビのぬいぐるみが あるよ！「ひろう」ブロックをつかって ひろってから みぎしたの トキのところへいこう！',
    minBlocks: 11
  },
  {
    id: 2,
    name: 'レベル 2',
    title: 'エビと ボール',
    description: 'ダンボールを よけながら、エビと ボールの ぬいぐるみを あつめて トキにあいにいこう！',
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
      { id: 'toy-1', x: 2, y: 0, icon: '🦐', name: 'エビのぬいぐるみ' },
      { id: 'toy-2', x: 2, y: 4, icon: '🎾', name: 'ボールのぬいぐるみ' }
    ],
    startMessage: 'エビと ボールの ぬいぐるみが あるよ！ ダンボールをよけて ぜんぶひろってから トキに あいにいこう！',
    minBlocks: 11
  },
  {
    id: 3,
    name: 'レベル 3',
    title: 'ハテナの箱と エビのぬいぐるみ',
    description: 'はこを あけると なにが でてくるかな？ エビのぬいぐるみだけを ひろって、トキにあいにいこう！',
    gridSize: 5,
    startX: 0,
    startY: 2,
    startDirection: 1,
    startRotation: 90,
    goalX: 4,
    goalY: 2,
    obstacles: [],
    hasRandomBoxes: true,
    toys: [
      { id: 'box-1', x: 1, y: 2, isBox: true, isOpened: false, icon: '🦐', name: 'エビのぬいぐるみ', isTrap: false },
      { id: 'box-2', x: 3, y: 2, isBox: true, isOpened: false, icon: '🧻', name: 'トイレットペーパー', isTrap: true }
    ],
    startMessage: 'はこが 2つあるよ！ あけると エビ🦐 か トイレットペーパー🧻 がでてくるよ。「もし」ブロックをつかって エビだけをひろってね！',
    minBlocks: 8
  }
];

// レベルデータ定義: おおきさくらべモード (ソート)
const LEVELS_SORT = [
  {
    id: 1,
    name: 'レベル 1',
    title: 'はじめての おおきさくらべ',
    description: 'サイベ(大)、アメショ(中)、マンチカン(小)を ちいさいじゅんに ならべかえよう！',
    lanes: [
      {
        id: 'toki',
        name: 'トキ組',
        supervisor: 'toki',
        cats: [
          { type: 'siberian', name: 'サイベ', size: 3, badge: '大 (3)' },
          { type: 'americanshorthair', name: 'アメショ', size: 2, badge: '中 (2)' },
          { type: 'munchkin', name: 'マンチカン', size: 1, badge: '小 (1)' }
        ]
      }
    ],
    startMessage: '「いれかえる」「つぎのペアへすすむ」「さいしょにもどる」をつかって、ちいさいじゅんに ならべよう！',
    minBlocks: 5
  },
  {
    id: 2,
    name: 'レベル 2',
    title: 'トキとホムラの 2レーンテスト！',
    description: 'トキ組と ホムラ組を 1つのプログラムで どうじに ちいさいじゅんに ならべかえよう！',
    lanes: [
      {
        id: 'toki',
        name: 'トキ組',
        supervisor: 'toki',
        cats: [
          { type: 'siberian', name: 'サイベ', size: 3, badge: '大 (3)' },
          { type: 'americanshorthair', name: 'アメショ', size: 2, badge: '中 (2)' },
          { type: 'munchkin', name: 'マンチカン', size: 1, badge: '小 (1)' }
        ]
      },
      {
        id: 'homura',
        name: 'ホムラ組',
        supervisor: 'homura',
        cats: [
          { type: 'americanshorthair', name: 'アメショ', size: 2, badge: '中 (2)' },
          { type: 'siberian', name: 'サイベ', size: 3, badge: '大 (3)' },
          { type: 'munchkin', name: 'マンチカン', size: 1, badge: '小 (1)' }
        ]
      }
    ],
    startMessage: 'トキ組と ホムラ組で ならびじゅんが ちがうよ！「くりかえし」のなかに「もし」と「いれかえる」をつかって、りょうほうクリアしよう！',
    minBlocks: 7
  }
];

// 後方互換用エイリアス
const LEVELS = LEVELS_CHASE;

// ゲーム状態の管理
const GameState = {
  currentMode: 'chase', // 'chase' | 'toy' | 'sort'
  currentLevel: 1,
  GRID_SIZE: 5,
  startX: 0,
  startY: 0,
  goalX: 4,
  goalY: 4,
  obstacles: [],
  toys: [],
  collectedToys: [], // 収集済みtoyのid配列
  collectedTraps: [], // 収集済みtrap（紙）のid配列
  movingGoal: false,
  homuraX: 4,
  homuraY: 4,
  homuraDir: -1, // -1: 左, 1: 右

  // ソートモード用状態
  sortPointer: 0, // 0: 0番目と1番目を比較, 1: 1番目と2番目を比較
  sortLanes: [],

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
    if (this.currentMode === 'sort') return LEVELS_SORT;
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
    if (this.currentMode === 'sort') {
      this.sortPointer = 0;
      this.sortLanes = (level.lanes || []).map(lane => ({
        ...lane,
        cats: lane.cats.map(c => ({ ...c }))
      }));
    } else {
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
    }
    this.reset();
  },

  // 箱の中身のシャッフル（50%で中身を入れ替え）
  shuffleBoxes() {
    const level = this.getCurrentLevelData();
    if (!level.hasRandomBoxes || this.toys.length < 2) return;
    const shouldSwap = typeof window !== 'undefined' && window.__forceBoxSwap !== undefined
      ? !!window.__forceBoxSwap
      : Math.random() < 0.5;

    if (shouldSwap) {
      const tempIcon = this.toys[0].icon;
      const tempName = this.toys[0].name;
      const tempIsTrap = this.toys[0].isTrap;

      this.toys[0].icon = this.toys[1].icon;
      this.toys[0].name = this.toys[1].name;
      this.toys[0].isTrap = this.toys[1].isTrap;

      this.toys[1].icon = tempIcon;
      this.toys[1].name = tempName;
      this.toys[1].isTrap = tempIsTrap;
    }
    this.toys.forEach(t => {
      if (t.isBox) t.isOpened = false;
    });
  },

  // 初期化・リセット
  reset() {
    const level = this.getCurrentLevelData();
    if (this.currentMode === 'sort') {
      this.sortPointer = 0;
      this.sortLanes = (level.lanes || []).map(lane => ({
        ...lane,
        cats: lane.cats.map(c => ({ ...c }))
      }));
      this.isRunning = false;
      this.shouldStop = false;
      return;
    }
    this.x = this.startX;
    this.y = this.startY;
    this.direction = level.startDirection;
    this.totalRotation = level.startRotation;
    this.homuraX = level.goalX;
    this.homuraY = level.goalY;
    this.homuraDir = level.homuraInitialDir || -1;
    this.toys = (level.toys || []).map(t => ({ ...t }));
    if (level.hasRandomBoxes) {
      this.shuffleBoxes();
    }
    this.collectedToys = [];
    this.collectedTraps = [];
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

// クリーム色の長毛猫「ホムラ」の困り顔SVG定数（壁衝突・失敗時用）
const HOMURA_SAD_SVG = `
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
  <!-- ＞ ＜ の困り目 -->
  <path d="M 27,47 L 37,52 L 27,57" fill="none" stroke="#01579b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 73,47 L 63,52 L 73,57" fill="none" stroke="#01579b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  <!-- なみだのしずく -->
  <path d="M 22,63 Q 20,69 23,71 Q 26,71 25,67 Z" fill="#29b6f6" />
  <!-- ほんのりピンクのほっぺ -->
  <circle cx="26" cy="58" r="5" fill="#ffab91" opacity="0.5" />
  <circle cx="74" cy="58" r="5" fill="#ffab91" opacity="0.5" />
  <!-- 鼻（ピンク） -->
  <polygon points="47,59 53,59 50,63" fill="#ff8a80" />
  <!-- 口（への字） -->
  <path d="M 45,67 Q 50,63 55,67" fill="none" stroke="#8d6e63" stroke-width="2" stroke-linecap="round" />
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

// クリーム色の長毛猫「ホムラ」の笑顔SVG定数（アイテム獲得・クリア時用）
const HOMURA_HAPPY_SVG = `
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
  <!-- にっこり目 (⌒ ⌒) -->
  <path d="M 27,52 Q 34,43 41,52" fill="none" stroke="#5d4037" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 59,52 Q 66,43 73,52" fill="none" stroke="#5d4037" stroke-width="3.5" stroke-linecap="round" />
  <!-- ほんのりピンクのほっぺ -->
  <circle cx="26" cy="58" r="5" fill="#ffab91" opacity="0.6" />
  <circle cx="74" cy="58" r="5" fill="#ffab91" opacity="0.6" />
  <!-- 鼻（ピンク） -->
  <polygon points="47,59 53,59 50,63" fill="#ff8a80" />
  <!-- 口（にっこり） -->
  <path d="M 44,65 Q 47,70 50,65 Q 53,70 56,65" fill="none" stroke="#8d6e63" stroke-width="2" stroke-linecap="round" />
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

// マンチカン（小 / 1）のSVG
const MUNCHKIN_SVG = `
<svg class="cat-svg munchkin-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="26,36 18,12 40,24" fill="#ff9800" />
  <polygon points="74,36 82,12 60,24" fill="#37474f" />
  <polygon points="27,32 22,17 37,25" fill="#ffab91" />
  <polygon points="73,32 78,17 63,25" fill="#ffab91" />
  <ellipse cx="50" cy="68" rx="26" ry="22" fill="#ffffff" />
  <ellipse cx="38" cy="66" rx="12" ry="16" fill="#ff9800" />
  <ellipse cx="62" cy="66" rx="10" ry="14" fill="#37474f" />
  <ellipse cx="40" cy="84" rx="7" ry="6" fill="#ffffff" stroke="#ffcc80" stroke-width="1.5" />
  <ellipse cx="60" cy="84" rx="7" ry="6" fill="#ffffff" stroke="#ffcc80" stroke-width="1.5" />
  <circle cx="50" cy="44" r="26" fill="#ffffff" />
  <path d="M 28,30 Q 38,42 50,30 Q 62,42 72,30 Q 64,18 50,20 Q 36,18 28,30 Z" fill="#ff9800" />
  <circle cx="70" cy="38" r="7" fill="#37474f" />
  <ellipse cx="39" cy="45" rx="6.5" ry="7.5" fill="#29b6f6" />
  <ellipse cx="39" cy="45" rx="4.5" ry="5.5" fill="#01579b" />
  <circle cx="37" cy="42" r="2.2" fill="#ffffff" />
  <circle cx="41" cy="47" r="1" fill="#ffffff" />
  <ellipse cx="61" cy="45" rx="6.5" ry="7.5" fill="#29b6f6" />
  <ellipse cx="61" cy="45" rx="4.5" ry="5.5" fill="#01579b" />
  <circle cx="59" cy="42" r="2.2" fill="#ffffff" />
  <circle cx="63" cy="47" r="1" fill="#ffffff" />
  <polygon points="48,53 52,53 50,56" fill="#ff8a80" />
  <path d="M 46,57 Q 48,60 50,57 Q 52,60 54,57" fill="none" stroke="#78909c" stroke-width="1.5" stroke-linecap="round" />
  <circle cx="34" cy="53" r="3.5" fill="#ff8a80" opacity="0.5" />
  <circle cx="66" cy="53" r="3.5" fill="#ff8a80" opacity="0.5" />
</svg>
`;

// アメリカンショートヘア（中 / 2）のSVG
const AMERICAN_SHORTHAIR_SVG = `
<svg class="cat-svg americanshorthair-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="20,40 12,12 40,24" fill="#78909c" />
  <polygon points="80,40 88,12 60,24" fill="#78909c" />
  <polygon points="22,36 17,18 36,25" fill="#ffab91" />
  <polygon points="78,36 83,18 64,25" fill="#ffab91" />
  <ellipse cx="50" cy="66" rx="30" ry="24" fill="#b0bec5" />
  <path d="M 32,58 Q 50,68 68,58" fill="none" stroke="#455a64" stroke-width="3" stroke-linecap="round" />
  <path d="M 30,68 Q 50,78 70,68" fill="none" stroke="#455a64" stroke-width="3" stroke-linecap="round" />
  <path d="M 35,78 Q 50,86 65,78" fill="none" stroke="#455a64" stroke-width="3" stroke-linecap="round" />
  <ellipse cx="38" cy="85" rx="7" ry="7" fill="#cfd8dc" stroke="#90a4ae" stroke-width="1.5" />
  <ellipse cx="62" cy="85" rx="7" ry="7" fill="#cfd8dc" stroke="#90a4ae" stroke-width="1.5" />
  <ellipse cx="50" cy="46" rx="28" ry="25" fill="#cfd8dc" />
  <path d="M 40,26 L 45,36 L 50,30 L 55,36 L 60,26" fill="none" stroke="#37474f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  <line x1="24" y1="46" x2="34" y2="48" stroke="#455a64" stroke-width="2" stroke-linecap="round" />
  <line x1="23" y1="52" x2="33" y2="52" stroke="#455a64" stroke-width="2" stroke-linecap="round" />
  <line x1="76" y1="46" x2="66" y2="48" stroke="#455a64" stroke-width="2" stroke-linecap="round" />
  <line x1="77" y1="52" x2="67" y2="52" stroke="#455a64" stroke-width="2" stroke-linecap="round" />
  <ellipse cx="38" cy="47" rx="7" ry="8" fill="#8bc34a" />
  <ellipse cx="38" cy="47" rx="4.5" ry="6" fill="#1b5e20" />
  <circle cx="36" cy="44" r="2.2" fill="#ffffff" />
  <circle cx="40" cy="49" r="1" fill="#ffffff" />
  <ellipse cx="62" cy="47" rx="7" ry="8" fill="#8bc34a" />
  <ellipse cx="62" cy="47" rx="4.5" ry="6" fill="#1b5e20" />
  <circle cx="60" cy="44" r="2.2" fill="#ffffff" />
  <circle cx="64" cy="49" r="1" fill="#ffffff" />
  <polygon points="48,55 52,55 50,58" fill="#e57373" />
  <path d="M 45,59 Q 48,63 50,60 Q 52,63 55,59" fill="none" stroke="#546e7a" stroke-width="1.8" stroke-linecap="round" />
</svg>
`;

// サイベリアン（大 / 3）のSVG
const SIBERIAN_SVG = `
<svg class="cat-svg siberian-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 72,70 Q 94,56 88,40 Q 82,28 72,36 Q 78,50 68,62 Z" fill="#8d6e63" stroke="#6d4c41" stroke-width="1" />
  <polygon points="18,36 8,6 38,18" fill="#6d4c41" />
  <polygon points="82,36 92,6 62,18" fill="#6d4c41" />
  <polygon points="19,32 14,14 34,20" fill="#d7ccc8" />
  <polygon points="81,32 86,14 66,20" fill="#d7ccc8" />
  <path d="M 8,6 L 4,2 M 8,6 L 10,0 M 92,6 L 96,2 M 92,6 L 90,0" stroke="#efebe9" stroke-width="2" stroke-linecap="round" />
  <ellipse cx="50" cy="65" rx="36" ry="27" fill="#8d6e63" />
  <path d="M 28,52 Q 50,72 72,52 Q 62,82 50,82 Q 38,82 28,52 Z" fill="#f5f5f5" />
  <path d="M 34,56 Q 50,76 66,56" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round" />
  <ellipse cx="36" cy="86" rx="9" ry="8" fill="#f5f5f5" stroke="#d7ccc8" stroke-width="1.5" />
  <ellipse cx="64" cy="86" rx="9" ry="8" fill="#f5f5f5" stroke="#d7ccc8" stroke-width="1.5" />
  <ellipse cx="50" cy="42" rx="32" ry="26" fill="#a1887f" />
  <path d="M 16,46 Q 26,52 20,58 Q 30,56 26,64 Q 38,58 38,52" fill="#d7ccc8" />
  <path d="M 84,46 Q 74,52 80,58 Q 70,56 74,64 Q 62,58 62,52" fill="#d7ccc8" />
  <ellipse cx="50" cy="48" rx="18" ry="14" fill="#f5f5f5" />
  <ellipse cx="36" cy="41" rx="7.5" ry="8.5" fill="#ffa000" />
  <ellipse cx="36" cy="41" rx="4.5" ry="6.5" fill="#3e2723" />
  <circle cx="34" cy="38" r="2.5" fill="#ffffff" />
  <circle cx="38" cy="43" r="1.2" fill="#ffffff" />
  <ellipse cx="64" cy="41" rx="7.5" ry="8.5" fill="#ffa000" />
  <ellipse cx="64" cy="41" rx="4.5" ry="6.5" fill="#3e2723" />
  <circle cx="62" cy="38" r="2.5" fill="#ffffff" />
  <circle cx="66" cy="43" r="1.2" fill="#ffffff" />
  <polygon points="47,49 53,49 50,53" fill="#ffab91" />
  <path d="M 44,54 Q 47,58 50,55 Q 53,58 56,54" fill="none" stroke="#5d4037" stroke-width="2" stroke-linecap="round" />
</svg>
`;

function getCatSvg(type) {
  if (type === 'munchkin') return MUNCHKIN_SVG;
  if (type === 'americanshorthair') return AMERICAN_SHORTHAIR_SVG;
  if (type === 'siberian') return SIBERIAN_SVG;
  return TOKI_SVG;
}

// DOM要素の参照
const elements = {
  gridWrapper: document.getElementById('grid-wrapper'),
  gridBoard: document.getElementById('grid-board'),
  sortStage: document.getElementById('sort-stage'),
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
  legendStart: document.getElementById('legend-start'),
  legendGoal: document.getElementById('legend-goal'),
  legendObstacle: document.getElementById('legend-obstacle'),
  legendToy: document.getElementById('legend-toy'),
  legendSort: document.getElementById('legend-sort'),
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
function initBlockly(retries = 30) {
  if (typeof Blockly === 'undefined') {
    if (retries > 0) {
      setTimeout(() => initBlockly(retries - 1), 200);
      return;
    }
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

  // --- カスタムブロック: ぬいぐるみを ひろう ---
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

  // --- カスタムブロック: もし〜なら ---
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

  // --- カスタムブロック: もし ひだり ＞ みぎ なら (ソート用・条件分岐) ---
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

  // --- カスタムブロック: いれかえる (ソート用・アクション) ---
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

  // --- カスタムブロック: もし ひだり ＞ みぎ なら いれかえる (旧互換用) ---
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

  // --- カスタムブロック: つぎの ペアへ すすむ (ソート用) ---
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

  // --- カスタムブロック: さいしょに もどる (ソート用) ---
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
function setupInitialBlocks(mode = GameState.currentMode) {
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

      elements.gridBoard.appendChild(cell);
    }
  }

  // ゴール（ホムラ）の描画
  updateGoalDisplay();

  // おもちゃ（ぬいぐるみ）の描画
  updateToysDisplay();

  // 凡例の障害物表示切り替え
  if (elements.legendObstacle) {
    elements.legendObstacle.style.display = GameState.obstacles.length > 0 ? 'inline-flex' : 'none';
  }

  // おもちゃカウンターと凡例の表示更新
  updateToyCounterDisplay();

  updateTokiPosition(false);
}

/**
 * 盤面のおもちゃ（ぬいぐるみ）表示更新
 */
function updateToysDisplay() {
  if (!elements.gridBoard) return;

  // 全セルからおもちゃ表示をクリア
  const allCells = elements.gridBoard.querySelectorAll('.grid-cell');
  allCells.forEach(cell => {
    cell.classList.remove('toy-cell');
    const toyItem = cell.querySelector('.toy-item');
    if (toyItem) toyItem.remove();
  });

  // 未回収のおもちゃを盤面に再配置
  GameState.toys.forEach(toy => {
    const isCollected = GameState.collectedToys.includes(toy.id) ||
      (GameState.collectedTraps && GameState.collectedTraps.includes(toy.id));
    if (!isCollected) {
      const targetCell = elements.gridBoard.querySelector(
        `.grid-cell[data-x="${toy.x}"][data-y="${toy.y}"]`
      );
      if (targetCell) {
        targetCell.classList.add('toy-cell');
        const toyItem = document.createElement('div');
        toyItem.className = 'toy-item';
        toyItem.dataset.toyId = toy.id;

        if (toy.isBox && !toy.isOpened) {
          toyItem.classList.add('box-unopened');
          toyItem.innerHTML = `
            <span>🎁</span>
            <span class="toy-label">はこ</span>
          `;
        } else {
          if (toy.isBox && toy.isOpened) {
            toyItem.classList.add('box-opened-anim');
          }
          toyItem.innerHTML = `
            <span>${toy.icon || '🦐'}</span>
            <span class="toy-label">${toy.name || 'ぬいぐるみ'}</span>
          `;
        }
        targetCell.appendChild(toyItem);
      }
    }
  });
}

/**
 * おもちゃカウンターと凡例の表示更新
 */
function updateToyCounterDisplay() {
  const targetToys = GameState.toys.filter(t => !t.isTrap);
  const total = targetToys.length;
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
    t => t.x === x && t.y === y &&
      !GameState.collectedToys.includes(t.id) &&
      !(GameState.collectedTraps && GameState.collectedTraps.includes(t.id))
  );
  if (toyIndex === -1) {
    return null; // おもちゃがない
  }

  const toy = GameState.toys[toyIndex];
  if (toy.isTrap) {
    if (!GameState.collectedTraps) GameState.collectedTraps = [];
    GameState.collectedTraps.push(toy.id);
  } else {
    GameState.collectedToys.push(toy.id);
  }

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
 * ゴール（ホムラ／トキ）の盤面表示更新
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

  const isToyMode = GameState.currentMode === 'toy';
  const goalX = isToyMode ? GameState.goalX : GameState.homuraX;
  const goalY = isToyMode ? GameState.goalY : GameState.homuraY;

  // 現在のゴール座標のセルを取得
  const targetCell = elements.gridBoard.querySelector(
    `.grid-cell[data-x="${goalX}"][data-y="${goalY}"]`
  );

  if (targetCell) {
    targetCell.classList.add('goal-cell');

    const goalLabel = document.createElement('span');
    goalLabel.className = 'goal-indicator';
    goalLabel.textContent = 'ゴール';
    targetCell.appendChild(goalLabel);

    const goalItems = document.createElement('div');
    goalItems.className = 'goal-items';

    if (isToyMode) {
      // ぬいぐるみあつめモード: ゴールはトキ
      goalItems.innerHTML = `
        <div class="toki-avatar">
          ${TOKI_SVG}
        </div>
      `;
    } else {
      // おにごっこモード: ゴールはホムラ
      const flipStyle = GameState.homuraDir === 1 ? 'transform: scaleX(-1);' : '';
      goalItems.innerHTML = `
        <div class="homura-avatar" style="${flipStyle}">
          ${HOMURA_SVG}
        </div>
      `;
    }
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
 * 操作キャラクター（トキ／ホムラ）の画面位置・向きの更新
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
 * 操作キャラクターの表情・状態の更新
 * mood: 'normal' | 'sad' | 'happy'
 */
function setPlayerMood(mood = 'normal') {
  if (!elements.tokiInner) return;
  const isToyMode = GameState.currentMode === 'toy';
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
const setTokiMood = setPlayerMood;

/**
 * 吹き出しメッセージの更新
 */
function setMessage(text, speaker = 'auto') {
  elements.statusMessage.textContent = text;
  if (!elements.speakerAvatar) return;

  const isToyMode = GameState.currentMode === 'toy';

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
        const item = current.getFieldValue('ITEM') || '🦐';
        const branchBlock = current.getInputTargetBlock('DO');
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
        const times = parseInt(current.getFieldValue('TIMES'), 10) || 1;
        const branchBlock = current.getInputTargetBlock('DO');
        for (let i = 0; i < times; i++) {
          if (branchBlock) {
            traverse(branchBlock, targetList);
          }
        }
      } else if (current.type === 'sort_if') {
        const branchBlock = current.getInputTargetBlock('DO');
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
      current = current.getNextBlock();
    }
  }

  // 1番目（最上位）のトップブロックを実行対象とする
  traverse(topBlocks[0], commands);
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
 * おおきさくらべ（ソートモード）のステージ描画
 */
function renderSortStage() {
  if (!elements.sortStage) return;
  elements.sortStage.innerHTML = '';
  const isSingle = GameState.sortLanes.length === 1;
  elements.sortStage.classList.toggle('single-lane-stage', isSingle);
  elements.sortStage.classList.toggle('two-lanes', !isSingle);
  elements.sortStage.classList.toggle('level-2', !isSingle);

  GameState.sortLanes.forEach(lane => {
    const laneDiv = document.createElement('div');
    laneDiv.className = `sort-lane${isSingle ? ' single-lane' : ''}`;
    laneDiv.id = `sort-lane-${lane.id}`;

    // ヘッダー
    const isSorted = isLaneSorted(lane);
    const header = document.createElement('div');
    header.className = 'sort-lane-header';
    header.innerHTML = `
      <span>${lane.supervisor === 'toki' ? '🐾 トキ組' : '🐈 ホムラ組'}</span>
      <span class="sort-lane-status ${isSorted ? 'is-sorted' : 'not-sorted'}" id="status-${lane.id}">
        ${isSorted ? '✨ せいれつOK！' : '🐾 ならびかえ中…'}
      </span>
    `;
    laneDiv.appendChild(header);

    // 猫たち横並び列
    const row = document.createElement('div');
    row.className = 'sort-cats-row';
    row.id = `sort-cats-row-${lane.id}`;

    lane.cats.forEach((cat, catIdx) => {
      const slot = document.createElement('div');
      slot.className = `sort-cat-slot${(catIdx === GameState.sortPointer || catIdx === GameState.sortPointer + 1) ? ' focus-cat' : ''}`;
      slot.dataset.index = catIdx;
      slot.id = `cat-slot-${lane.id}-${catIdx}`;

      const catItem = document.createElement('div');
      catItem.className = 'sort-cat-item';
      catItem.innerHTML = `
        <div class="sort-cat-svg sort-cat-${cat.type}">
          ${getCatSvg(cat.type)}
        </div>
        <span class="cat-badge cat-badge-${cat.type}">🐱 ${cat.name} ${cat.badge}</span>
      `;
      slot.appendChild(catItem);
      row.appendChild(slot);
    });

    // 監督猫（カーソル役）ポインターバー
    const pointerBar = document.createElement('div');
    pointerBar.className = 'sort-pointer-bar';
    pointerBar.id = `sort-pointer-bar-${lane.id}`;

    const supervisor = document.createElement('div');
    supervisor.className = 'sort-supervisor-indicator';
    supervisor.id = `sort-supervisor-${lane.id}`;
    const supervisorAvatarSvg = lane.supervisor === 'toki' ? TOKI_SVG : HOMURA_SVG;
    supervisor.innerHTML = `
      <div class="supervisor-mini-avatar">${supervisorAvatarSvg}</div>
      <div class="supervisor-bracket">くらべるニャ🔍</div>
    `;
    pointerBar.appendChild(supervisor);
    row.appendChild(pointerBar);

    laneDiv.appendChild(row);
    elements.sortStage.appendChild(laneDiv);
  });

  updateSupervisorPositions();
}

function updateSupervisorPositions() {
  GameState.sortLanes.forEach(lane => {
    const supervisor = document.getElementById(`sort-supervisor-${lane.id}`);
    if (supervisor) {
      const leftPercent = GameState.sortPointer === 0 ? 33.3 : 66.6;
      supervisor.style.left = `${leftPercent}%`;
    }
    lane.cats.forEach((_, idx) => {
      const slot = document.getElementById(`cat-slot-${lane.id}-${idx}`);
      if (slot) {
        if (idx === GameState.sortPointer || idx === GameState.sortPointer + 1) {
          slot.classList.add('focus-cat');
        } else {
          slot.classList.remove('focus-cat');
        }
      }
    });
  });
}

function isLaneSorted(lane) {
  for (let i = 0; i < lane.cats.length - 1; i++) {
    if (lane.cats[i].size > lane.cats[i + 1].size) return false;
  }
  return true;
}

function areAllLanesSorted() {
  return GameState.sortLanes.every(lane => isLaneSorted(lane));
}

/**
 * ソートモード専用の実行エンジン
 */
async function runSortProgram(commands) {
  const getStepDelay = () => parseInt(elements.speedSelect.value, 10) || 450;
  setMessage('大きさ比べ スタートニャ！🐾', 'toki');

  async function executeSortCommands(cmdList, activeLanes = GameState.sortLanes) {
    for (let i = 0; i < cmdList.length; i++) {
      if (GameState.shouldStop) break;

      const cmd = cmdList[i];
      if (workspace && cmd.blockId) {
        workspace.highlightBlock(cmd.blockId);
      }

      if (cmd.type === 'SORT_IF') {
        const p = GameState.sortPointer;
        // activeLanesの中で、条件（左 > 右）を満たすレーンを抽出
        const matchingLanes = activeLanes.filter(lane => {
          return p < lane.cats.length - 1 && lane.cats[p].size > lane.cats[p + 1].size;
        });

        if (matchingLanes.length > 0) {
          const names = matchingLanes.map(l => l.name).join(' と ');
          setMessage(`「ひだりのほうが おおきいニャ！（${names}） なかのブロックを じっこうするよ！」`, 'toki');
          await sleep(Math.min(300, getStepDelay()));
          await executeSortCommands(cmd.branch, matchingLanes);
        } else {
          setMessage('「ひだりのほうが ちいさい（または おなじ）から そのままでOKニャ！」', 'toki');
          await sleep(Math.min(300, getStepDelay()));
        }
        await sleep(Math.floor(getStepDelay() / 2));
      } else if (cmd.type === 'SORT_SWAP' || cmd.type === 'SORT_COMPARE_SWAP') {
        let anySwapped = false;
        const swapLaneNames = [];

        for (const lane of activeLanes) {
          const p = GameState.sortPointer;
          if (p < lane.cats.length - 1) {
            const shouldSwap = cmd.type === 'SORT_SWAP' || (lane.cats[p].size > lane.cats[p + 1].size);
            if (shouldSwap) {
              const temp = lane.cats[p];
              lane.cats[p] = lane.cats[p + 1];
              lane.cats[p + 1] = temp;
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
          }
        }

        if (anySwapped) {
          setMessage(`「${swapLaneNames.join(' と ')}で ねこを いれかえたよ！🔄」`, 'toki');
          await sleep(getStepDelay());
          renderSortStage();
        } else {
          await sleep(Math.min(250, getStepDelay()));
        }
        await sleep(Math.floor(getStepDelay() / 2));
      } else if (cmd.type === 'SORT_STEP_NEXT') {
        const maxPointer = (GameState.sortLanes[0] ? GameState.sortLanes[0].cats.length : 3) - 2;
        if (GameState.sortPointer < maxPointer) {
          GameState.sortPointer++;
          updateSupervisorPositions();
          setMessage('つぎの ペアへ すすんだよ！🐾', 'toki');
          await sleep(getStepDelay());
        } else {
          setPlayerMood('sad');
          setMessage('「ここが はしっこニャ！ これいじょう みぎには すすめないよ」 「リセット」をおして やりなおしてね！', 'sad');
          GameState.shouldStop = true;
          break;
        }
      } else if (cmd.type === 'SORT_RESET_POINTER') {
        GameState.sortPointer = 0;
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

  const allSorted = areAllLanesSorted();
  if (allSorted) {
    onGoalReached();
  } else if (!GameState.shouldStop) {
    setPlayerMood('sad');
    setMessage('プログラムが おわったよ！ でも まだ ちいさいじゅんに ならんでいないニャ〜。「リセット」してお手本やくりかえしをためしてみてね！', 'sad');
  }

  if (!GameState.shouldStop) {
    elements.runBtn.disabled = true;
  }
  GameState.isRunning = false;
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
  setPlayerMood('normal');
  elements.toki.classList.remove('victory-jump', 'shake-animation');

  // おおきさくらべモードの場合
  if (GameState.currentMode === 'sort') {
    await runSortProgram(commands);
    return;
  }

  const isToyMode = GameState.currentMode === 'toy';
  setMessage('出発進行！にゃ〜ん！🐾', isToyMode ? 'homura' : 'toki');

  const getStepDelay = () => parseInt(elements.speedSelect.value, 10) || 450;
  let isSuccess = false;

  async function executeCommandList(cmdList) {
    for (let i = 0; i < cmdList.length; i++) {
      if (GameState.shouldStop || isSuccess) break;

      const cmd = cmdList[i];

      // 実行中ブロックのハイライト
      if (workspace && cmd.blockId) {
        workspace.highlightBlock(cmd.blockId);
      }

      if (cmd.type === 'IF') {
        // 現在地の未回収アイテム（開いている箱を含む）を取得
        const currentToy = GameState.toys.find(
          t => t.x === GameState.x && t.y === GameState.y &&
            !GameState.collectedToys.includes(t.id) &&
            !(GameState.collectedTraps && GameState.collectedTraps.includes(t.id))
        );
        const matches = currentToy && currentToy.icon === cmd.conditionItem;
        if (matches) {
          await executeCommandList(cmd.branch);
        } else {
          // 条件不一致：何もしないで少しウェイト
          await sleep(Math.min(200, getStepDelay()));
        }
        await sleep(getStepDelay());
        continue;
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
          setPlayerMood('sad');
          setMessage('いたいっ！ かべに ぶつかっちゃった！(＞＜) 「リセット」をおして やりなおしてね！', 'sad');
          elements.toki.classList.add('shake-animation');
          await sleep(getStepDelay() + 200);
          elements.toki.classList.remove('shake-animation');
          GameState.shouldStop = true;
          break; // 停止
        } else if (GameState.obstacles.some(obs => obs.x === nextX && obs.y === nextY)) {
          // 障害物（ダンボール）に衝突！
          setPlayerMood('sad');
          setMessage('あぶない！ ダンボールに ぶつかっちゃった！(＞＜) 「リセット」をおして やりなおしてね！', 'sad');
          elements.toki.classList.add('shake-animation');
          await sleep(getStepDelay() + 200);
          elements.toki.classList.remove('shake-animation');
          GameState.shouldStop = true;
          break; // 停止
        } else {
          // 正常移動
          GameState.x = nextX;
          GameState.y = nextY;
          updateTokiPosition(true);
          setMessage(`まえに すすんだよ！ (いまの ばしょ: ${GameState.x}, ${GameState.y})`, isToyMode ? 'homura' : 'toki');

          // 箱の自動オープン判定
          const boxToy = GameState.toys.find(t => t.x === GameState.x && t.y === GameState.y && t.isBox && !t.isOpened);
          if (boxToy) {
            boxToy.isOpened = true;
            updateToysDisplay();
            setMessage(`パカッ！ はこを あけたら ${boxToy.name}（${boxToy.icon}）が はいっていたよ！`, isToyMode ? 'homura' : 'toki');
            await sleep(Math.min(300, getStepDelay()));
          }

          // プレイヤーが移動したマスにゴールが居たか判定
          const targetTotal = GameState.toys.filter(t => !t.isTrap).length;
          const hasTrap = GameState.collectedTraps && GameState.collectedTraps.length > 0;
          const isGoalReached = isToyMode
            ? (GameState.x === GameState.goalX && GameState.y === GameState.goalY)
            : (GameState.x === GameState.homuraX && GameState.y === GameState.homuraY);

          if (isGoalReached) {
            if (isToyMode && hasTrap) {
              setMessage('トキ「トイレットペーパーで イタズラしちゃダメニャ〜！🧻💦 エビのぬいぐるみを もってきてね！」', 'toki');
            } else if (isToyMode && GameState.collectedToys.length < targetTotal) {
              const remaining = targetTotal - GameState.collectedToys.length;
              setMessage(`トキ「ぬいぐるみが まだ たりないニャ〜！(あと ${remaining}こ) あつめてきてね！」`, 'toki');
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
        setMessage('みぎを むいたよ！ ↷', isToyMode ? 'homura' : 'toki');
        actionExecuted = true;
      } else if (cmd.type === 'TURN_LEFT') {
        // 左を向く（-90度）
        GameState.direction = (GameState.direction + 3) % 4;
        GameState.totalRotation -= 90;
        updateTokiPosition(true);
        setMessage('ひだりを むいたよ！ ↶', isToyMode ? 'homura' : 'toki');
        actionExecuted = true;
      } else if (cmd.type === 'PICKUP') {
        // ぬいぐるみをひろう
        const pickedToy = pickupToyAt(GameState.x, GameState.y);
        if (pickedToy) {
          if (pickedToy.isTrap) {
            setPlayerMood('sad');
            setMessage(`${pickedToy.name}（${pickedToy.icon}）を ひろっちゃった！ からまっちゃうニャ〜！💦`, 'sad');
            await sleep(Math.min(350, getStepDelay()));
          } else {
            setPlayerMood('happy');
            const targetTotal = GameState.toys.filter(t => !t.isTrap).length;
            const remaining = targetTotal - GameState.collectedToys.length;
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
          // 空振り：ぬいぐるみがないマスでの実行（エラー停止せず次に進む）
          elements.toki.classList.add('tilt-animation');
          setMessage('あれ？ ここには ぬいぐるみが ないよ？ キョロキョロ…(・_・ )', isToyMode ? 'homura' : 'toki');
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
          const targetTotal = GameState.toys.filter(t => !t.isTrap).length;
          const hasTrap = GameState.collectedTraps && GameState.collectedTraps.length > 0;
          if (isToyMode && hasTrap) {
            setMessage('トキ「トイレットペーパーで イタズラしちゃダメニャ〜！🧻💦 エビのぬいぐるみを もってきてね！」', 'toki');
          } else if (isToyMode && GameState.collectedToys.length < targetTotal) {
            const remaining = targetTotal - GameState.collectedToys.length;
            setMessage(`トキ「ぬいぐるみが まだ たりないニャ〜！(あと ${remaining}こ) あつめてきてね！」`, 'toki');
          } else {
            isSuccess = true;
            onGoalReached();
            break;
          }
        }
      }

      await sleep(getStepDelay());
    }
  }

  await executeCommandList(commands);

  // ブロックハイライト解除
  if (workspace) {
    workspace.highlightBlock(null);
  }

  // 終了時のメッセージ（ゴール未到達時または未回収時）
  if (!isSuccess && !GameState.shouldStop) {
    setPlayerMood('sad');
    const isAtGoal = isToyMode
      ? (GameState.x === GameState.goalX && GameState.y === GameState.goalY)
      : (GameState.x === GameState.homuraX && GameState.y === GameState.homuraY);

    const targetTotal = GameState.toys.filter(t => !t.isTrap).length;
    const hasTrap = GameState.collectedTraps && GameState.collectedTraps.length > 0;

    if (isToyMode && hasTrap) {
      if (isAtGoal) {
        setMessage('トキ「トイレットペーパーで イタズラしちゃダメニャ〜！🧻💦 「リセット」をおして やりなおしてね！」', 'toki');
      } else {
        setMessage('トイレットペーパーを ひろっちゃったよ…！🧻💦 「リセット」をおして やりなおしてね！', 'sad');
      }
    } else if (isToyMode && GameState.collectedToys.length < targetTotal) {
      const remaining = targetTotal - GameState.collectedToys.length;
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
  setPlayerMood('happy');
  elements.toki.classList.add('victory-jump');

  // 作成したプログラムのブロック数を取得・判定
  const currentLevelData = GameState.getCurrentLevelData();
  const minBlocks = currentLevelData ? currentLevelData.minBlocks : 0;
  const usedBlocks = countProgramBlocks();
  const isPerfect = minBlocks > 0 && usedBlocks <= minBlocks;
  const isToyMode = GameState.currentMode === 'toy';
  const isSortMode = GameState.currentMode === 'sort';

  // 吹き出しメッセージの更新
  if (isPerfect) {
    setMessage(`やったー！これ以上短くできない完璧なプログラムだよ！すごい！おめでとう！💮✨ (使ったブロック: ${usedBlocks}個)`, 'happy');
  } else {
    let successAction = 'ホムラをつかまえたよ！🎉';
    if (isToyMode) successAction = 'ぬいぐるみをあつめて トキにあえたよ！🎉';
    else if (isSortMode) successAction = 'ねこたちが ちいさいじゅんに ならんだよ！🎉';
    setMessage(`${successAction} くりかえし等をつかうと、もっと短くできるよ！ちょうせんしてみてね！💡 (いまのブロック: ${usedBlocks}個)`, 'happy');
  }

  // モーダル内の猫アイコン表示
  if (elements.modalCatsContainer) {
    if (isSortMode) {
      elements.modalCatsContainer.innerHTML = `
        <div class="modal-cat-box">
          <div class="modal-cat-avatar">${MUNCHKIN_SVG}</div>
          <span class="modal-cat-name">マンチカン (小)</span>
        </div>
        <div class="modal-cat-box">
          <div class="modal-cat-avatar">${AMERICAN_SHORTHAIR_SVG}</div>
          <span class="modal-cat-name">アメショ (中)</span>
        </div>
        <div class="modal-cat-box">
          <div class="modal-cat-avatar">${SIBERIAN_SVG}</div>
          <span class="modal-cat-name">サイベ (大)</span>
        </div>
      `;
    } else {
      elements.modalCatsContainer.innerHTML = `
        <div class="modal-cat-box">
          <div class="modal-cat-avatar">${isToyMode ? HOMURA_HAPPY_SVG : TOKI_HAPPY_SVG}</div>
          <span class="modal-cat-name">${isToyMode ? 'ホムラ (クリーム長毛)' : 'トキ (ハチワレ)'}</span>
        </div>
        <div class="modal-heart">💖</div>
        <div class="modal-cat-box">
          <div class="modal-cat-avatar">${isToyMode ? TOKI_HAPPY_SVG : HOMURA_SVG}</div>
          <span class="modal-cat-name">${isToyMode ? 'トキ (ハチワレ)' : 'ホムラ (クリーム長毛)'}</span>
        </div>
      `;
    }
  }

  // モーダル内のメッセージ・評価の更新
  if (elements.victoryTitle) {
    if (isSortMode) {
      elements.victoryTitle.textContent = isPerfect
        ? '🌟 かんぺき！ きれいに ならんだよ！ 🌟'
        : '🎉 せいれつ だいせいこう！ 🎉';
    } else {
      elements.victoryTitle.textContent = isPerfect
        ? (isToyMode ? '🌟 かんぺき！ ぬいぐるみを ぜんぶ とどけたよ！ 🌟' : '🌟 かんぺき！ 大せいこう！ 🌟')
        : (isToyMode ? '🎉 ぬいぐるみを ぜんぶ とどけたよ！ 🎉' : '🎉 タッチ！ つかまえたよ！ 🎉');
    }
  }
  if (elements.victoryDesc) {
    if (isSortMode) {
      const clearDesc = 'ねこたちが ちいさいじゅんに きれいに ならんだよ！にゃーん！🎉';
      elements.victoryDesc.innerHTML = isPerfect
        ? `${clearDesc}<br><strong>これ以上 短くできない 完璧なアルゴリズムです！</strong>`
        : `${clearDesc}<br>大きさ比べ だいせいこう！`;
    } else {
      const clearDesc = isToyMode ? 'ぬいぐるみをぜんぶあつめて トキにあえたよ！にゃーん！🎉' : 'ホムラをつかまえたよ！にゃーん！🎉';
      elements.victoryDesc.innerHTML = isPerfect
        ? `${clearDesc}<br><strong>これ以上 短くできない 完璧なプログラムです！</strong>`
        : `${clearDesc}<br>${isToyMode ? 'ぬいぐるみあつめ だいせいこう！' : 'おにごっこ せいこう！'}`;
    }
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
 * モードに応じたUI（凡例・操作キャラクター・ゴール）の更新
 */
function updateModeUI() {
  const isToyMode = GameState.currentMode === 'toy';
  const isSortMode = GameState.currentMode === 'sort';

  if (elements.gridWrapper) {
    elements.gridWrapper.style.display = isSortMode ? 'none' : 'block';
  }
  if (elements.sortStage) {
    elements.sortStage.style.display = isSortMode ? 'flex' : 'none';
  }

  if (elements.legendStart) {
    elements.legendStart.style.display = isSortMode ? 'none' : 'inline-flex';
    elements.legendStart.textContent = isToyMode ? '🚩 スタート: ホムラ (🐈)' : '🚩 スタート: トキ (🐾)';
  }
  if (elements.legendGoal) {
    elements.legendGoal.style.display = isSortMode ? 'none' : 'inline-flex';
    elements.legendGoal.textContent = isToyMode ? '🎯 ゴール: トキ (🐾)' : '🎯 ゴール: ホムラ (🐈)';
  }
  if (elements.legendToy) {
    elements.legendToy.style.display = (isToyMode && !isSortMode) ? 'inline-flex' : 'none';
  }
  if (elements.legendObstacle) {
    elements.legendObstacle.style.display = (!isSortMode && GameState.obstacles.length > 0) ? 'inline-flex' : 'none';
  }
  if (elements.toyCounter) {
    elements.toyCounter.style.display = (isToyMode && !isSortMode) ? 'inline-flex' : 'none';
  }
  if (elements.legendSort) {
    elements.legendSort.style.display = isSortMode ? 'inline-flex' : 'none';
  }

  setPlayerMood('normal');
}

/**
 * モードの切り替え (おにごっこ / ぬいぐるみあつめ / おおきさくらべ)
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

  // 凡例やキャラクターの見た目を更新
  updateModeUI();

  // レベルボタンの再描画
  renderLevelButtons();

  // モードに応じた初期ブロックの配置
  setupInitialBlocks(mode);

  // レベル1に切り替え
  setLevel(1);
}

/**
 * 現在のモード・レベルに応じたツールボックスの更新
 */
function updateToolboxForCurrentState() {
  if (!workspace) return;
  let toolboxId = 'toolbox';
  if (GameState.currentMode === 'toy') {
    toolboxId = 'toolbox-toy';
  } else if (GameState.currentMode === 'sort') {
    toolboxId = GameState.currentLevel === 1 ? 'toolbox-sort-lv1' : 'toolbox-sort-lv2';
  }

  const toolboxEl = document.getElementById(toolboxId) || document.getElementById('toolbox-sort');
  if (toolboxEl && typeof workspace.updateToolbox === 'function') {
    workspace.updateToolbox(toolboxEl);
  }
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
      icon = level.id === 1 ? '🦐' : level.id === 2 ? '🎾' : '🎁';
    } else if (GameState.currentMode === 'sort') {
      icon = level.id === 1 ? '🌟' : '👑';
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

  // ツールボックスの更新
  updateToolboxForCurrentState();

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

  if (GameState.currentMode === 'sort') {
    renderSortStage();
  } else {
    createGridBoard();
  }
  resetGame();

  const currentLevelData = GameState.getCurrentLevelData();
  if (currentLevelData) {
    const isToyMode = GameState.currentMode === 'toy';
    setMessage(currentLevelData.startMessage, isToyMode ? 'homura' : 'toki');
  }
}

/**
 * 盤面とプレイヤーのリセット
 */
function resetGame() {
  GameState.shouldStop = true;
  GameState.reset();

  setPlayerMood('normal');
  elements.toki.classList.remove('victory-jump', 'shake-animation', 'tilt-animation');
  elements.victoryModal.classList.add('hidden');

  if (GameState.currentMode === 'sort') {
    renderSortStage();
  } else {
    updateTokiPosition(true);
    updateGoalDisplay();
    updateToysDisplay();
    updateToyCounterDisplay();
  }

  updateModeUI();

  if (workspace) {
    workspace.highlightBlock(null);
  }

  const currentLevelData = GameState.getCurrentLevelData();
  const isToyMode = GameState.currentMode === 'toy';
  const defaultMsg = GameState.currentMode === 'sort'
    ? 'さいしょの ならびかたに もどったよ！「うごかす！」をおしてね。'
    : 'スタートちてんに もどったよ！「うごかす！」をおしてね。';
  const msg = currentLevelData ? currentLevelData.startMessage : defaultMsg;
  setMessage(msg, isToyMode ? 'homura' : 'toki');
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
  updateModeUI();

  // レンダリング完了後に盤面位置を同期
  requestAnimationFrame(() => {
    updateTokiPosition(false);
  });
});
