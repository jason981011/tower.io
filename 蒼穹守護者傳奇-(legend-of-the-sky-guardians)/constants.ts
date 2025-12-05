
import { Hero, LevelConfig, TowerDef, TowerType, ProjectileType, EnemyDef, EnemyType } from './types';

// --- Hero Definitions with Talent Trees ---
export const HEROES: Hero[] = [
  {
    id: 'h_rin',
    name: '赤鬼 凜 (Rin)',
    role: '鬼族武士 / 坦克',
    description: '繼承了古老赤鬼之血的劍士，雙角燃燒著不滅的戰意。她身穿深紅色的武士甲冑，手持名刀「煉獄」。',
    skills: ['修羅斬', '金剛體', '鬼神降臨'],
    ultimateName: "鬼神烈火斬",
    ultimateDesc: "對周圍敵人造成巨大火屬性傷害並暈眩。",
    baseStats: { hp: 700, atk: 40, armor: 0.5, respawnTime: 15, skillCooldown: 25 },
    visualTheme: {
      primaryColor: '#ef4444', 
      secondaryColor: '#1f2937', 
      accentColor: '#fbbf24', 
      weaponType: 'SWORD',
      feature: 'HORNS',
      eyeColor: '#facc15',
      hairStyle: 'PONYTAIL'
    },
    talentTree: {
      t1: [
        { id: 'rin_t1_hp', name: '鬼之血脈', description: '最大生命值 +300', tier: 1, icon: 'heart' },
        { id: 'rin_t1_atk', name: '修羅之力', description: '基礎攻擊力 +20', tier: 1, icon: 'sword' }
      ],
      t2: [
        { id: 'rin_t2_burn', name: '煉獄光環', description: '每秒對周圍敵人造成 15 點燃燒傷害', tier: 2, icon: 'flame' },
        { id: 'rin_t2_thorns', name: '劍刃反擊', description: '受到攻擊時反彈 30% 傷害', tier: 2, icon: 'shield' }
      ],
      t3: [
        { id: 'rin_t3_ult', name: '真・鬼神降臨', description: '大招範圍加倍，且暈眩時間延長 2 秒', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_yuki',
    name: '白狐 雪 (Yuki)',
    role: '靈狐弓手 / 遠程',
    description: '戴著狐面的神射手，穿著純白的巫女服。她的箭矢由靈力凝聚而成，能淨化一切污穢。',
    skills: ['靈矢', '破魔箭', '狐火結界'],
    ultimateName: "千本櫻・淨",
    ultimateDesc: "射出無數光矢，攻擊全圖敵人。",
    baseStats: { hp: 400, atk: 65, armor: 0.1, respawnTime: 12, skillCooldown: 30 },
    visualTheme: {
      primaryColor: '#f1f5f9',
      secondaryColor: '#3b82f6',
      accentColor: '#f43f5e',
      weaponType: 'BOW',
      feature: 'FOX_EARS',
      eyeColor: '#60a5fa',
      hairStyle: 'LONG'
    },
    talentTree: {
      t1: [
        { id: 'yuki_t1_spd', name: '風之步', description: '攻擊速度提升 25%', tier: 1, icon: 'wind' },
        { id: 'yuki_t1_range', name: '千里眼', description: '攻擊射程提升 50', tier: 1, icon: 'eye' }
      ],
      t2: [
        { id: 'yuki_t2_crit', name: '弱點識破', description: '普通攻擊有 20% 機率造成 2.5倍 暴擊', tier: 2, icon: 'target' },
        { id: 'yuki_t2_pierce', name: '破魔矢', description: '普通攻擊可穿透 1 個目標', tier: 2, icon: 'arrow' }
      ],
      t3: [
        { id: 'yuki_t3_ult', name: '神樂之舞', description: '大招持續時間與箭矢數量加倍', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_sakura',
    name: '妖銃 櫻 (Sakura)',
    role: '魔銃士 / 刺客',
    description: '融合了現代科技與妖術的謎之少女，黑色水手服搭配戰術裝備，手持巨大的狙擊長槍。',
    skills: ['精準狙擊', '煙幕彈', '弱點識破'],
    ultimateName: "終極爆裂彈",
    ultimateDesc: "發射一枚毀滅性的導彈，造成大範圍爆炸。",
    baseStats: { hp: 450, atk: 55, armor: 0.2, respawnTime: 14, skillCooldown: 40 },
    visualTheme: {
      primaryColor: '#18181b',
      secondaryColor: '#db2777',
      accentColor: '#94a3b8',
      weaponType: 'GUN',
      feature: 'HAT',
      eyeColor: '#f472b6',
      hairStyle: 'TWINTAILS'
    },
    talentTree: {
      t1: [
        { id: 'sakura_t1_reload', name: '快速填彈', description: '技能冷卻時間減少 20%', tier: 1, icon: 'clock' },
        { id: 'sakura_t1_dmg', name: '穿甲彈', description: '基礎攻擊力 +25，無視 20% 護甲', tier: 1, icon: 'sword' }
      ],
      t2: [
        { id: 'sakura_t2_headshot', name: '爆頭', description: '對生命值低於 30% 的敵人造成雙倍傷害', tier: 2, icon: 'skull' },
        { id: 'sakura_t2_splash', name: '高爆彈藥', description: '普通攻擊產生小範圍爆炸', tier: 2, icon: 'bomb' }
      ],
      t3: [
        { id: 'sakura_t3_ult', name: '戰術核彈', description: '大招範圍擴大 100%，傷害提升 50%', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_tamamo',
    name: '九尾 玉藻 (Tamamo)',
    role: '妖術師 / 控制',
    description: '擁有傾國之姿的九尾妖狐，身著華麗的紫色和服，身後漂浮著九條靈力組成的尾巴。',
    skills: ['狐火', '魅惑', '靈魂吸取'],
    ultimateName: "百鬼夜行",
    ultimateDesc: "召喚幽靈軍團，緩速並持續傷害所有敵人。",
    baseStats: { hp: 300, atk: 75, armor: 0.0, respawnTime: 16, skillCooldown: 35 },
    visualTheme: {
      primaryColor: '#7c3aed',
      secondaryColor: '#fcd34d',
      accentColor: '#ffffff',
      weaponType: 'MAGIC',
      feature: 'TAILS',
      eyeColor: '#c084fc',
      hairStyle: 'LONG'
    },
    talentTree: {
      t1: [
        { id: 'tamamo_t1_mp', name: '靈力泉湧', description: '技能冷卻速度加快 25%', tier: 1, icon: 'clock' },
        { id: 'tamamo_t1_ap', name: '妖術精通', description: '基礎法術攻擊 +30', tier: 1, icon: 'sparkles' }
      ],
      t2: [
        { id: 'tamamo_t2_slow', name: '絕望泥沼', description: '普通攻擊使敵人緩速 40%，持續 2 秒', tier: 2, icon: 'snow' },
        { id: 'tamamo_t2_charm', name: '魅惑之眼', description: '普通攻擊有 15% 機率使敵人暈眩 1 秒', tier: 2, icon: 'heart' }
      ],
      t3: [
        { id: 'tamamo_t3_ult', name: '九尾解放', description: '大招持續時間無限，直到魔力耗盡 (20秒)', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_ibaraki',
    name: '鬼將 茨木 (Ibaraki)',
    role: '鬼王 / 召喚',
    description: '統領百鬼的強大鬼將，右臂是巨大的鬼之爪。全身覆蓋著黑色的重型鎧甲。',
    skills: ['鬼王號令', '羅生門', '鬼手'],
    ultimateName: "羅生門之握",
    ultimateDesc: "召喚巨大的鬼手捏碎範圍內的敵人。",
    baseStats: { hp: 650, atk: 50, armor: 0.4, respawnTime: 18, skillCooldown: 28 },
    visualTheme: {
      primaryColor: '#27272a',
      secondaryColor: '#dc2626',
      accentColor: '#ea580c',
      weaponType: 'GAUNTLET',
      feature: 'ARMOR',
      eyeColor: '#ef4444',
      hairStyle: 'SHORT'
    },
    talentTree: {
      t1: [
        { id: 'ibaraki_t1_armor', name: '黑鐵鎧甲', description: '護甲提升 30% (總減傷 70%)', tier: 1, icon: 'shield' },
        { id: 'ibaraki_t1_hp', name: '鬼族體魄', description: '最大生命值 +400', tier: 1, icon: 'heart' }
      ],
      t2: [
        { id: 'ibaraki_t2_cleave', name: '巨力橫掃', description: '攻擊同時對前方扇形範圍造成傷害', tier: 2, icon: 'users' },
        { id: 'ibaraki_t2_lifesteal', name: '嗜血鬼手', description: '攻擊造成傷害的 20% 轉化為生命值', tier: 2, icon: 'droplet' }
      ],
      t3: [
        { id: 'ibaraki_t3_ult', name: '地獄之握', description: '大招範圍擴大，並直接處決生命值低於 20% 的敵人', tier: 3, icon: 'skull' }
      ]
    }
  }
];

// --- Enemy Definitions ---
export const ENEMIES: Record<EnemyType, EnemyDef> = {
  [EnemyType.SLIME]: {
    type: EnemyType.SLIME,
    name: "史萊姆 (Slime)",
    description: "由魔力殘渣凝聚而成的低階魔物。棲息在森林邊緣的潮濕地帶。雖然行動遲緩且攻擊性低，但其膠狀身體能有效緩衝物理衝擊。對於新手冒險者來說，是練習劍術與魔法最好的對象，但若被大量包圍仍有窒息的危險。",
    baseHp: 30, // Reduced from 40
    baseSpeed: 1.0,
    armor: 0,
    isFlying: false,
    reward: 5,
    visualColor: '#a3e635' 
  },
  [EnemyType.GOBLIN]: {
    type: EnemyType.GOBLIN,
    name: "哥布林 (Goblin)",
    description: "生活在荒野洞穴中的貪婪亞人。牠們體型瘦小，性格狡詐，擅長利用數量優勢壓倒敵人。哥布林對閃亮的金幣有著病態的執著，常成群結隊襲擊商隊。雖然單體戰力不強，但其敏捷的動作常讓重型武器揮空。",
    baseHp: 45, // Reduced from 60
    baseSpeed: 1.8,
    armor: 0.1,
    isFlying: false,
    reward: 8,
    visualColor: '#16a34a' 
  },
  [EnemyType.WOLF]: {
    type: EnemyType.WOLF,
    name: "魔化座狼 (Dire Wolf)",
    description: "受到虛空力量侵蝕的野生座狼。肌肉異常強化，雙眼散發著嗜血的紅光。牠們是平原上最危險的掠食者，擁有驚人的奔跑速度，能輕易撕裂輕甲單位。建議使用緩速技能或範圍攻擊來遏止牠們的衝鋒。",
    baseHp: 70, // Reduced from 90
    baseSpeed: 2.2,
    armor: 0,
    isFlying: false,
    reward: 12,
    visualColor: '#71717a'
  },
  [EnemyType.ORC]: {
    type: EnemyType.ORC,
    name: "獸人戰士 (Orc Warrior)",
    description: "來自蠻荒之地的強壯戰士，擁有綠色的皮膚與突出的獠牙。長年的部落戰爭賦予牠們豐富的戰鬥經驗。厚實的皮膚與粗糙的皮甲提供了天然的防護，手中的粗鐵武器能造成破壞性的打擊。需要重火力或破甲攻擊才能有效阻止。",
    baseHp: 180, // Reduced from 250
    baseSpeed: 0.8,
    armor: 0.3, // Reduced armor
    isFlying: false,
    reward: 20,
    visualColor: '#3f6212'
  },
  [EnemyType.HARPY]: {
    type: EnemyType.HARPY,
    name: "哈比鷹人 (Harpy)",
    description: "長著雙翼的鳥身女妖，盤旋在空中的致命獵手。牠們擁有銳利的鷹爪與刺耳的尖嘯。由於飛行特性，地面近戰單位（如兵營士兵）無法攔截牠們，防線形同虛設。指揮官必須確保防線中包含足夠的對空火力（弓箭或魔法）。",
    baseHp: 100, // Reduced from 120
    baseSpeed: 1.5,
    armor: 0,
    isFlying: true,
    reward: 15,
    visualColor: '#0ea5e9'
  },
  [EnemyType.ARMORED_KNIGHT]: {
    type: EnemyType.ARMORED_KNIGHT,
    name: "墮落騎士 (Dark Knight)",
    description: "曾經是王國的忠誠守護者，如今被黑暗力量腐化，成為了虛空的爪牙。全身穿著黑色的重型板甲，對物理攻擊擁有極高的抗性（80%減免）。普通的箭矢與刀劍對其毫無作用，唯有法師的魔法攻擊或真實傷害能穿透其防禦。",
    baseHp: 300, // Reduced from 400
    baseSpeed: 0.7,
    armor: 0.7, // Reduced armor
    isFlying: false,
    reward: 35,
    visualColor: '#1e293b'
  },
  [EnemyType.DARK_MAGE]: {
    type: EnemyType.DARK_MAGE,
    name: "黑暗祭司 (Dark Priest)",
    description: "信奉虛空的墮落施法者，精通黑暗治癒術與抗魔結界。他們不僅能自我恢復，還對魔法攻擊有較高的抵抗力。在戰場上，他們往往躲在重甲單位後方進行支援。建議優先使用物理刺客或長程狙擊將其解決。",
    baseHp: 160, // Reduced from 200
    baseSpeed: 1.0,
    armor: 0.2,
    isFlying: false,
    reward: 30,
    visualColor: '#7c3aed' 
  },
  [EnemyType.GOLEM]: {
    type: EnemyType.GOLEM,
    name: "岩石巨人 (Golem)",
    description: "由岩石與土元素構成的巨大魁儡，核心刻有古老的控制符文。擁有堅不可摧的防禦力與龐大的生命值，如同移動的城牆。牠們不會感到疼痛或恐懼，會堅定地朝目標推進。雖然移動緩慢，但能為身後的魔物抵擋大量傷害。",
    baseHp: 800, // Reduced from 1200
    baseSpeed: 0.4,
    armor: 0.5,
    isFlying: false,
    reward: 60,
    visualColor: '#78350f' 
  },
  [EnemyType.DEMON]: {
    type: EnemyType.DEMON,
    name: "煉獄惡魔 (Demon)",
    description: "來自煉獄深淵的高階惡魔，全身散發著硫磺的氣息。流淌著熔岩的血液賦予牠們強大的破壞力與對火焰的抗性。牠們性格殘暴，享受殺戮的快感。其出現往往象徵著毀滅的開始，是中後期的主要威脅。",
    baseHp: 600, // Reduced from 800
    baseSpeed: 1.2,
    armor: 0.3,
    isFlying: false,
    reward: 50,
    visualColor: '#991b1b' 
  },
  [EnemyType.VOID_LORD]: {
    type: EnemyType.VOID_LORD,
    name: "虛空領主 (Void Lord)",
    description: "【BOSS】虛空維度的統治者，一切災厄的源頭。它的存在本身就在扭曲周圍的空間。擁有深不可測的生命力與防禦，並能無視地形飛行。當虛空領主降臨時，天空將變為紫色，大地將會崩裂。只有最強大的英雄與全副武裝的防線才能有一線生機。",
    baseHp: 3500, // Reduced from 5000
    baseSpeed: 0.5,
    armor: 0.6,
    isFlying: true,
    reward: 500,
    visualColor: '#000000' 
  }
};

// --- Tower Definitions (SIGNIFICANTLY BUFFED AGAIN) ---
export const TOWER_DEFS: Record<TowerType, TowerDef> = {
  [TowerType.BARRACKS]: {
    id: 'barracks',
    type: TowerType.BARRACKS,
    name: '兵營',
    icon: '🛡️',
    t1: { name: '民兵營', damage: 20, range: 200, rate: 1000, cost: 70, description: '訓練3名民兵攔截敵人。', soldierHp: 200, soldierArmor: 0.1 },
    t2: { name: '步兵營', damage: 45, range: 220, rate: 900, cost: 160, description: '士兵裝備更好，生存力大幅提升。', soldierHp: 450, soldierArmor: 0.4 },
    t3Options: [
      { name: '聖騎士大廳', damage: 100, range: 250, rate: 800, cost: 250, description: '高護甲聖騎士，極難被擊殺。', soldierHp: 1000, soldierArmor: 0.8 },
      { name: '野蠻人路口', damage: 160, range: 240, rate: 600, cost: 230, description: '雙斧狂戰士，攻擊力極高。', soldierHp: 600, soldierArmor: 0.2 },
      { name: '刺客公會', damage: 120, range: 260, rate: 500, cost: 240, description: '擁有閃避與致命一擊的刺客。', soldierHp: 500, soldierArmor: 0.3 }
    ]
  },
  [TowerType.ARCHER]: {
    id: 'archer',
    type: TowerType.ARCHER,
    name: '箭塔',
    icon: '🏹',
    t1: { name: '瞭望台', damage: 35, range: 140, rate: 900, cost: 100, description: '發射箭矢，攻速中等。', projectileType: ProjectileType.ARROW },
    t2: { name: '獵人小屋', damage: 80, range: 180, rate: 800, cost: 220, description: '射程更遠，傷害提升。', projectileType: ProjectileType.ARROW },
    t3Options: [
      { name: '火槍手駐地', damage: 600, range: 350, rate: 2000, cost: 400, description: '極遠射程，單發傷害極高，秒殺脆皮。', projectileType: ProjectileType.ARROW },
      { name: '精靈遊俠', damage: 60, range: 220, rate: 150, cost: 380, description: '超高攻速，機關槍般的箭雨。', projectileType: ProjectileType.ARROW },
      { name: '劇毒藤蔓', damage: 100, range: 170, rate: 700, cost: 350, description: '箭矢附帶猛烈毒素。', projectileType: ProjectileType.MAGIC }
    ]
  },
  [TowerType.MAGE]: {
    id: 'mage',
    type: TowerType.MAGE,
    name: '法師塔',
    icon: '🔮',
    t1: { name: '法師塔', damage: 70, range: 130, rate: 1400, cost: 120, description: '發射魔法彈，無視物理護甲。', projectileType: ProjectileType.MAGIC },
    t2: { name: '秘術塔', damage: 150, range: 160, rate: 1300, cost: 260, description: '強大的魔法攻擊，破甲效果顯著。', projectileType: ProjectileType.MAGIC },
    t3Options: [
      { name: '奧術巫師', damage: 400, range: 200, rate: 1800, cost: 500, description: '發射解離射線，瞬間融化敵人。', projectileType: ProjectileType.MAGIC },
      { name: '死靈法師', damage: 140, range: 170, rate: 1000, cost: 450, description: '快速發射暗影彈，並詛咒敵人。', projectileType: ProjectileType.MAGIC },
      { name: '元素召喚', damage: 200, range: 160, rate: 900, cost: 480, description: '召喚土元素重擊地面。', projectileType: ProjectileType.MAGIC }
    ]
  },
  [TowerType.CANNON]: {
    id: 'cannon',
    type: TowerType.CANNON,
    name: '砲塔',
    icon: '💣',
    t1: { name: '矮人火砲', damage: 80, range: 120, rate: 2200, cost: 140, description: '造成範圍爆炸傷害。', projectileType: ProjectileType.BOMB, splashRadius: 70 },
    t2: { name: '重型榴彈砲', damage: 180, range: 150, rate: 2000, cost: 300, description: '更大的爆炸半徑與傷害。', projectileType: ProjectileType.BOMB, splashRadius: 100 },
    t3Options: [
      { name: '特斯拉線圈', damage: 250, range: 170, rate: 1500, cost: 550, description: '連鎖閃電攻擊多個目標。', projectileType: ProjectileType.MAGIC, splashRadius: 120 },
      { name: '貝莎巨砲', damage: 1000, range: 350, rate: 3200, cost: 600, description: '全地圖超遠程支援，毀滅性打擊。', projectileType: ProjectileType.BOMB, splashRadius: 180 },
      { name: '戰鬥機甲', damage: 130, range: 120, rate: 600, cost: 580, description: '快速發射微型導彈風暴。', projectileType: ProjectileType.BOMB, splashRadius: 60 }
    ]
  },
  [TowerType.GOLD_MINE]: {
    id: 'gold_mine',
    type: TowerType.GOLD_MINE,
    name: '金礦',
    icon: '💰',
    t1: { name: '採礦場', damage: 0, range: 0, rate: 4000, cost: 200, description: '定期產出金幣。' },
    t2: { name: '深層礦井', damage: 0, range: 0, rate: 3500, cost: 350, description: '金幣產量增加。' },
    t3Options: [
      { name: '矮人銀行', damage: 0, range: 0, rate: 2500, cost: 600, description: '極高效率產出金幣。' },
      { name: '黑市', damage: 0, range: 0, rate: 3000, cost: 500, description: '產錢並提供隨機Buff。' },
      { name: '寶石工坊', damage: 0, range: 0, rate: 3000, cost: 550, description: '產出魔法寶石（被動傷害）。' }
    ]
  },
  [TowerType.SUPPORT]: {
    id: 'support',
    type: TowerType.SUPPORT,
    name: '圖騰',
    icon: '🗿',
    t1: { name: '部落圖騰', damage: 0, range: 100, rate: 0, cost: 150, description: '提升附近塔的傷害。' },
    t2: { name: '戰爭戰鼓', damage: 0, range: 140, rate: 0, cost: 300, description: '提升附近塔的攻擊範圍。' },
    t3Options: [
      { name: '嗜血圖騰', damage: 0, range: 180, rate: 0, cost: 500, description: '大幅提升周圍攻速。' },
      { name: '恐懼圖騰', damage: 0, range: 180, rate: 0, cost: 550, description: '使周圍敵人恐懼減速。' },
      { name: '靈魂連結', damage: 0, range: 180, rate: 0, cost: 600, description: '均攤傷害並治療士兵。' }
    ]
  }
};

// --- Level Data ---
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "第一章：南方前哨 (South Outpost) - 無盡模式",
    waves: 9999,
    startMoney: 750,
    theme: { background: '#111827', pathColor: '#374151', decorationType: 'FOREST' }, // Darker forest
    paths: [
      // Path 1: Main winding path
      [
        { x: 0, y: 150 }, 
        { x: 100, y: 150 },
        { x: 150, y: 100 },
        { x: 250, y: 100 }, 
        { x: 300, y: 180 },
        { x: 250, y: 300 },
        { x: 400, y: 320 },
        { x: 500, y: 250 }, 
        { x: 600, y: 250 }, 
        { x: 650, y: 150 },
        { x: 800, y: 150 }
      ],
      // Path 2: Bottom Flank (New Branch)
      [
        { x: 0, y: 350 },
        { x: 200, y: 350 },
        { x: 250, y: 300 }, // Merges with main path here
        { x: 400, y: 320 },
        { x: 500, y: 250 }, 
        { x: 600, y: 250 }, 
        { x: 650, y: 150 },
        { x: 800, y: 150 }
      ]
    ],
    buildSlots: [
      { x: 100, y: 220 }, { x: 180, y: 50 },
      { x: 300, y: 50 }, { x: 350, y: 250 },
      { x: 200, y: 250 }, { x: 450, y: 360 },
      { x: 550, y: 180 }, { x: 550, y: 320 },
      { x: 650, y: 80 }, { x: 700, y: 220 },
      { x: 750, y: 80 }, { x: 50, y: 80 },
      { x: 420, y: 150 }, { x: 250, y: 150 },
      { x: 350, y: 150 }, { x: 150, y: 300 }
    ]
  },
  {
    id: 2,
    name: "第二章：塵風峽谷 (Dustwind Canyon) - 無盡模式",
    waves: 9999,
    startMoney: 900,
    theme: { background: '#272018', pathColor: '#574c3d', decorationType: 'DESERT' }, // More contrasting sand
    paths: [
      // Top Path
      [
        { x: 0, y: 80 }, 
        { x: 200, y: 80 }, 
        { x: 300, y: 130 }, 
        { x: 450, y: 130 }, 
        { x: 550, y: 80 },
        { x: 800, y: 80 }
      ],
      // Bottom Path
      [
        { x: 0, y: 320 }, 
        { x: 200, y: 320 },
        { x: 300, y: 270 }, 
        { x: 450, y: 270 },
        { x: 550, y: 320 },
        { x: 800, y: 320 }
      ],
      // Middle Zig-Zag (New Branch)
      [
        { x: 0, y: 200 },
        { x: 150, y: 200 },
        { x: 250, y: 100 }, // Cross to top area
        { x: 450, y: 130 }, // Merge top mid
        { x: 550, y: 250 }, // Cross back down
        { x: 700, y: 320 }, // Merge bottom end
        { x: 800, y: 320 }
      ]
    ],
    buildSlots: [
      { x: 100, y: 40 }, { x: 100, y: 150 },
      { x: 250, y: 60 }, { x: 250, y: 180 },
      { x: 400, y: 60 }, { x: 400, y: 340 },
      { x: 550, y: 40 }, { x: 550, y: 150 },
      { x: 700, y: 40 }, { x: 700, y: 150 },
      { x: 100, y: 250 }, { x: 100, y: 370 },
      { x: 250, y: 350 }, { x: 550, y: 250 },
      { x: 550, y: 370 }, { x: 700, y: 250 },
      { x: 700, y: 370 }, { x: 350, y: 200 }
    ]
  },
  {
    id: 3,
    name: "第三章：冰封要塞 (Frosthold Keep)",
    waves: 9999,
    startMoney: 850,
    theme: { background: '#0c2444', pathColor: '#60a5fa', decorationType: 'SNOW' }, // Deep blue
    paths: [
        // Top entrance
        [
            { x: 0, y: 100 },
            { x: 300, y: 100 },
            { x: 400, y: 200 },
            { x: 800, y: 200 }
        ],
        // Bottom entrance
        [
            { x: 0, y: 300 },
            { x: 300, y: 300 },
            { x: 400, y: 200 },
            { x: 800, y: 200 }
        ],
        // Backdoor flank (New Branch)
        [
            { x: 0, y: 50 },
            { x: 200, y: 50 },
            { x: 500, y: 50 }, // Wide flank top
            { x: 600, y: 150 },
            { x: 600, y: 250 },
            { x: 800, y: 200 } // Merge at end
        ]
    ],
    buildSlots: [
        { x: 150, y: 50 }, { x: 150, y: 150 },
        { x: 150, y: 250 }, { x: 150, y: 350 },
        { x: 350, y: 150 }, { x: 350, y: 250 },
        { x: 500, y: 150 }, { x: 500, y: 250 },
        { x: 650, y: 150 }, { x: 650, y: 250 },
        { x: 300, y: 50 }, { x: 550, y: 80 }
    ]
  },
  {
    id: 4,
    name: "第四章：熔岩煉獄 (Inferno Crater)",
    waves: 9999,
    startMoney: 1000,
    theme: { background: '#2a0a0a', pathColor: '#7f1d1d', decorationType: 'LAVA' }, // Charred ground
    paths: [
        // Outer Ring
        [
            { x: 0, y: 50 },
            { x: 150, y: 50 },
            { x: 150, y: 350 },
            { x: 650, y: 350 },
            { x: 650, y: 50 },
            { x: 800, y: 50 }
        ],
        // Death Road (Short center cut - New Branch)
        [
            { x: 0, y: 150 },
            { x: 100, y: 200 },
            { x: 400, y: 200 }, // Straight through center
            { x: 700, y: 200 },
            { x: 800, y: 150 }
        ]
    ],
    buildSlots: [
        { x: 50, y: 120 }, { x: 250, y: 120 },
        { x: 250, y: 280 }, { x: 400, y: 280 },
        { x: 550, y: 280 }, { x: 550, y: 120 },
        { x: 400, y: 200 }, // Center island
        { x: 400, y: 120 }
    ]
  },
  {
    id: 5,
    name: "第五章：虛空樞紐 (Void Nexus)",
    waves: 9999,
    startMoney: 1200,
    theme: { background: '#020617', pathColor: '#4c1d95', decorationType: 'VOID' }, // Deep violet void
    paths: [
        // Z-Shape (Classic)
        [
            { x: 0, y: 50 },
            { x: 200, y: 50 },
            { x: 400, y: 200 },
            { x: 600, y: 350 },
            { x: 800, y: 350 }
        ],
        // X-Cross Top-Left to Bottom-Right (New)
        [
            { x: 0, y: 100 },
            { x: 300, y: 100 },
            { x: 500, y: 300 },
            { x: 800, y: 300 }
        ],
        // X-Cross Bottom-Left to Top-Right (New)
        [
            { x: 0, y: 300 },
            { x: 300, y: 300 },
            { x: 500, y: 100 },
            { x: 800, y: 100 }
        ]
    ],
    buildSlots: [
        { x: 100, y: 50 }, { x: 300, y: 50 }, { x: 500, y: 50 }, { x: 700, y: 50 },
        { x: 100, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 300 }, { x: 700, y: 300 },
        { x: 200, y: 200 }, { x: 400, y: 200 }, { x: 600, y: 200 },
        { x: 400, y: 100 }, { x: 400, y: 300 }
    ]
  },
  {
    id: 6,
    name: "第六章：毒霧沼澤 (Toxic Swamp)",
    waves: 9999,
    startMoney: 1100,
    theme: { background: '#064e3b', pathColor: '#3f6212', decorationType: 'FOREST' }, // Deep swamp green
    paths: [
        // Serpentine Path
        [
            { x: 0, y: 200 },
            { x: 100, y: 100 },
            { x: 200, y: 300 },
            { x: 300, y: 100 },
            { x: 400, y: 300 },
            { x: 500, y: 100 },
            { x: 600, y: 300 },
            { x: 700, y: 100 },
            { x: 800, y: 200 }
        ]
    ],
    buildSlots: [
        { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 }, 
        { x: 400, y: 200 }, { x: 500, y: 200 }, { x: 600, y: 200 }, { x: 700, y: 200 },
        { x: 150, y: 50 }, { x: 350, y: 50 }, { x: 550, y: 50 }, 
        { x: 250, y: 350 }, { x: 450, y: 350 }, { x: 650, y: 350 }
    ]
  },
  {
    id: 7,
    name: "第七章：黃金廢墟 (Golden Ruins)",
    waves: 9999,
    startMoney: 1300,
    theme: { background: '#422006', pathColor: '#ca8a04', decorationType: 'DESERT' }, // Ancient gold/brown
    paths: [
        // Figure 8 Loop
        [
            { x: 0, y: 100 },
            { x: 200, y: 100 },
            { x: 400, y: 200 }, // Center Cross
            { x: 600, y: 300 },
            { x: 800, y: 300 }
        ],
        [
            { x: 0, y: 300 },
            { x: 200, y: 300 },
            { x: 400, y: 200 }, // Center Cross
            { x: 600, y: 100 },
            { x: 800, y: 100 }
        ]
    ],
    buildSlots: [
        { x: 400, y: 100 }, { x: 400, y: 300 }, // Vertical defense
        { x: 200, y: 200 }, { x: 600, y: 200 }, // Horizontal defense
        { x: 100, y: 50 }, { x: 100, y: 350 },
        { x: 700, y: 50 }, { x: 700, y: 350 },
        { x: 300, y: 150 }, { x: 500, y: 150 },
        { x: 300, y: 250 }, { x: 500, y: 250 }
    ]
  },
  {
    id: 8,
    name: "第八章：嵐之巔 (Storm Summit)",
    waves: 9999,
    startMoney: 1500,
    theme: { background: '#1e1b4b', pathColor: '#818cf8', decorationType: 'VOID' }, // Stormy Blue
    paths: [
        // Top Approach
        [
            { x: 0, y: 50 },
            { x: 400, y: 50 },
            { x: 600, y: 200 },
            { x: 800, y: 200 }
        ],
        // Middle Approach
        [
            { x: 0, y: 200 },
            { x: 300, y: 200 },
            { x: 600, y: 200 },
            { x: 800, y: 200 }
        ],
        // Bottom Approach
        [
            { x: 0, y: 350 },
            { x: 400, y: 350 },
            { x: 600, y: 200 },
            { x: 800, y: 200 }
        ]
    ],
    buildSlots: [
        { x: 200, y: 125 }, { x: 400, y: 125 }, 
        { x: 200, y: 275 }, { x: 400, y: 275 },
        { x: 500, y: 100 }, { x: 500, y: 300 },
        { x: 650, y: 100 }, { x: 650, y: 300 },
        { x: 100, y: 100 }, { x: 100, y: 300 },
        { x: 700, y: 200 }
    ]
  }
];
