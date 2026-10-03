(function(){
  'use strict';
  const $=id=>document.getElementById(id),D=TunaData,E=TunaEngine;
  const qaMode=location.hash==='#qa'&&window.parent!==window;
  let storage;if(qaMode){const memory={};storage={getItem:k=>memory[k]||null,setItem:(k,v)=>{memory[k]=v;}};}else try{storage=window.localStorage;}catch{storage={getItem(){return null;},setItem(){throw new Error('storage unavailable');}};}
  const save=E.readSave(storage),audio=new TunaAudio(save),art=new TunaArt($('game')),homeArt=new TunaArt($('home-art'));
  const game=new E.Game({character:save.character,easy:save.easy});let last=performance.now(),uiPhase='',uiMode='',lastAnnouncement='',settingsPaused=false,held=new Set(),touch=new Set(),activePointers=new Map(),lastHud=0;
  const keyDirections={ArrowLeft:'left',KeyA:'left',ArrowDown:'down',KeyS:'down',ArrowUp:'up',KeyW:'up',ArrowRight:'right',KeyD:'right'};
  const lanes={left:0,down:1,up:2,right:3};
  const musicReady=TunaMusic.preload();let lastStoredSong=save.lastSong;
  function musicLabel(){const label=save.music?`♫ ${audio.title||'Activa la música'}${audio.ctx?.state==='running'?'':' · toca para escuchar'}`:'♫ Música apagada';if($('music-now')?.textContent!==label)$('music-now').textContent=label;}
  function rhythmButtons(){document.querySelector('.rhythm-controls').innerHTML=D.keys.slice(0,game.config.laneCount).map((key,i)=>`<button data-lane="${i}" style="--lane:${D.laneColors[i]}" aria-label="Nota ${key}">${D.lanes[i]}<small>${key}</small></button>`).join('');}
  function persist(){const okay=E.writeSave(storage,save);lastStoredSong=save.lastSong;$('storage-status').textContent=okay?'Progreso y ajustes guardados en este navegador.':'El navegador no permite guardar. Puedes jugar, pero el progreso se conservará solo durante esta visita.';}
  function announce(text){if(text===lastAnnouncement)return;lastAnnouncement=text;$('live-status').textContent=text;}
  function closeModal(){if($('modal').open)$('modal').close();}
  function showModal(content){closeModal();$('modal-content').innerHTML=content;$('modal').showModal();$('modal-content').querySelector('button')?.focus();}
  function title(kicker,title){return `<div class="dialog-head"><p class="eyebrow">${kicker}</p></div><h2>${title}</h2>`;}
  function actions(content){return `<div class="dialog-actions">${content}</div>`;}
  function button(action,text,style='primary'){return `<button class="button ${style}" data-action="${action}">${text}</button>`;}
  function renderMenu(){
    $('characters').innerHTML=D.characters.map(c=>`<button class="character-card" data-character="${c.id}" aria-pressed="${c.id===save.character}" aria-label="Elegir ${c.name}"><img src="assets/personajes/${c.id}.svg?v=2" alt=""><span><strong>${c.name}</strong><small>${c.role}</small></span>${c.id===save.character?'<span class="selected-mark">✓</span>':''}</button>`).join('');
    $('levels').innerHTML=D.levels.map(l=>`<button class="level-card" data-level="${l.id}" ${l.id>save.unlocked?'disabled':''}><span class="level-top"><span class="number">${String(l.id+1).padStart(2,'0')}</span><span class="stars">${l.id>save.unlocked?'◇':save.stars[l.id]?'★'.repeat(save.stars[l.id]):'☆ ☆ ☆'}</span></span><strong>${l.short}</strong><small>${l.id>save.unlocked?'Completa la etapa anterior':save.best[l.id]?`${save.best[l.id].toLocaleString('es-ES')} puntos · Repetir`:l.place.split(' · ')[0]}</small></button>`).join('');
    $('play').innerHTML=`${save.unlocked>0&&save.stars[D.levels.length-1]===0?'Continuar la ronda':'Empezar la ronda'} <span>→</span>`;
    $('easy').checked=save.easy;
  }
  function home(){audio.ambient('menu');persist();held.clear();touch.clear();game.phase='menu';closeModal();$('home').hidden=false;$('play-area').hidden=true;$('pause').hidden=true;uiPhase='menu';renderMenu();musicLabel();$('play').focus();}
  function start(level){audio.unlock();game.character=save.character;game.easy=save.easy;game.start(level);held.clear();touch.clear();$('home').hidden=true;$('play-area').hidden=false;$('pause').hidden=false;uiPhase='';sync();window.scrollTo({top:0,behavior:'instant'});}
  function beacons(){
    $('beacons').innerHTML=game.items.map(i=>`<button class="beacon" data-target="${i.id}" style="left:${i.x/9.6}%;top:${(i.y-30)/5.4}%" aria-label="${game.level===1||game.level===4?'Reunir':'Recoger'} ${D.characters.find(c=>c.id===i.type)?.name||i.type} ${i.id+1}"></button>`).join('')+`<button class="beacon stage" data-target="stage" style="left:${game.stage.x/9.6}%;top:${game.stage.y/5.4}%" aria-label="Ir al escenario y tocar"></button>`;
  }
  function brief(){const l=game.config;showModal(title(`ETAPA ${String(l.id+1).padStart(2,'0')} · ${l.place.split(' · ')[0].toUpperCase()}`,l.title)+`<img class="dialog-photo" src="assets/referencias/${l.photo}.webp" alt="Fotografía original de la Tuna: ${l.place}"><p>${l.goal}</p><p class="dialog-quote">«${l.intro}»</p><div class="dialog-controls"><div><b>1. Prepara la ronda</b>Muévete con WASD o flechas. Recoge con espacio, o toca el objeto.</div><div><b>2. Toca a compás</b>Pulsa ${D.keys.slice(0,l.laneCount).join(" · ")} cuando la nota cruce la línea dorada. ${l.id>0&&l.laneCount>D.levels[l.id-1].laneCount?"Nueva tecla: "+D.keys[l.laneCount-1]+".":""} Acierta al menos el ${Math.round(l.threshold*100)}%.</div></div>`+actions(button('begin','¡Vamos a la plaza! →')+button('home','Volver','secondary')));}
  function pause(){game.pause();held.clear();touch.clear();audio.stop();sync();}
  function result(){
    const victory=game.phase==='victory',accuracy=game.hits/game.notes.length,stars=accuracy>=.9?3:accuracy>=.72?2:1;
    audio.stop();save.unlocked=Math.max(save.unlocked,Math.min(D.levels.length-1,game.level+1));save.best[game.level]=Math.max(save.best[game.level],game.score);save.stars[game.level]=Math.max(save.stars[game.level],stars);persist();
    showModal(title(victory?'LA NOCHE ES VUESTRA':`ETAPA ${String(game.level+1).padStart(2,'0')} COMPLETADA`,victory?'¡Una ronda para recordar!':'La plaza pide otra')+`<div class="result-stars" aria-label="${stars} estrellas">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><p>${game.config.after}</p><div class="results-grid"><div><small>PUNTOS</small><b>${game.score.toLocaleString('es-ES')}</b></div><div><small>A COMPÁS</small><b>${Math.round(accuracy*100)}%</b></div><div><small>MEJOR COMBO</small><b>${game.bestCombo}</b></div></div><p class="small muted">Bonificación por llegar a tiempo: ${game.bonus} puntos. Total de esta ronda: ${game.total.toLocaleString('es-ES')} puntos.</p>`+actions(victory?button('restart','Otra ronda →')+button('home','Inicio','secondary'):button('next','Siguiente etapa →')+button('retry','Repetir','secondary')));
    announce(victory?'Victoria. Has completado las diez canciones.':`Etapa ${game.level+1} superada con ${game.score} puntos.`);
  }
  function sync(){
    if(game.phase!==uiPhase){uiPhase=game.phase;
      if(game.phase==='brief'){beacons();rhythmButtons();brief();}
      if(game.phase==='playing'){closeModal();$('game').focus({preventScroll:true});}
      if(game.phase==='paused')showModal(title('UN MOMENTO PARA AFINAR','La ronda espera')+'<p>La partida está pausada. Los músicos también necesitan tomar aire.</p>'+actions(button('resume','Seguir tocando →')+button('retry','Reiniciar','secondary')+button('home','Inicio','secondary')));
      if(game.phase==='result'||game.phase==='victory')result();
      if(game.phase==='defeat'){audio.stop();showModal(title('VOLVEMOS A ENSAYAR','Esta ronda se nos escapó')+`<p>${game.reason}</p><p class="dialog-quote">${game.mode==='rhythm'?'Mira las notas, no las teclas. Pulsa cuando lleguen a los círculos de la línea dorada.':'Puedes tocar directamente los objetos. Tu músico encontrará un camino por la plaza.'}</p>`+actions(button('retry','Intentarlo de nuevo →')+button('home','Inicio','secondary')));announce('Derrota. Puedes reiniciar esta etapa.');}
    }
    if(game.mode!==uiMode){uiMode=game.mode;held.clear();touch.clear();$('beacons').hidden=game.mode!=='explore';$('explore-controls').hidden=game.mode!=='explore';$('rhythm-controls').hidden=game.mode!=='rhythm';}
  }
  function hud(){if(game.phase==='menu')return;
    $('level-number').textContent=`${String(game.level+1).padStart(2,'0')}`;$('place').textContent=game.config.place;$('level-title').textContent=game.config.title;
    $('score').textContent=game.score.toLocaleString('es-ES');$('health-fill').style.width=`${Math.max(0,game.health)}%`;$('health-fill').style.background=game.health<30?'#db7584':'#98bd98';$('health-label').textContent=game.mode==='rhythm'?'PÚBLICO':'ÁNIMO';
    const seconds=Math.ceil(game.mode==='rhythm'?Math.max(0,game.duration-game.clock):Math.max(0,game.remaining));$('timer').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;$('timer-label').textContent=game.mode==='rhythm'?'CANCIÓN':'TIEMPO';
    const count=game.items.filter(i=>i.collected).length;$('progress').textContent=game.mode==='rhythm'?`${game.hits} / ${game.notes.length}`:`${count} / ${game.items.length}`;
    if(game.mode==='rhythm'){const next=game.notes.find(n=>!n.judged);$('next-note').textContent=next?`Próxima nota: ${D.lanes[next.lane]} · ${Math.max(0,next.at-game.clock).toFixed(2)} s`:'¡Último acorde!';}
    $('objective').textContent=game.mode==='rhythm'?`Teclas ${D.keys.slice(0,game.laneCount).join(" · ")}: pulsa al cruzar la línea dorada. Objetivo: ${Math.round(game.config.threshold*100)}% a compás.`:count===game.items.length?'¡Equipo completo! Ve al escenario y pulsa espacio, o toca el escenario.':game.config.goal;
    game.items.forEach(i=>{const el=$('beacons').querySelector(`[data-target="${i.id}"]`);if(el)el.hidden=i.collected;});
    $('play-area').dataset.phase=game.phase;$('play-area').dataset.mode=game.mode;$('play-area').dataset.collected=count;$('play-area').dataset.health=Math.round(game.health);
  }
  function processEvents(){game.drain().forEach(e=>{
    if(e.type==='load'){art.particles=[];audio.ambient('explore');persist();musicLabel();}
    if(e.type==='collect'){art.burst(e.item.x,e.item.y-30);audio.effect('collect');announce(`Recogido ${e.item.type}. ${game.items.filter(i=>i.collected).length} de ${game.items.length}.`);}
    if(e.type==='rhythm'){audio.select(game.config.song,{offset:game.musicOffset,end:game.duration-game.musicOffset});musicLabel();announce(`Empieza ${game.config.title}. Teclas: ${D.keys.slice(0,game.laneCount).join(', ')}.`);}
    if(['hit','damage','wrong','miss','result','victory','defeat'].includes(e.type)){audio.effect(e.type);if(e.type==='hit'){const el=document.querySelector(`[data-lane="${e.lane}"]`);el?.classList.add('pressed');setTimeout(()=>el?.classList.remove('pressed'),120);art.burst(427+(e.lane+.5)*456/game.laneCount,443,D.laneColors[e.lane]);}if(e.type==='wrong'||e.type==='miss'){const el=document.querySelector(`[data-lane="${e.lane}"]`);el?.classList.add('missed');setTimeout(()=>el?.classList.remove('missed'),180);}}
  });}
  function onAction(action){
    if(action==='begin'){game.begin();audio.unlock();}
    if(action==='home')home();
    if(action==='resume')game.resume();
    if(action==='retry'){audio.stop();game.retry();}
    if(action==='next'){audio.stop();game.next();}
    if(action==='restart')start(0);
    if(action==='close')closeModal();
    sync();
  }
  $('modal-content').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)onAction(b.dataset.action);});
  $('play').addEventListener('click',()=>start(save.stars[D.levels.length-1]===0?save.unlocked:0));
  $('brand').addEventListener('click',e=>{e.preventDefault();home();});
  $('characters').addEventListener('click',e=>{const b=e.target.closest('[data-character]');if(!b)return;save.character=b.dataset.character;persist();renderMenu();});
  $('levels').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(b&&!b.disabled)start(Number(b.dataset.level));});
  $('easy').addEventListener('change',()=>{save.easy=$('easy').checked;persist();});
  $('pause').addEventListener('click',()=>{if(game.phase==='playing')pause();else if(game.phase==='paused'){game.resume();sync();}});
  $('interact').addEventListener('click',()=>game.interact());
  $('beacons').addEventListener('click',e=>{const b=e.target.closest('[data-target]');if(!b)return;const target=b.dataset.target==='stage'?'stage':Number(b.dataset.target);const point=target==='stage'?game.stage:game.items[target];game.navigate(point.x,point.y,target);$('game').focus({preventScroll:true});});
  $('game').addEventListener('pointerdown',e=>{if(game.mode!=='explore'||game.phase!=='playing')return;const r=$('game').getBoundingClientRect(),x=(e.clientX-r.left)*960/r.width,y=(e.clientY-r.top)*540/r.height;const item=game.items.find(i=>!i.collected&&Math.hypot(i.x-x,i.y-y)<65);if(item)game.navigate(item.x,item.y,item.id);else if(Math.hypot(game.stage.x-x,game.stage.y-y)<85)game.navigate(game.stage.x,game.stage.y,'stage');else game.navigate(x,y);});
  document.querySelectorAll('[data-direction]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();audio.unlock();b.setPointerCapture(e.pointerId);activePointers.set(e.pointerId,b.dataset.direction);touch.add(b.dataset.direction);});const release=e=>{const d=activePointers.get(e.pointerId);activePointers.delete(e.pointerId);if(d&&!Array.from(activePointers.values()).includes(d))touch.delete(d);};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);});
  document.querySelector('.rhythm-controls').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-lane]');if(!b)return;e.preventDefault();audio.unlock();game.hit(Number(b.dataset.lane));});
  document.addEventListener('keydown',e=>{
    if(e.code==='Escape'){if($('settings').open)return;if(game.phase==='playing'){e.preventDefault();pause();}else if(game.phase==='paused'){e.preventDefault();game.resume();sync();}return;}
    if(game.phase!=='playing'||$('settings').open)return;
    if(['INPUT','BUTTON'].includes(e.target.tagName)&&!e.target.closest('.rhythm-controls,.explore-controls'))return;
    if(keyDirections[e.code]){e.preventDefault();if(e.repeat)return;audio.unlock();const d=keyDirections[e.code];if(game.mode==='explore')held.add(d);else game.hit(lanes[d]);}
    else if(game.mode==='rhythm'&&D.codes.includes(e.code)){e.preventDefault();if(!e.repeat)game.hit(D.codes.indexOf(e.code));}
    if(e.code==='Space'){e.preventDefault();if(e.repeat)return;if(game.mode==='explore')game.interact();else{const next=game.notes.filter(n=>!n.judged).sort((a,b)=>Math.abs(a.at-game.clock)-Math.abs(b.at-game.clock))[0];if(next)game.hit(next.lane);}}
  });
  document.addEventListener('keyup',e=>held.delete(keyDirections[e.code]));
  function unfocus(){held.clear();touch.clear();activePointers.clear();if(game.phase==='playing')pause();}
  window.addEventListener('blur',()=>{held.clear();touch.clear();activePointers.clear();});document.addEventListener('visibilitychange',()=>{if(document.hidden)unfocus();});
  $('modal').addEventListener('cancel',e=>{if(game.phase==='paused'){e.preventDefault();game.resume();sync();}else if(game.phase!=='menu')e.preventDefault();});
  $('settings-open').addEventListener('click',()=>{settingsPaused=game.phase==='playing';if(settingsPaused){game.pause();uiPhase='paused';held.clear();touch.clear();audio.stop();} $('settings').showModal();});
  document.querySelector('[data-close=settings]').addEventListener('click',()=>$('settings').close());
  $('settings').addEventListener('close',()=>{if(settingsPaused&&game.phase==='paused'){game.resume();uiPhase='';sync();}settingsPaused=false;});
  ['music','effects'].forEach(id=>{$(id).checked=save[id];$(id).addEventListener('change',()=>{save[id]=$(id).checked;if(id==="music")audio.stop();persist();musicLabel();});});
  $('volume').value=Math.round(save.volume*100);$('volume-value').textContent=`${Math.round(save.volume*100)}%`;$('volume').addEventListener('input',()=>{save.volume=Number($('volume').value)/100;$('volume-value').textContent=`${$('volume').value}%`;audio.volume();persist();});
  $('test-sound').addEventListener('click',async()=>{await audio.unlock();audio.strum();audio.effect('collect');$('audio-status').textContent=audio.available?'Sonido preparado. Música y efectos respetan tus ajustes.':'Este navegador no ha podido activar el audio. La partida puede continuar en silencio.';});
  $('how-open').addEventListener('click',()=>showModal(title('ANTES DE SALIR','Dos formas de llevar la ronda')+`<p><b>En la plaza:</b> reúne lo que necesita el grupo. Usa WASD o las flechas y recoge con espacio. Con ratón o pantalla táctil, toca un objeto para caminar hasta él y recogerlo. Los bancos bloquean el paso y los charcos móviles te quitan ánimo.</p><p><b>En la actuación:</b> pulsa ←, ↓, ↑ o → cuando la nota alcance la línea dorada. Empieza con A y S; se añaden W, D, J y K. Las cuatro primeras también admiten flechas. Toca los botones musicales en pantalla. Espacio toca la nota más cercana: una alternativa de un solo botón.</p><p>Acumula combos para sumar más puntos. Necesitas entre el 50% y el 60% de aciertos, según la etapa. Si se agota el tiempo o el ánimo, puedes repetir la etapa. Escape pausa la partida.</p><p class="small muted">«Ritmo tranquilo» amplía el margen para acertar y reduce el daño. Tus mejores marcas y niveles se guardan en este navegador.</p>`+actions(button('close','Entendido →'))));
  $('credits-open').addEventListener('click',()=>showModal(title('HECHO CON LOS NUESTROS','Una Tuna con identidad')+`<p>Una aventura original inspirada en la Rondalla de Lopera: beca roja, traje negro, instrumentos de cuerda y noches de actuaciones. Escudo y fotografías proceden de esta web.</p><div class="credits-cast">${D.characters.map(c=>`<div><img src="assets/personajes/${c.id}.svg?v=2" alt="Diseño canónico de ${c.name}"><strong>${c.name}</strong><p>${c.detail}</p><img class="reference" src="assets/referencias/${c.reference}" alt="Fotografía usada como referencia visual"></div>`).join('')}</div><p class="small">Las ilustraciones son interpretaciones de rasgos visibles, con nombres de instrumento. Las escenas y diálogos del juego son ficción. Efectos, escenarios y sprites pixel art creados para este juego. Referencia del reparto: imagen aportada en PERSONAJES. Los nueve primeros MIDI son fragmentos instrumentales; Cartagenera es un acompañamiento de cumbia basado en su armonía.</p><p class="small">Fuentes musicales: <a href="https://tablatunas.com/terminos-servicio/" target="_blank" rel="noopener">Tablatunas / Soplas</a> (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">arreglos CC BY 4.0</a>), <a href="https://partiturak.eus/ver/El%20rey" target="_blank" rel="noopener">Partiturak</a> y <a href="https://www.tunaespana.es/?p=3420" target="_blank" rel="noopener">Tuna España</a>. Adaptación: fragmentos, tempo, timbres y acompañamiento. Detalle de fuentes y derechos en assets/audio/FUENTES.md.</p><p class="small">Referencia de experiencia: <a href="https://isabel-arrans.itch.io/novatuno" target="_blank" rel="noopener">Novatuno, de Isabel Arrans ↗</a>. Se han consultado su página y sus diarios de desarrollo; no se han reutilizado recursos, código, textos ni música.</p>`+actions(button('close','Volver a la ronda →'))));
  // A secondary broken image never removes the game or a dialog.
  document.addEventListener('error',e=>{if(e.target.tagName==='IMG'){e.target.style.visibility='hidden';e.target.setAttribute('aria-hidden','true');}},true);
  audio.ambient('menu');renderMenu();persist();musicLabel();
  document.addEventListener('pointerdown',()=>{audio.unlock().then(musicLabel);},{capture:true});
  document.addEventListener('keydown',()=>{audio.unlock().then(musicLabel);},{capture:true});
  $('music-now').addEventListener('click',async()=>{await audio.unlock();musicLabel();});
  $('next-song').addEventListener('click',async()=>{audio.ambient('menu');persist();await audio.unlock();musicLabel();});
  // Deterministic integration driver is available only inside the test iframe.
  // It exercises the real controller, audio, HUD, dialogs and renderer.
  let qaRenderClock=0;
  if(qaMode)window.TunaQA={game,save,audio,art,storage,start,musicReady,
    step(dt,input={x:0,y:0}){game.tick(dt,input);processEvents();audio.update(game);sync();qaRenderClock+=dt;if(qaRenderClock>=.1||dt===0||game.phase!=='playing'){if(game.phase==='menu')homeArt.render(null,qaRenderClock);else art.render(game,qaRenderClock);hud();qaRenderClock=0;}},
    stats(){return game.stats();}
  };
  function frame(now){
    const raw=(now-last)/1000;last=now;const dt=Math.min(raw,.1);
    // Large gaps are clamped; visibilitychange already pauses real tab switches.
    // A slow frame or a browser screenshot must not open the pause dialog.
    if(game.phase==='menu'){homeArt.render(null,dt);audio.update(game);musicLabel();}
    else{
      const input={x:Number(held.has('right')||touch.has('right'))-Number(held.has('left')||touch.has('left')),y:Number(held.has('down')||touch.has('down'))-Number(held.has('up')||touch.has('up'))};
      // Catch up through small collision steps when a frame arrives late.
      // Music and the timer follow elapsed time instead of the frame count.
      let elapsed=Math.min(raw,1);
      while(elapsed>0&&game.phase==='playing'){const step=Math.min(.05,elapsed);game.tick(step,input);elapsed-=step;}
      processEvents();audio.update(game);sync();art.render(game,dt);if(now-lastHud>80){hud();lastHud=now;}
    }
    if(save.lastSong!==lastStoredSong)persist();
    requestAnimationFrame(frame);
  }
  if(!qaMode)requestAnimationFrame(frame);
})();
