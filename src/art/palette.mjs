// v15 art bible palette. Every sprite colour comes from here, so the whole
// campus reads as one flat, outline-free picture. Shade = same hue, darker.
export const P = {
  grass: '#6cb54a', grassDark: '#5fa641', grassLight: '#7cc25a', tuft: '#4e9536',
  stone: '#ece2cc', stoneJoint: '#d8cbae', brick: '#d99a6c', brickJoint: '#c4845a',
  asphalt: '#70766f', asphaltDark: '#646a63', paint: '#f4f0e2', curb: '#cfc9b9', curbShade: '#b7b09f',
  leaf: '#4f9a3c', leafDark: '#3f8433', leafLight: '#68b34e', trunk: '#8a5a3b', trunkDark: '#6e4529',
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
};
export const SHADOW = 'rgba(28,62,30,0.2)';
export const PALETTE_VALUES = new Set([...Object.values(P), SHADOW]);
