import {isBlocked as blocked,findRoute} from './navigation.mjs';
export const PLAYER_SPEED = 120;
export const PLAYER_RADIUS = 7;

// What a person is doing is drawn above their head, so players can read the
// opening: asleep people see nothing, people on phones only see a short cone.
export const ACTIVITIES = {
  walk:  { range: 1,    half: 0.58, speed: 1 },
  phone: { range: 0.45, half: 0.32, speed: 0.4 },
  nap:   { range: 0,    half: 0,    speed: 0 },
};
export const WAKE_WARNING = 1.2;
export const activityOf = human => (human.mode === 'chase' ? 'walk' : human.activity ?? 'walk');
export function visionOf(human) {
  const a = ACTIVITIES[activityOf(human)] ?? ACTIVITIES.walk;
  return { range: (human.range ?? 115) * a.range, half: a.half };
}
/** True while a nap or phone break is about to end — the icon blinks as a warning. */
export const isWaking = human => activityOf(human) !== 'walk' && (human.activityLeft ?? Infinity) <= WAKE_WARNING;

export function advanceActivities(state, dt) {
  const seconds = Math.min(Math.max(dt, 0), 0.05);
  const humans = state.humans.map(original => {
    if (!original.schedule?.length) return original;
    const human = { ...original };
    if (human.mode === 'chase') return human;
    let index = human.activityIndex ?? 0;
    let left = (human.activityLeft ?? human.schedule[index][1]) - seconds;
    while (left <= 0) {
      index = (index + 1) % human.schedule.length;
      left += human.schedule[index][1];
    }
    human.activityIndex = index;
    human.activityLeft = left;
    human.activity = human.schedule[index][0];
    return human;
  });
  return { ...state, humans };
}


export function createGame(world) {
  return {
    player: { ...world.start, curled: false },
    humans: world.humans.map(human => ({ ...human })),
    completedPranks: [],
    visited: [],
    captureCount: 0,
    won: false,
    status: 'safe',
    awareness: 0,
  };
}

export function stepMovement(state, actions, dt, world) {
  if (actions.curl) return { ...state, player: { ...state.player, curled: true, moving: false } };
  const horizontal = actions.axisX || Number(Boolean(actions.right)) - Number(Boolean(actions.left));
  const vertical = actions.axisY || Number(Boolean(actions.down)) - Number(Boolean(actions.up));
  const magnitude = Math.max(1,Math.hypot(horizontal, vertical));
  const seconds = Math.min(Math.max(dt, 0), 0.05);
  const nextX = Math.max(PLAYER_RADIUS, Math.min(world.width - PLAYER_RADIUS, state.player.x + horizontal / magnitude * PLAYER_SPEED * seconds));
  const x = blocked(nextX, state.player.y, world) ? state.player.x : nextX;
  const nextY = Math.max(PLAYER_RADIUS, Math.min(world.height - PLAYER_RADIUS, state.player.y + vertical / magnitude * PLAYER_SPEED * seconds));
  const y = blocked(x, nextY, world) ? state.player.y : nextY;
  const moving = x !== state.player.x || y !== state.player.y;
  const direction = horizontal ? (horizontal > 0 ? 'east' : 'west') : vertical ? (vertical > 0 ? 'south' : 'north') : state.player.direction ?? 'east';
  return { ...state, player: { ...state.player, x, y, curled: false, moving, direction } };
}

export function isHidden(state, world) {
  if (!state.player.curled) return false;
  return world.bushes.some(({ x, y, w, h }) =>
    state.player.x >= x && state.player.x <= x + w &&
    state.player.y >= y && state.player.y <= y + h
  );
}

export function canHumanSee(human, player, world) {
  if (isHidden({ player }, world)) return false;
  const dx = player.x - human.x;
  const dy = player.y - human.y;
  const distance = Math.hypot(dx, dy);
  const vision = visionOf(human);
  if (distance > vision.range || distance < 0.001) return false;
  const angle = Math.atan2(dy, dx);
  const offset = Math.atan2(Math.sin(angle - human.facing), Math.cos(angle - human.facing));
  if (Math.abs(offset) > vision.half) return false;
  for (let travel = 4; travel < distance; travel += 4) {
    const x = human.x + dx * travel / distance;
    const y = human.y + dy * travel / distance;
    if (world.obstacles.some(rect => x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h)) return false;
  }
  return true;
}

