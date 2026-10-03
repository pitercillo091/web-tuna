(function(root){
  'use strict';
  class AudioBus {
    constructor(settings){this.settings=settings;this.ctx=null;this.available=true;this.nodes=new Set();this.bag=[];this.lastRandom=settings.lastSong||null;this.track=null;this.sequence=0;this.anchor=null;this.cursor=0;this.cycle=0;}
    async unlock(){
      if(!this.available)return;
      try{if(!this.ctx){const Context=root.AudioContext||root.webkitAudioContext;if(!Context){this.available=false;return;}this.ctx=new Context();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);this.master.gain.value=this.settings.volume*.28;}
      if(this.ctx.state==='suspended')await this.ctx.resume();}catch{this.available=false;}
    }
    volume(){if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.settings.volume*.28,this.ctx.currentTime,.02);}
    tone(freq,duration=.24,delay=0,type='triangle',gain=.55){
      if(!this.ctx||this.ctx.state!=='running'||this.nodes.size>96)return;
      const t=this.ctx.currentTime+Math.max(0,delay),o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+Math.max(.04,duration));o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.025);this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};
    }
    strum(chord=[0,4,7]){if(!this.settings.music)return;chord.forEach((p,i)=>this.tone(130.8128*2**(p/12),.32,i*.024,'triangle',.15));}
    effect(type){if(!this.settings.effects)return;const sounds={collect:[523,659,784],hit:[880],damage:[140,100],wrong:[160],miss:[190],result:[523,659,784,1047],victory:[523,659,784,1047,1319],defeat:[330,294,220]};(sounds[type]||[]).forEach((f,i)=>this.tone(f,.16,i*.08,'sine',.34));}
    random(){
      if(!this.bag.length||(this.bag.length===1&&this.bag[0]===this.lastRandom)){this.bag=root.TunaSongs.map(s=>s.id);for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}}
      let index=this.bag.length-1;if(this.bag[index]===this.lastRandom&&index>0)index--;
      this.lastRandom=this.bag.splice(index,1)[0];this.settings.lastSong=this.lastRandom;return this.lastRandom;
    }
    select(id,{loop=false,offset=0,context='performance',end=null}={}){
      this.stop();this.track=root.TunaMusic.get(id);this.loop=loop;this.offset=offset;this.context=context;this.end=end;this.sequence++;this.cursor=0;this.cycle=0;this.anchor=null;this.title=this.track.title;this.lastRandom=id;this.settings.lastSong=id;
    }
    ambient(context){this.select(this.random(),{loop:true,context});}
    update(game){
      if(!this.ctx||this.ctx.state!=='running'||!this.settings.music||!this.track)return;
      if(this.context==='performance'&&game.phase!=='playing')return;
      if(this.context==='explore'&&game.phase!=='playing')return;
      const clock=this.context==='performance'?game.clock-this.offset:null;
      if(clock!==null&&clock<-.08){this.anchor=null;return;}
      // Recover after a delayed frame: re-anchor to the same game position.
      if(clock!==null&&this.anchor!==null&&Math.abs(this.ctx.currentTime-this.anchor-clock)>.12)this.stop();
      if(this.anchor===null){const pos=Math.max(0,clock||0);this.anchor=this.ctx.currentTime-pos;this.cursor=this.track.notes.findIndex(n=>n.at>=pos-.04);if(this.cursor<0)this.cursor=this.track.notes.length;}
      const current=this.ctx.currentTime-this.anchor,horizon=current+.1;
      const duration=this.track.duration+.35;
      while(this.cursor<this.track.notes.length){const n=this.track.notes[this.cursor],at=n.at+this.cycle*duration;if(at>horizon)break;this.cursor++;if(at<current-.08||this.end!==null&&at>this.end)continue;
        const lead=n.channel===0,bass=n.channel===2;const gain=(lead?.48:bass?.17:.075)*(n.velocity/100);
        this.tone(440*2**((n.pitch-69)/12),Math.min(n.duration,lead?1.1:.45),at-current,lead?'triangle':bass?'sine':'triangle',gain);
      }
      if(this.loop&&current>duration*(this.cycle+1)){this.cycle++;this.cursor=0;}
      if(this.loop&&this.cycle>=1){const context=this.context;this.ambient(context);}
    }
    stop(){this.nodes.forEach(o=>{try{o.stop();}catch{}});this.nodes.clear();this.anchor=null;}
  }
  root.TunaAudio=AudioBus;
})(globalThis);
