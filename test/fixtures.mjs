export function makeWorld(overrides = {}) {
  return {
    width: 400,
    height: 300,
    start: { x: 50, y: 50 },
    obstacles: [],
    bushes: [],
    humans: [],
    pranks: [],
    ...overrides,
  };
}
