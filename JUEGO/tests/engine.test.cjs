'use strict';
const assert=require('node:assert/strict');
const {Game,blocked,pathfind,readSave,writeSave}=require('../src/engine.js');
const D=require('../src/data.js');
let passed=0;const outcomes=[];
function test(name,fn){try{fn();passed++;outcomes.push({name,status:'PASS'});console.log('PASS',name);}catch(e){console.error('FAIL',name,e);process.exitCode=1;outcomes.push({name,status:'FAIL',error:e.message});}}
function advance(g,duration,input){for(let t=0;t<duration;t+=1/120)g.tick(Math.min(1/120,duration-t),input);}
function walk(g,x,y,target){g.navigate(x,y,target);let steps=0;while(g.target!==null&&g.phase==='playing'&&steps++<5000)g.tick(1/120);assert.ok(steps<5000,'route must reach target');}
function prepare(g){g.begin();for(const i of g.items)walk(g,i.x,i.y,i.id);assert.equal(g.items.filter(i=>i.collected).length,g.items.length);walk(g,g.stage.x,g.stage.y,'stage');assert.equal(g.mode,'rhythm');}
function perform(g,ratio=1){let index=0;for(const n of g.notes){advance(g,Math.max(0,n.at-g.clock));if(index++/g.notes.length<ratio)g.hit(n.lane);}advance(g,Math.max(0,g.duration-g.clock)+.1);}

test('Ten songs and five canonical characters exist',()=>{assert.equal(D.levels.length,10);assert.equal(D.characters.length,5);assert.equal(new Set(D.characters.map(c=>c.id)).size,5);});
test('Start, brief, movement and diagonal normalization',()=>{const g=new Game();g.start();assert.equal(g.phase,'brief');g.tick(1);assert.equal(g.clock,0);g.begin();const x=g.player.x,y=g.player.y;g.tick(.1,{x:1,y:1});assert.ok(Math.abs(Math.hypot(g.player.x-x,g.player.y-y)-18.5)<.01);});
test('Keyboard cannot cross furniture or map boundaries',()=>{const g=new Game();g.start();g.begin();g.player={x:330,y:338};advance(g,2,{x:1,y:0});assert.ok(g.player.x<=339.1);g.player={x:40,y:440};advance(g,2,{x:-1,y:0});assert.ok(g.player.x>=35);assert.ok(blocked(380,335));});
test('Touch paths avoid all colliders and find every pickup',()=>{for(const l of D.levels){const g=new Game();g.start(l.id);g.begin();for(const item of g.items){const path=pathfind(g.player,item);assert.ok(path.length);path.forEach(p=>assert.equal(blocked(p.x,p.y),false));walk(g,item.x,item.y,item.id);}assert.equal(g.score,100*g.items.length);}});
test('An item is only scored once',()=>{const g=new Game();g.start();g.begin();g.player.x=g.items[0].x;g.player.y=g.items[0].y;g.interact();g.interact();assert.equal(g.score,100);});
test('The stage refuses incomplete equipment',()=>{const g=new Game();g.start();g.begin();g.player={...g.stage};g.interact();assert.equal(g.mode,'explore');assert.match(g.flash.text,/falta/);});
test('Pause freezes movement, clock, health and notes',()=>{const g=new Game();g.start();prepare(g);advance(g,2);g.pause();const before=JSON.stringify(g.stats());advance(g,20);g.hit(0);assert.equal(JSON.stringify(g.stats()),before);g.resume();advance(g,.2);assert.ok(g.clock>2);});
test('Time limit causes defeat and retry resets everything',()=>{const g=new Game();g.start();g.begin();advance(g,106);assert.equal(g.phase,'defeat');g.retry();assert.equal(g.phase,'brief');assert.equal(g.health,100);assert.equal(g.score,0);assert.equal(g.items.some(i=>i.collected),false);});
test('Moving puddles inflict damage with immunity between collisions',()=>{const g=new Game();g.start(4);g.begin();g.tick(.01);g.player={x:g.hazards[0].x,y:g.hazards[0].y};g.tick(.01);assert.equal(g.health,88);g.tick(.01);assert.equal(g.health,88);assert.ok(g.invulnerable>0);});
test('Perfect notes score and combos increase rewards',()=>{const g=new Game();g.start(9);prepare(g);perform(g);assert.equal(g.phase,'victory');assert.equal(g.perfects,72);assert.equal(g.bestCombo,72);assert.ok(g.score>72*120+500);});
test('Good timing is accepted inside the calm hit window',()=>{const g=new Game();g.start();prepare(g);const n=g.notes[0];advance(g,n.at+.18);g.hit(n.lane);assert.equal(g.hits,1);assert.equal(g.perfects,0);assert.equal(n.result,'good');});
test('Wrong lanes and expired notes reset the combo',()=>{const g=new Game();g.start();prepare(g);advance(g,g.notes[0].at);g.hit((g.notes[0].lane+1)%4);assert.equal(g.hits,0);advance(g,.3);assert.equal(g.misses,1);assert.equal(g.combo,0);});
test('Missing a song causes defeat',()=>{const g=new Game();g.start();prepare(g);advance(g,g.duration+.1);assert.equal(g.phase,'defeat');assert.equal(g.hits,0);});
test('Health depletion causes defeat',()=>{const g=new Game();g.start();g.begin();g.health=0;g.tick(.01);assert.equal(g.phase,'defeat');});
test('All ten songs are completed in order in BOTH difficulties',()=>{for(const easy of [true,false]){const g=new Game({easy});g.start();let previous=0;for(let i=0;i<10;i++){assert.equal(g.level,i);prepare(g);perform(g);assert.equal(g.phase,i===9?'victory':'result');assert.ok(g.total>previous);previous=g.total;if(i<9)g.next();}assert.equal(g.level,9);assert.ok(g.total>45000);}});
test('Retry after success does not duplicate the campaign score',()=>{const g=new Game();g.start();prepare(g);perform(g);g.retry();assert.equal(g.total,0);prepare(g);perform(g);assert.equal(g.total,g.score);});
test('Stars and unlocks save and reload',()=>{let value=null;const s={getItem:()=>value,setItem:(_k,v)=>{value=v;}};const save=readSave(s);save.unlocked=4;save.best[3]=5000;save.music=false;save.volume=.23;assert.equal(writeSave(s,save),true);assert.deepEqual(readSave(s),save);});
test('Broken or hostile saves are sanitized',()=>{const s={getItem:()=>'{broken'};assert.equal(readSave(s).unlocked,0);s.getItem=()=>JSON.stringify({unlocked:99,volume:30,character:'nonexistent',best:[-2,'bad',null],stars:[8]});const saved=readSave(s);assert.equal(saved.unlocked,9);assert.equal(saved.volume,1);assert.equal(saved.character,'bandurria');assert.deepEqual(saved.best,Array(10).fill(0));assert.equal(saved.stars[0],3);});
test('Unavailable storage does not stop play',()=>{const s={getItem(){throw Error();},setItem(){throw Error();}};const saved=readSave(s);assert.equal(saved.unlocked,0);assert.equal(writeSave(s,saved),false);const g=new Game();g.start();g.begin();assert.equal(g.phase,'playing');});
test('A blocked destination returns safely without trapping the player',()=>{assert.deepEqual(pathfind({x:100,y:440},{x:390,y:335}),[]);});
console.log(`${passed}/${outcomes.length} tests passed`);
if(process.argv.includes('--report'))require('node:fs').writeFileSync(require('node:path').join(__dirname,'engine-results.json'),JSON.stringify({date:'2026-10-03',passed,total:outcomes.length,outcomes},null,2));
