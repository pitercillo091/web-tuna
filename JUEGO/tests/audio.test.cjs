'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const Music=require('../src/midi.js'),Songs=require('../src/songs.js'),D=require('../src/data.js'),E=require('../src/engine.js');
let passed=0;function test(name,fn){fn();passed++;console.log('PASS',name);}
for(const song of Songs)test('MIDI válido y copia integrada idéntica: '+song.title,()=>{
 const binary=fs.readFileSync(path.join(__dirname,'..',song.file));assert.deepEqual(binary,Buffer.from(song.bytes,'base64'));
 const a=Music.parse(binary);assert.equal(a.format,1);assert.equal(a.tracks,3);assert.ok(a.melody.length>=60);assert.ok(a.notes.every(n=>Number.isFinite(n.at)&&n.duration>0&&n.pitch>=0&&n.pitch<=127));assert.ok(a.duration>25);
});
test('Parser rechaza recursos incompletos y cabeceras inválidas',()=>{assert.throws(()=>Music.parse(new Uint8Array()));for(const s of Songs){assert.throws(()=>Music.parse(Music.decode(s.bytes).slice(0,35)));}});
test('Todos los objetivos musicales coinciden con ataques del MIDI',()=>{for(const l of D.levels){const g=new E.Game();g.start(l.id);g.begin();g.startRhythm();assert.equal(g.notes.length,l.notes);assert.ok(g.notes.every(n=>Music.get(l.song).melody.some(m=>Math.abs(m.at+3-n.at)<1e-7&&m.pitch===n.pitch)));assert.equal(new Set(g.notes.map(n=>n.lane)).size,l.laneCount);}});
test('Dificultad aumenta con notas, teclas, velocidad y separación mínima',()=>{for(let i=1;i<D.levels.length;i++){const a=D.levels[i-1],b=D.levels[i];assert.ok(b.notes>a.notes&&b.laneCount>=a.laneCount&&b.scrollSpeed>a.scrollSpeed&&b.minGap<a.minGap&&b.threshold>=a.threshold);}});
test('Guardar antiguo conserva resultados y abre sexta canción',()=>{const old={unlocked:4,best:[100,200,300,400,500],stars:[3,2,1,2,3],character:'laud',music:false,volume:.24};const save=E.readSave({getItem:()=>JSON.stringify(old)});assert.equal(save.unlocked,5);assert.deepEqual(save.best.slice(0,5),old.best);assert.deepEqual(save.stars.slice(0,5),old.stars);assert.equal(save.character,'laud');assert.equal(save.music,false);assert.equal(save.volume,.24);assert.equal(save.best.length,10);});
let created=0,stopped=0;
class Context {
 constructor(){this.state='suspended';this.currentTime=0;this.destination={};}
 async resume(){this.state='running';}
 createGain(){return {gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}},connect(){},disconnect(){}};}
 createOscillator(){created++;return {frequency:{value:0},connect(){},disconnect(){},start(){},stop(){stopped++;}};}
}
(async()=>{
 const scope={AudioContext:Context,TunaMusic:Music,TunaSongs:Songs};vm.createContext(scope);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/audio.js'),'utf8'),scope);
 const settings={music:true,effects:true,volume:.5},bus=new scope.TunaAudio(settings);await bus.unlock();assert.equal(bus.ctx.state,'running');
 test('Rotación cubre diez canciones y evita repetición inmediata en 1000 cambios',()=>{let last=null;for(let i=0;i<100;i++){const cycle=[];for(let j=0;j<10;j++){const id=bus.random();assert.notEqual(id,last);last=id;cycle.push(id);}assert.equal(new Set(cycle).size,10);}});
 test('Menú y recogida escogen temas diferentes y mantienen las preferencias',()=>{bus.ambient('menu');const first=bus.track.id;bus.ambient('explore');assert.notEqual(bus.track.id,first);assert.equal(settings.lastSong,bus.track.id);});
 test('Volver de la actuación evita repetición incluso al acabar la bolsa',()=>{bus.bag=['clavelitos'];bus.select('clavelitos');bus.ambient('menu');assert.notEqual(bus.track.id,'clavelitos');});
 test('Todas las canciones generan voces MIDI en Web Audio',()=>{for(const s of Songs){bus.select(s.id,{context:'performance',offset:3});const before=created;for(let t=0;t<3;t+=.05){bus.ctx.currentTime=t;bus.update({phase:'playing',clock:3+t});}assert.ok(created>before);bus.stop();}});
 test('Música y efectos son independientes, con volumen y silencio seguro',()=>{settings.music=false;bus.select(Songs[0].id);let before=created;bus.update({phase:'playing',clock:0});bus.strum();assert.equal(created,before);bus.effect('collect');assert.equal(created,before+3);settings.effects=false;before=created;bus.effect('damage');assert.equal(created,before);bus.volume();assert.ok(stopped>0);});
 test('Pausa para todas las voces y reanuda desde la posición musical correcta',()=>{settings.music=true;bus.select('cielito-lindo',{offset:3});bus.ctx.currentTime=10;bus.update({phase:'playing',clock:5});bus.stop();assert.equal(bus.nodes.size,0);bus.ctx.currentTime=50;bus.update({phase:'playing',clock:5});assert.equal(bus.anchor,48);});
 const noAudio={TunaMusic:Music,TunaSongs:Songs};vm.createContext(noAudio);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/audio.js'),'utf8'),noAudio);const silent=new noAudio.TunaAudio(settings);await silent.unlock();assert.equal(silent.available,false);silent.ambient('menu');silent.update({phase:'menu'});passed++;console.log('PASS Navegador sin AudioContext sigue funcionando');
 console.log(passed+' comprobaciones de MIDI, audio, rotación, sincronía y migración correctas');
})().catch(e=>{console.error(e);process.exitCode=1;});
