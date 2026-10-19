export function segmentDistance(x,y,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1];
 const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export function isBlocked(x,y,world,radius=7){
 if(x<radius||y<radius||x>world.width-radius||y>world.height-radius)return true;
 if(world.obstacles.some(r=>Math.hypot(x-Math.max(r.x,Math.min(x,r.x+r.w)),y-Math.max(r.y,Math.min(y,r.y+r.h)))<radius))return true;
 const onBridge=(world.bridges??[]).some(r=>x>=r.x+radius&&x<=r.x+r.w-radius&&y>=r.y&&y<=r.y+r.h);
 if(onBridge)return false;
 return (world.water??[]).some(r=>r.points.slice(1).some((p,i)=>segmentDistance(x,y,r.points[i],p)<r.width/2+radius));
}
const grids=new WeakMap();
export function clearLine(a,b,world){
 const steps=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/5);
 for(let i=0;i<=steps;i++){const t=steps?i/steps:0;if(isBlocked(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,world))return false;}
 return true;
}
function gridFor(world){
 if(grids.has(world))return grids.get(world);
 const step=24,cols=Math.ceil(world.width/step),rows=Math.ceil(world.height/step),open=new Uint8Array(cols*rows);
 const point=id=>({x:(id%cols)*step+step/2,y:Math.floor(id/cols)*step+step/2});
 for(let id=0;id<open.length;id++){const p=point(id);open[id]=!isBlocked(p.x,p.y,world);}
 const grid={step,cols,rows,open,point};grids.set(world,grid);return grid;
}
export function findRoute(from,to,world,simplify=true){
 if(isBlocked(from.x,from.y,world)||isBlocked(to.x,to.y,world))return null;
 const g=gridFor(world),{step,cols,rows,open,point}=g;
 function nearest(p){
  const cx=Math.floor(p.x/step),cy=Math.floor(p.y/step);let best=-1,distance=Infinity;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
   const x=cx+dx,y=cy+dy,id=y*cols+x;if(x<0||x>=cols||y<0||y>=rows||!open[id])continue;
   const q=point(id),d=Math.hypot(p.x-q.x,p.y-q.y);if(d<distance&&clearLine(p,q,world)){best=id;distance=d;}
  }return best;
 }
 const start=nearest(from),goal=nearest(to);if(start<0||goal<0)return null;
 const prev=new Int32Array(open.length).fill(-1),queue=[start];prev[start]=start;
 for(let head=0;head<queue.length&&prev[goal]<0;head++){
  const id=queue[head],x=id%cols,y=Math.floor(id/cols);
  for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
   if(nx<0||nx>=cols||ny<0||ny>=rows)continue;const n=ny*cols+nx;
   if(!open[n]||prev[n]>=0||!clearLine(point(id),point(n),world))continue;
   prev[n]=id;queue.push(n);
  }
 }
 if(prev[goal]<0)return null;
 const path=[to];for(let id=goal;id!==start;id=prev[id])path.push(point(id));path.push(point(start),from);path.reverse();
 if(!simplify)return path;
 // Remove redundant straight grid segments without cutting corners through blockers.
 const result=[path[0]];let anchor=0;
 while(anchor<path.length-1){let next=anchor+1;while(next+1<path.length&&clearLine(path[anchor],path[next+1],world))next++;result.push(path[next]);anchor=next;}
 return result;
}