export function advanceHumans(state, dt, world) {
  const seconds = Math.min(Math.max(dt, 0), 0.05);
  const humans = state.humans.map(original => {
    const human = { ...original };
    if (human.mode !== 'route' || human.route.length < 2) return human;
    let target = human.route[human.waypointIndex];
    if (Math.hypot(target.x - human.x, target.y - human.y) < 2) {
      if (human.waypointIndex === human.route.length - 1) human.routeDirection = -1;
      if (human.waypointIndex === 0) human.routeDirection = 1;
      human.waypointIndex += human.routeDirection;
      target = human.route[human.waypointIndex];
    }
    if(human.detour?.length){
      human.detour=[...human.detour];
      while(human.detour.length&&Math.hypot(human.x-human.detour[0].x,human.y-human.detour[0].y)<3)human.detour.shift();
      if(human.detour.length)target=human.detour[0];
    }
    const dx = target.x - human.x,dy = target.y - human.y,distance = Math.hypot(dx,dy);
    if(!distance)return human;
    const pace = ACTIVITIES[activityOf(human)]?.speed ?? 1;
    if (!pace) return human;
    human.facing = Math.atan2(dy,dx);
    const travel = Math.min(distance,(human.speed??56)*pace*seconds);
    const x=human.x+dx/distance*travel,y=human.y+dy/distance*travel;
    if(world&&blocked(x,y,world)){
      human.detour=findRoute(human,human.route[human.waypointIndex],world)?.slice(1)??[];
    }else{human.x=x;human.y=y;}
    return human;
  });
  return { ...state, humans };
}

export function advanceAwareness(state, dt, world) {
  const seconds = Math.min(Math.max(dt, 0), 0.05);
  const humans = state.humans.map(original => {
    const human = { ...original };
    if (human.mode === 'chase') return human;
    if (canHumanSee(human, state.player, world)) {
      human.awareness = Math.min(1, (human.awareness ?? 0) + seconds);
      human.lastSeen = { x: state.player.x, y: state.player.y };
    } else {
      human.awareness = Math.max(0, (human.awareness ?? 0) - seconds * 2);
    }
    if (human.awareness >= 0.999) { human.mode = 'chase'; human.activity = 'walk'; }
    return human;
  });
  const status = humans.some(h => h.mode === 'chase') ? 'chase' : humans.some(h => h.awareness > 0) ? 'alert' : 'safe';
  return { ...state, humans, status, awareness: Math.max(0, ...humans.map(h => h.awareness ?? 0)) };
}

export function advanceChase(state, dt, world) {
  const seconds = Math.min(Math.max(dt, 0), 0.05);
  const humans = state.humans.map(original => {
    const human = { ...original };
    if (human.mode !== 'chase') return human;
    if (canHumanSee(human, state.player, world)) {
      human.searchLeft = 1.5;
      human.lastSeen = { x: state.player.x, y: state.player.y };
    } else human.searchLeft = Math.max(0, (human.searchLeft ?? 1.5) - seconds);
    if (human.searchLeft === 0) {
      human.mode = 'route';
      human.awareness = 0;
      return human;
    }
    const target = human.lastSeen ?? { x: human.x, y: human.y };
    const dx = target.x - human.x;
    const dy = target.y - human.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 0) {
      human.facing = Math.atan2(dy, dx);
      const travel = Math.min(distance, 85 * seconds);
      if (!blocked(human.x + dx / distance * travel, human.y + dy / distance * travel, world)) {
        human.x += dx / distance * travel;
        human.y += dy / distance * travel;
      }
    }
    return human;
  });
  const updated = { ...state, humans, status: humans.some(h => h.mode === 'chase') ? 'chase' : humans.some(h => h.awareness > 0) ? 'alert' : 'safe' };
  if (humans.some(h => h.mode === 'chase' && Math.hypot(h.x - state.player.x, h.y - state.player.y) < 14)) {
    return capturePlayer(updated, world);
  }
  return updated;
}

export function capturePlayer(state, world) {
  return {
    ...state,
    player: { ...world.start, curled: false },
    humans: world.humans.map(human => ({ ...human, mode: 'route', awareness: 0, searchLeft: 0 })),
    captureCount: state.captureCount + 1,
    status: 'safe',
    awareness: 0,
    message: '被人類抓到了！從樹叢再試一次。',
  };
}

export function interact(state, world) {
  if (state.status === 'chase') return state;
  if (state.completedPranks.length === world.pranks.length && world.pranks.length > 0 &&
      Math.hypot(state.player.x - world.start.x, state.player.y - world.start.y) < 32) {
    return { ...state, won: true, message: '太好了！穿山甲安全回到樹叢，搞怪任務完成！' };
  }
  const nearby = world.pranks.find(prank => Math.hypot(prank.x - state.player.x, prank.y - state.player.y) < 28);
  if (!nearby) return state;
  if (state.completedPranks.includes(nearby.id)) return state;
  return { ...state, completedPranks: [...state.completedPranks, nearby.id], message: nearby.message ?? '搞怪成功！' };
}

/** The unfinished prank within reach, if any — opens the close-up instead of completing instantly. */
export function nearbyPrank(state, world) {
  const prank = world.pranks.find(p => Math.hypot(p.x - state.player.x, p.y - state.player.y) < 28);
  return prank && !state.completedPranks.includes(prank.id) ? prank : null;
}
