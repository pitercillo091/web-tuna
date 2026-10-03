(function(root){
  'use strict';
  // SMF 0/1 reader: running status, tempo maps, paired notes, safe bounds.
  function parse(input){
    const b=input instanceof Uint8Array?input:new Uint8Array(input);let p=0;
    const need=n=>{if(p+n>b.length)throw Error('MIDI truncado');};
    const byte=()=>{need(1);return b[p++];};
    const u16=()=>byte()*256+byte(),u32=()=>byte()*16777216+byte()*65536+byte()*256+byte();
    const tag=()=>String.fromCharCode(byte(),byte(),byte(),byte());
    const vlq=()=>{let n=0;for(let i=0;i<4;i++){const v=byte();n=n*128+(v&127);if(v<128)return n;}throw Error('Delta MIDI inválido');};
    if(b.length>2_000_000||tag()!=='MThd')throw Error('Cabecera MIDI inválida');
    const header=u32(),format=u16(),tracks=u16(),division=u16();
    if(header<6||format>1||!tracks||tracks>64||!division||(division&0x8000))throw Error('Formato MIDI no compatible');
    need(header-6);p+=header-6;
    const events=[],tempos=[{tick:0,us:500000}],programs=new Map();let endTick=0;
    for(let track=0;track<tracks;track++){
      if(tag()!=='MTrk')throw Error('Pista MIDI inválida');const len=u32();need(len);const end=p+len;let tick=0,status=0;
      while(p<end){tick+=vlq();let s=byte();if(s<128){if(!status)throw Error('Running status inválido');p--;s=status;}else if(s<240)status=s;
        if(s===255){const type=byte(),n=vlq();need(n);if(p+n>end)throw Error('Metaevento fuera de pista');if(type===81&&n===3)tempos.push({tick,us:b[p]*65536+b[p+1]*256+b[p+2]});p+=n;if(type===47)break;}
        else if(s===240||s===247){const n=vlq();need(n);p+=n;status=0;}
        else {const kind=s>>4,ch=s&15,a=byte();if(kind===12){programs.set(ch,a);continue;}if(kind===13)continue;const v=byte();if(kind===9||kind===8)events.push({tick,pitch:a,velocity:v,channel:ch,on:kind===9&&v>0,track,program:programs.get(ch)||0});}
        if(p>end)throw Error('Evento fuera de pista');
      }endTick=Math.max(endTick,tick);p=end;
    }
    tempos.sort((a,b)=>a.tick-b.tick);let prev=0,secs=0,us=500000;
    const map=[];for(const t of tempos){secs+=(t.tick-prev)/division*us/1e6;map.push({...t,seconds:secs});prev=t.tick;us=t.us;}
    const seconds=tick=>{let t=map[0];for(const n of map){if(n.tick>tick)break;t=n;}return t.seconds+(tick-t.tick)/division*t.us/1e6;};
    const active=new Map(),notes=[];
    events.sort((a,b)=>a.tick-b.tick||Number(a.on)-Number(b.on));
    for(const e of events){const key=`${e.track}:${e.channel}:${e.pitch}`;if(e.on){const list=active.get(key)||[];list.push(e);active.set(key,list);}else{const start=active.get(key)?.shift();if(start)notes.push({...start,at:seconds(start.tick),duration:Math.max(.035,seconds(e.tick)-seconds(start.tick))});}}
    for(const list of active.values())for(const start of list)notes.push({...start,at:seconds(start.tick),duration:.2});
    notes.sort((a,b)=>a.at-b.at||a.channel-b.channel);
    if(!notes.length)throw Error('MIDI sin notas');
    return {notes,melody:notes.filter(n=>n.channel===0),duration:Math.max(seconds(endTick),...notes.map(n=>n.at+n.duration)),division,format,tracks};
  }
  function decode(s){if(typeof Buffer!=='undefined')return new Uint8Array(Buffer.from(s,'base64'));return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
  const songs=typeof module!=='undefined'&&module.exports?require('./songs.js'):root.TunaSongs;
  const cache=new Map(),status=new Map();
  function get(id){if(cache.has(id))return cache.get(id);const song=songs.find(s=>s.id===id);if(!song)throw Error('Canción desconocida');const result={...parse(decode(song.bytes)),...song};cache.set(id,result);return result;}
  async function preload(){return Promise.all(songs.map(async song=>{
    const fallback=get(song.id);if(!root.fetch||root.location?.protocol==='file:'){status.set(song.id,'integrado');return fallback;}
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);
    try {const res=await fetch(song.file,{signal:controller.signal});if(!res.ok)throw Error('Recurso no disponible');const parsed=parse(await res.arrayBuffer());cache.set(song.id,{...parsed,...song});status.set(song.id,'archivo');return cache.get(song.id);}catch{status.set(song.id,'integrado');return fallback;}finally{clearTimeout(timer);}
  }));}
  const api={parse,decode,get,preload,status};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TunaMusic=api;
})(globalThis);
