// 區域一：正門 → 校門內廣場 → 校門大道 → 噴水池。
// 座標與尺寸取自 wenzhotw/nccu100（src/world/buildings/main-gate、terrain/ground.js、
// avenue.js、fountain.js、vegetation.js、layout.js）。單位公尺；x 越大越東，
// z 越小越往校園裡面（北）。z > 18 是指南路。
const bdZ = x => (x < 0 ? -12.8 : -12.8 + 0.12 * x); // 八德道中心線

const bollards = [];
for (const x of [-6.6, 6.6]) for (let z = -1; z > -46; z -= 3.5) {
  if (Math.abs(z - bdZ(x)) < 3.2 || Math.abs(z + 32) < 11 || [-4, -20, -44].some(q => Math.abs(q - z) < 1)) continue;
  bollards.push({ type: 'bollard', x, z });
}

export const MAIN_GATE = {
  id: 'main-gate',
  name: '正門到噴水池',
  bounds: { x0: -46, x1: 46, z0: -47, z1: 39 }, // z0 北緣，z1 南緣
  spawn: { x: 0, z: 30 },
  ground: [
    // 指南路二段與兩側人行道
    { type: 'rect', x0: -60, x1: 60, z0: 32, z1: 39, fill: 'sidewalkSouth' },
    { type: 'rect', x0: -60, x1: 60, z0: 18, z1: 32, fill: 'road' },
    { type: 'dashes', z: 25, from: -60, to: 60, every: 6, len: 3, gap: [-7, 7], fill: 'paint' },
    { type: 'rect', x0: -60, x1: 60, z0: 24.62, z1: 24.78, fill: 'roadYellow' },
    { type: 'rect', x0: -60, x1: 60, z0: 25.22, z1: 25.38, fill: 'roadYellow' },
    { type: 'zebra', x0: -4.5, x1: 4.5, z0: 18.8, z1: 31.5, step: 1, bar: .5, skip: [24.6, 25.4] },
    { type: 'roadText', text: '慢慢', x: -7.5, z: 20.2 },
    { type: 'curb', x0: -60, x1: 60, z: 18.05 },
    { type: 'rect', x0: -60, x1: 60, z0: 12.6, z1: 18, fill: 'sidewalk', joints: 1.8 },
    // 校門內灰色石磚廣場、停車格
    { type: 'rect', x0: -17, x1: 17, z0: -2, z1: 12.6, fill: 'paver', joints: 1 },
    { type: 'rect', x0: -18.1, x1: -11.1, z0: .4, z1: 6.8, fill: 'asphalt' },
    ...[.5, 2.4, 4.3, 6.2].map(z => ({ type: 'rect', x0: -17.9, x1: -11.3, z0: z - .05, z1: z + .05, fill: 'paint' })),
    // 校門大道（12 公尺寬石磚）與兩側收邊
    { type: 'rect', x0: -6, x1: 6, z0: -48, z1: -2, fill: 'paver', joints: 1 },
    { type: 'rect', x0: -6.25, x1: -5.95, z0: -48, z1: -2, fill: 'avenueEdge' },
    { type: 'rect', x0: 5.95, x1: 6.25, z0: -48, z1: -2, fill: 'avenueEdge' },
    // 八德道（4.4 公尺寬）與大道上的斑馬線
    { type: 'road', from: -60, to: 60, z: bdZ, width: 4.4 },
    { type: 'zebraX', x0: -4.5, x1: 4.6, z: bdZ(0), depth: 3.6 },
    // 噴水池前的橫向步道與圓形廣場
    { type: 'rect', x0: -24, x1: 24, z0: -34.2, z1: -29.8, fill: 'paver', joints: 1 },
    { type: 'circle', x: 0, z: -32, r: 10.5, fill: 'paverRing' },
  ],
  objects: [
    // 正門：紅磚門房（含混凝土大屋簷）、中央警衛亭、安全島、柵欄機
    { type: 'gatehouse', cx: -10, dir: -1 }, { type: 'gatehouse', cx: 10, dir: 1 },
    { type: 'booth', x: 2.6, z: 10.5 },
    { type: 'island', x0: 1.8, x1: 3.4, z0: 2.1, z1: 9.1 },
    { type: 'barrier', x: 1.0, z: 8.7, dir: -1, len: 6.6 }, { type: 'barrier', x: 4.2, z: 8.7, dir: 1, len: 2.1 },
    ...[[4.6, 13.4], [5.4, 13.2], [6.2, 13.4], [-4.8, 13.4], [2.6, 1.5]].map(([x, z]) => ({ type: 'cone', x, z })),
    // 校名碑、英文矮牆、花台
    { type: 'obelisk', x: -19, z: 13.4 },
    { type: 'nameWall', x0: -18.2, x1: -8.6, z: 15.2 },
    { type: 'flowerBed', x0: -22.5, x1: -7.5, z0: 15.7, z1: 16.9 },
    { type: 'coneShrub', x: -22, z: 16.3 }, { type: 'coneShrub', x: -20.6, z: 16.3 },
    { type: 'trafficLight', x: -24.5, z: 17.5 },
    // 圍籬綠籬
    { type: 'hedge', x0: -46, x1: -24.5, z: 12 }, { type: 'hedge', x0: 13.6, x1: 48, z: 12 },
    ...[9.2, 10.8, 12.4].map(x => ({ type: 'shrub', x, z: 15.3 })),
    // 廣場小物：白色盆栽、校旗燈桿、指示牌、布告欄
    ...[[9, .5], [5.6, 1.2], [-3.4, .6]].map(([x, z]) => ({ type: 'bowl', x, z })),
    { type: 'bannerPole', x: -5.4, z: 3.2 },
    { type: 'noticeBoard', x: -10.4, z: 7.6 },
    // 大道：校旗燈桿、短柱、導覽圖
    ...[-4, -20, -44].flatMap(z => [-6.8, 6.8].map(x => ({ type: 'bannerPole', x, z }))),
    ...bollards,
    { type: 'mapBoard', x: -9.6, z: -21.5 },
    // 噴水池
    { type: 'fountain', x: 0, z: -32, r: 5.6 },
    // 原本遊戲的黑貓：在校門內的樹下等你（v13 任務起點）
    { type: 'cat', x: -4.4, z: -.4 },
    // 指南路：公車站、機車
    { type: 'busStop', x: 27, z: 17.4 },
    ...Array.from({ length: 6 }, (_, i) => ({ type: 'scooter', x: -38 + i * 1.3, z: 14.6, colour: i })),
    // 樹
    ...[-42, -30, 30, 42].map(x => ({ type: 'tree', x, z: 16.9, s: .95 })),
    ...[[-36, 7.5], [-29, 7.5], [-21.5, 7.3], [10, -5], [-10.5, -24.5], [10.5, -24.5], [-10.5, -39.5], [10.5, -39.5], [-7.4, -1.6], [12.6, 1.5], [15.5, -1.2]].map(([x, z], i) => ({ type: 'tree', x, z, s: .9 + (i % 3) * .1 })),
    ...Array.from({ length: 11 }, (_, i) => ({ type: 'tree', x: -55 + i * 11, z: 37, s: .9 })),
    ...[-1, 1].flatMap(s => [
      ...[[15, -22.5], [21, -23], [15, -41.5], [21, -41]].map(([x, z]) => ({ type: 'palm', x: s * x, z })),
      ...[[17.5, -27.5], [17.5, -36.5]].map(([x, z]) => ({ type: 'fanPalm', x: s * x, z })),
    ]),
  ],
  people: [
    { look: 'guard', x: 2.6, z: 12.4, habit: 'nap', dir: 'south' },
    { look: 'student', route: [[-2.5, -44], [-2.5, 6]], speed: 1.1, habit: 'phone' },
    { look: 'jogger', route: [[-44, 15.6], [44, 15.6]], speed: 2.4 },
    { look: 'reader', route: [[18, -32], [-18, -32]], speed: .9 },
  ],
  pigeons: [[2, -21], [3, -22], [-1.5, -23], [-3, -6], [8, 3]],
};
