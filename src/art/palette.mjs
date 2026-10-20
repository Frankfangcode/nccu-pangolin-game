// v15 art bible palette. Every sprite colour comes from here, so the whole
// campus reads as one flat, outline-free picture. Shade = same hue, darker.
export const P = {
  grass: '#56ad43', grassDark: '#4a9c3b', grassLight: '#68bd50', tuft: '#46943a', bladeLight: '#74c75a', bladeDark: '#479a39', flowerYellow: '#f4cf3b',
  stone: '#ece2cc', stoneJoint: '#d8cbae', brick: '#d99a6c', brickJoint: '#c4845a',
  asphalt: '#70766f', asphaltDark: '#646a63', paint: '#f4f0e2', curb: '#cfc9b9', curbShade: '#b7b09f',
  leaf: '#4c9a3a', leafDark: '#3b7f30', leafLight: '#66b64c', leafDeep: '#2f6a28', pine: '#2f7a45', pineDark: '#245f37', pineLight: '#3f9558', trunk: '#8a5a3b', trunkDark: '#6e4529',
  bush: '#58a645', bushDark: '#478f38', petal: '#fff4e0', pollen: '#f2c94c', berry: '#e0604f',
  wall: '#f1e8d8', wallShade: '#dccfb8', wallTop: '#f8f3e9', roof: '#56636a', roofDark: '#46525a',
  glass: '#8fd0e0', glassDark: '#6fb3c6', door: '#7c5236', red: '#c9553d', redDark: '#a8432f',
  wood: '#ba7c4c', woodDark: '#905b35', metal: '#3f4a48', metalLight: '#66716e', lamp: '#fff1b8',
  skin1: '#f3c9a3', skin2: '#d9a174', skin3: '#a96b46', hair1: '#3a2a22', hair2: '#6b4126', hair3: '#d9a441',
  shirtRed: '#e45d4c', shirtBlue: '#3f6fb5', shirtYellow: '#f2b84b', shirtGreen: '#5a9c6e', navy: '#2d3a46', jeans: '#4a5f86',
  guard: '#34506b', guardDark: '#263c51', cap: '#22344a',
  pangolin: '#a3693f', pangolinDark: '#7d4c2c', pangolinBelly: '#e3b78d', eye: '#22201c',
  pigeon: '#9aa3ab', pigeonDark: '#78828b', mushroom: '#e8735c', mushroomStem: '#f6ead7', rock: '#a9a99e', rockDark: '#8d8d83',
  leafFall1: '#e6a44a', leafFall2: '#d77a3c', white: '#fffaf0', ink: '#244638',
  // 區域一（正門）實景色：取自 nccu100 的材質色並配合切面亮暗
  sidewalk: '#dccdb5', sidewalkJoint: '#c8b89e', sidewalkSouth: '#d4c6af', road: '#5b6270', roadDark: '#4f5562', roadYellow: '#f2d36b',
  paver: '#c2bfb6', paverJoint: '#aeaba2', paverRing: '#cbc8bf', avenueEdge: '#8f8e88',
  brickRed: '#c9695a', brickRedLight: '#d47a6a', brickRedDark: '#b0574a', brickBase: '#7b3a36', passage: '#4a3530',
  concrete: '#a29e95', concreteTop: '#b9b5ac', concreteDark: '#8c8981', winDark: '#4a5b66', winLight: '#7d98a6',
  granite: '#8c3b3e', graniteLight: '#a14d4f', graniteDark: '#6f2d30', gold: '#e8c57c', badgeBlue: '#2457a4',
  flowerRed: '#d9363c', flowerOrange: '#f08a3c', planter: '#b9ad9a', hedge: '#4f9a48', hedgeTop: '#5fae52', hedgeDark: '#3d7d38',
  cone: '#f0702e', boomRed: '#d8433f', boomYellow: '#f0c43a', bannerRed: '#d8433f', bannerYellow: '#efd54a', poleGrey: '#8f949a',
  water: '#5f8f89', waterLight: '#8cbab3', basin: '#8f8577', basinTop: '#a39886',
  palmFrond: '#4f9a3e', palmFrondLight: '#62b049', palmFrondDark: '#3d7f31', palmTrunk: '#cfc7b8', palmTrunkDark: '#b3aa98', fanTrunk: '#8f7c66',
  // 原本穿山甲遊戲的插畫配色（landscape.mjs、gatehouse-v12、gate-1）：細深描線、亮頂、正面中間調、側面最暗
  outline: '#2f3330', origAsphalt: '#7a807b', origBorder: '#d0cbbb', origStone: '#b9b9a4', origStoneJoint: '#a7a792', origCrossing: '#f4edda',
  glassTeal: '#2f5d63', glassTealLight: '#6fa3a8', frame: '#efe6d6', frameShade: '#d8ccb6',
  brickFront: '#c9695a', brickSide: '#a9544a', brickTop: '#d98a76', concreteFront: '#9a968d', concreteSide: '#85817a', concreteTopLight: '#b4b0a6',
  obeliskFront: '#d9643f', obeliskSide: '#b44f33', obeliskTop: '#ec8a63', plaque: '#f1e3c4', hedgeSide: '#3f8a3e',
  signalGreen: '#52e08a', bowl: '#e9e8e3', bowlShade: '#c9c7bf', lavender: '#9b7fd0', busBlue: '#1f5fae', booth: '#a9d1e3', boothDark: '#86b4c9', boardBlue: '#7aa2c9', boardWood: '#6b4a35',
};
export const SHADOW = 'rgba(24,70,28,0.28)';
export const PALETTE_VALUES = new Set([...Object.values(P), SHADOW]);
