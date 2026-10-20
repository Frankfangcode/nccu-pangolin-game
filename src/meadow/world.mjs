// 溪邊篇：醉夢溪旁的野餐草地。一塊小而密的區域，每樣東西都能互動。
// 單位是遊戲世界單位（穿山甲身長約 85）。北邊是溪，西南角是穿山甲的洞穴。
const PI = Math.PI, SOUTH = PI / 2, NORTH = -PI / 2, EAST = 0, WEST = PI;

const person = (id, look, x, y, schedule, faces, extra = {}) => ({
  id, look, x, y, facing: faces[0], faces, range: 150, route: [{ x, y }, { x, y }], waypointIndex: 0, routeDirection: 1,
  mode: 'route', awareness: 0, searchLeft: 0, speed: 46, schedule, activityIndex: 0, activityLeft: schedule[0][1], activity: schedule[0][0], ...extra,
});

export const MEADOW = {
  id: 'meadow',
  name: '醉夢溪野餐草地',
  width: 2400,
  height: 1500,
  start: { x: 230, y: 1300 },
  den: { x: 200, y: 1320 },
  // 醉夢溪：一條穿過北邊的溪；碼頭伸進水裡可以走
  water: [{ points: [[-100, 150], [600, 190], [1200, 150], [1800, 200], [2500, 160]], width: 230 }],
  bridges: [{ x: 1650, y: 120, w: 130, h: 220 }],
  path: [[230, 1300], [520, 1120], [820, 930], [1180, 960], [1520, 1040], [1880, 1080], [2350, 1120]],
  bushes: [
    { x: 380, y: 1150, w: 96, h: 74 }, { x: 980, y: 1180, w: 96, h: 74 }, { x: 560, y: 520, w: 96, h: 74 },
    { x: 1330, y: 640, w: 96, h: 74 }, { x: 2010, y: 640, w: 96, h: 74 }, { x: 2140, y: 1260, w: 96, h: 74 },
    { x: 1700, y: 1300, w: 96, h: 74 },
  ],
  trees: [[120, 520], [320, 360], [1000, 380], [1460, 330], [2240, 380], [2320, 820], [80, 900], [1240, 1380], [760, 1400], [1950, 1420]].map(([x, y]) => ({ x, y })),
  // 野餐墊、烤架、冷藏箱、帳篷、垃圾桶：可以偷或翻的地方
  props: [
    { type: 'blanket', id: 'blanketA', x: 800, y: 640, w: 240, h: 150, colour: 'red' },
    { type: 'blanket', id: 'blanketB', x: 1500, y: 900, w: 200, h: 130, colour: 'blue' },
    { type: 'tent', x: 1180, y: 520, w: 210, h: 130 },
    { type: 'grill', x: 1960, y: 960 },
    { type: 'cooler', x: 2190, y: 990 },
    { type: 'bucket', x: 1700, y: 380 },
    { type: 'trash', x: 610, y: 990 },
    { type: 'sign', x: 420, y: 1420, text: '醉夢溪野餐區' },
  ],
  // 會被偷的東西：主人、位置、多久補貨（秒）
  spots: [
    { id: 'chicken', item: 'chicken', x: 790, y: 625, owner: 'napper', respawn: 50 },
    { id: 'boba', item: 'boba', x: 850, y: 610, owner: 'phoneGirl', respawn: 45 },
    { id: 'sandwich', item: 'sandwich', x: 1530, y: 885, owner: 'reader', respawn: 45 },
    { id: 'sausage', item: 'sausage', x: 1960, y: 940, owner: 'griller', respawn: 35 },
    { id: 'yakult', item: 'yakult', x: 2190, y: 970, owner: 'griller', respawn: 40 },
    { id: 'fish', item: 'fish', x: 1700, y: 370, owner: 'fisher', respawn: 55 },
  ],
  trash: { x: 610, y: 1000 },
  anthills: [{ id: 'ant0', x: 470, y: 820 }, { id: 'ant1', x: 1140, y: 1270 }, { id: 'ant2', x: 2260, y: 560 }],
  cat: { x: 330, y: 1220 },
  ducks: [[700, 170], [760, 200], [1300, 160]],
  humans: [
    person('napper', 'student', 740, 650, [['nap', 9], ['walk', 3.5]], [SOUTH, WEST, EAST]),
    person('phoneGirl', 'reader', 880, 660, [['phone', 7], ['walk', 3]], [SOUTH, EAST, WEST]),
    person('reader', 'jogger', 1440, 905, [['phone', 6], ['walk', 4]], [WEST, SOUTH, EAST]),
    person('fisher', 'guard', 1715, 230, [['walk', 8], ['phone', 3]], [NORTH, NORTH, SOUTH]),
    { ...person('griller', 'student', 1910, 990, [['walk', 6], ['phone', 4]], [EAST]), route: [{ x: 1910, y: 1000 }, { x: 2130, y: 1010 }], speed: 40 },
  ],
  pranks: [],
};

// 不能走的地方：帳篷、烤架、冷藏箱、垃圾桶、樹幹、牌子
MEADOW.obstacles = [
  { x: 1080, y: 470, w: 200, h: 90 },
  { x: 1935, y: 932, w: 50, h: 26 }, { x: 2160, y: 955, w: 60, h: 26 },
  { x: 595, y: 985, w: 30, h: 22 }, { x: 405, y: 1405, w: 30, h: 20 },
  ...MEADOW.trees.map(t => ({ x: t.x - 10, y: t.y - 8, w: 20, h: 14 })),
];
