/**
 * tokihomu-lab レベルデータ定義
 */

// おにごっこモード (きほん)
export const LEVELS_CHASE = [
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

// おもちゃあつめモード (おうよう)
export const LEVELS_TOY = [
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

// おおきさくらべモード (ソート)
export const LEVELS_SORT = [
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

export const LEVELS = LEVELS_CHASE;
