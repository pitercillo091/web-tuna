(function (root) {
  'use strict';
  const D = typeof module !== 'undefined' && module.exports ? require('./data.js') : root.TunaData;
  const Music = typeof module !== 'undefined' && module.exports ? require('./midi.js') : root.TunaMusic;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const positions = [[230,390],[465,245],[680,420],[330,480],[710,210]];
  const obstacles = [{x:355,y:315,w:100,h:55},{x:580,y:320,w:80,h:50}];
  function blocked(x,y) { return x<35 || x>925 || y<205 || y>505 || obstacles.some(o=>x>o.x-16&&x<o.x+o.w+16&&y>o.y-13&&y<o.y+o.h+13); }
  // Small grid A*: touch navigation obeys the same collision map as keyboard movement.
  function pathfind(from,to) {
    const cell = 20, key = p => `${p.x},${p.y}`;
    const start = {x:Math.round(from.x/cell),y:Math.round(from.y/cell)};
    const end = {x:Math.round(to.x/cell),y:Math.round(to.y/cell)};
    if(blocked(end.x*cell,end.y*cell)) return [];
    const open=[start], previous=new Map(), costs=new Map([[key(start),0]]), done=new Set();
    let current;
    for(let step=0;open.length&&step<1600;step++) {
      open.sort((a,b)=>(costs.get(key(a))+Math.abs(a.x-end.x)+Math.abs(a.y-end.y))-(costs.get(key(b))+Math.abs(b.x-end.x)+Math.abs(b.y-end.y)));
      current=open.shift();const ck=key(current);
      if(current.x===end.x&&current.y===end.y) {
        const result=[{x:to.x,y:to.y}];
        while(previous.has(key(current))) {result.unshift({x:current.x*cell,y:current.y*cell});current=previous.get(key(current));}
        return result;
      }
      done.add(ck);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const n={x:current.x+dx,y:current.y+dy},nk=key(n),cost=costs.get(ck)+1;
        if(blocked(n.x*cell,n.y*cell)||done.has(nk))continue;
        if(!costs.has(nk)||cost<costs.get(nk)) {costs.set(nk,cost);previous.set(nk,current);if(!open.some(p=>key(p)===nk))open.push(n);}
      }
    }
    return [];
  }
  class Game {
    constructor(options={}) { this.character=options.character||'bandurria'; this.easy=options.easy!==false; this.events=[]; this.total=0; this.phase='menu'; this.level=0; this.clock=0; }
    emit(type, details={}) { this.events.push({type,...details}); }
    drain() { return this.events.splice(0); }
    start(level=0) { this.total=0;this.load(level); }
    load(level) {
      this.level=clamp(level,0,D.levels.length-1); this.config=D.levels[this.level];this.phase='brief'; this.mode='explore';this.clock=0;this.health=100;this.remaining=this.config.time;
      this.score=0;this.combo=0;this.bestCombo=0;this.hits=0;this.perfects=0;this.misses=0;this.lastHit=-10;this.invulnerable=0;this.flash=null;this.path=[];this.target=null;
      this.player={x:105,y:440,face:1,moving:false};this.items=this.config.items.map((type,i)=>({id:i,type,x:positions[i][0],y:positions[i][1],collected:false}));
      this.stage={x:835,y:245};this.hazards=Array.from({length:this.config.hazards},(_,i)=>({x:0,y:0,index:i,r:22}));this.notes=[];this.emit('load');
    }
    begin() { if(this.phase==='brief'){this.phase='playing';this.emit('begin');} }
    pause() { if(this.phase==='playing'){this.phase='paused';this.path=[];this.emit('pause');} }
    resume() { if(this.phase==='paused'){this.phase='playing';this.emit('resume');} }
    navigate(x,y,target=null) { if(this.phase!=='playing'||this.mode!=='explore')return;this.path=pathfind(this.player,{x:clamp(x,40,920),y:clamp(y,210,500)});this.target=target; }
    interact() {
      if(this.phase!=='playing'||this.mode!=='explore')return;
      const item=this.items.find(i=>!i.collected&&distance(i,this.player)<58);
      if(item){item.collected=true;this.score+=100;this.flash={text:'+100 · ¡A la ronda!',kind:'good',life:1.2};this.emit('collect',{item});return;}
      if(distance(this.stage,this.player)<75) {
        if(this.items.every(i=>i.collected))this.startRhythm();
        else {this.flash={text:'Aún falta equipo por recoger',kind:'miss',life:1.8};this.emit('notice');}
      }
    }
    startRhythm() {
      this.mode='rhythm';this.clock=0;this.combo=0;this.lastHit=-10;this.health=Math.max(this.health,75);this.path=[];
      const song=Music.get(this.config.song);this.beat=60/this.config.bpm;this.musicOffset=3;this.laneCount=this.config.laneCount;
      // Every target is a real melody onset in the MIDI, never a synthetic grid.
      const chosen=[];let last=-10;
      for(const n of song.melody){if(n.at-last+1e-6<this.config.minGap)continue;chosen.push(n);last=n.at;if(chosen.length>=this.config.notes)break;}
      this.notes=chosen.map((n,i)=>({id:i,lane:i<this.laneCount?i:(n.pitch+Math.floor(i/this.laneCount)+this.level)%this.laneCount,at:this.musicOffset+n.at,pitch:n.pitch,duration:n.duration,judged:false,sounded:false}));
      this.duration=this.notes[this.notes.length-1].at+Math.max(2,this.notes[this.notes.length-1].duration);this.emit('rhythm');
    }
    hit(lane) {
      if(this.phase!=='playing'||this.mode!=='rhythm'||!Number.isInteger(lane)||lane<0||lane>=this.laneCount||this.clock-this.lastHit<.065)return;
      this.lastHit=this.clock;
      const window=this.easy?.23:.16;
      const nearest=this.notes.filter(n=>!n.judged&&n.lane===lane&&Math.abs(n.at-this.clock)<=window).sort((a,b)=>Math.abs(a.at-this.clock)-Math.abs(b.at-this.clock))[0];
      if(!nearest){ if(this.clock<2)return;this.combo=0;this.health=Math.max(0,this.health-2);this.flash={text:'Un poco antes o después…',kind:'miss',life:.55};this.emit('wrong',{lane});return; }
      const perfect=Math.abs(nearest.at-this.clock)<(this.easy?.11:.075);nearest.judged=true;nearest.result=perfect?'perfect':'good';
      this.hits++;this.perfects+=perfect?1:0;this.combo++;this.bestCombo=Math.max(this.bestCombo,this.combo);this.health=clamp(this.health+1.6,0,100);
      const earned=Math.round((perfect?120:80)*(1+Math.min(3,Math.floor(this.combo/8))*.25));this.score+=earned;
      this.flash={text:perfect?'¡Clavado!':'¡A compás!',kind:perfect?'perfect':'good',life:.55};this.emit('hit',{lane,earned,perfect});
    }
    tick(dt,input={x:0,y:0}) {
      if(this.phase!=='playing')return;
      dt=clamp(Number.isFinite(dt)?dt:0,0,.1);this.clock+=dt;this.invulnerable=Math.max(0,this.invulnerable-dt);if(this.flash){this.flash.life-=dt;if(this.flash.life<=0)this.flash=null;}
      if(this.mode==='explore') {
        this.remaining-=dt;let mx=input.x||0,my=input.y||0;
        if(mx||my){this.path=[];this.target=null;}
        else if(this.path.length){const p=this.path[0],d=distance(p,this.player);if(d<5)this.path.shift();else {mx=(p.x-this.player.x)/d;my=(p.y-this.player.y)/d;}}
        const length=Math.hypot(mx,my);this.player.moving=length>.01;
        if(length){mx/=length;my/=length;const speed=this.easy?185:195;const nx=this.player.x+mx*speed*dt,ny=this.player.y+my*speed*dt;if(!blocked(nx,this.player.y))this.player.x=nx;if(!blocked(this.player.x,ny))this.player.y=ny;if(mx)this.player.face=Math.sign(mx);}
        if(!this.path.length&&this.target!==null){const target=this.target;this.target=null;if(target==='stage'||Number.isInteger(target))this.interact();}
        this.hazards.forEach((h,i)=>{h.x=190+i*165+Math.sin(this.clock*(.8+i*.13)+i*2)*115;h.y=300+Math.cos(this.clock*.65+i*1.7)*90;if(!this.invulnerable&&distance(h,this.player)<h.r+13){this.health-=this.easy?12:18;this.invulnerable=1.5;this.combo=0;this.flash={text:'¡Ojo con el charco!',kind:'miss',life:1};this.emit('damage');}});
        if(this.remaining<=0)this.fail('Se nos ha hecho tarde. El público ya pregunta por la Tuna.');
      } else {
        const window=this.easy?.23:.16;
        this.notes.forEach(n=>{if(!n.sounded&&n.at<=this.clock+.06){n.sounded=true;this.emit('note',{pitch:n.pitch,delay:Math.max(0,n.at-this.clock)});}if(!n.judged&&this.clock>n.at+window){n.judged=true;n.result='miss';this.misses++;this.combo=0;this.health-=this.easy?3.5:5;this.flash={text:'Se escapó una nota',kind:'miss',life:.55};this.emit('miss',{lane:n.lane});}});
        if(this.clock>=this.duration){if(this.hits/this.notes.length>=this.config.threshold&&this.health>0)this.finish();else this.fail('La plaza quiere más compás. Prueba otra vez siguiendo la línea dorada.');}
      }
      if(this.health<=0&&this.phase==='playing')this.fail('La ronda necesita recuperar el aliento.');
    }
    fail(reason) { if(this.phase!=='playing')return;this.phase='defeat';this.reason=reason;this.path=[];this.emit('defeat'); }
    finish() { if(this.phase!=='playing')return;this.bonus=Math.round(Math.max(0,this.remaining)*5);this.score+=this.bonus;this.total+=this.score;this.phase=this.level===D.levels.length-1?'victory':'result';this.emit(this.phase); }
    next() { if(this.phase==='result')this.load(this.level+1); }
    retry() { const wasComplete=this.phase==='result'||this.phase==='victory';if(wasComplete)this.total-=this.score;this.load(this.level); }
    stats() {return {level:this.level,phase:this.phase,mode:this.mode,score:this.score,total:this.total,health:this.health,time:this.remaining,collected:this.items?.filter(i=>i.collected).length||0,hits:this.hits,notes:this.notes?.length||0,combo:this.combo};}
  }
  function readSave(storage) {
    let saved={};try{saved=JSON.parse(storage.getItem('rondalla-una-ronda-mas-v1')||'{}')||{};}catch{}
    const valid= n=>Number.isFinite(n)&&n>=0;
    const size=D.levels.length;
    // Keep the original storage key, scores, character and preferences. An old
    // completed five-stage campaign opens song six; no existing result is lost.
    const unlocked=saved.version!==2&&saved.stars?.[4]>0?5:saved.unlocked;
    return {version:2,unlocked:clamp(Number.isInteger(unlocked)?unlocked:0,0,size-1),best:Array.from({length:size},(_,i)=>valid(saved.best?.[i])?Math.floor(saved.best[i]):0),stars:Array.from({length:size},(_,i)=>clamp(Number.isInteger(saved.stars?.[i])?saved.stars[i]:0,0,3)),character:D.characters.some(c=>c.id===saved.character)?saved.character:'bandurria',easy:saved.easy!==false,music:saved.music!==false,effects:saved.effects!==false,volume:valid(saved.volume)?clamp(saved.volume,0,1):.45,lastSong:typeof saved.lastSong==='string'?saved.lastSong:null};
  }
  function writeSave(storage,save) {try{storage.setItem('rondalla-una-ronda-mas-v1',JSON.stringify(save));return true;}catch{return false;}}
  const exports={Game,blocked,pathfind,readSave,writeSave,obstacles,clamp};
  if(typeof module!=='undefined'&&module.exports)module.exports=exports;else root.TunaEngine=exports;
})(typeof globalThis!=='undefined'?globalThis:this);
