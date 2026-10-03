(function(root){
  'use strict';
  const D=root.TunaData;
  class Art {
    constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images={};this.backgrounds={};this.particles=[];this.time=0;
      D.characters.forEach(c=>{this.load(c.id,`assets/personajes/${c.id}.svg?v=2`);this.load(c.id+'-atlas',`assets/personajes/${c.id}-atlas.png?v=2`);});this.load('escudo','assets/ui/escudo.webp');
    }
    load(id,src){const im=new Image();im.onload=()=>{this.images[id]=im;if(id==='escudo')this.backgrounds={};};im.onerror=()=>{this.images[id]=null;};im.src=src;}
    resize(){const dpr=Math.min(2,root.devicePixelRatio||1);if(this.canvas.width!==960*dpr){this.canvas.width=960*dpr;this.canvas.height=540*dpr;}this.ctx.setTransform(dpr,0,0,dpr,0,0);}
    rect(x,y,w,h,color,r=0){const c=this.ctx;c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
    ellipse(x,y,rx,ry,color){const c=this.ctx;c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
    line(points,color,width=1){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}
    text(text,x,y,size=15,color='#ead9bd',align='center'){const c=this.ctx;c.fillStyle=color;c.textAlign=align;c.font=`600 ${size}px system-ui`;c.fillText(text,x,y);}
    arch(x,y,w,h,color){const c=this.ctx;c.fillStyle=color;c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w/2);c.arc(x+w/2,y+w/2,w/2,Math.PI,0);c.lineTo(x+w,y+h);c.closePath();c.fill();}
    building(x,y,w,h,color,roof,variant=0){
      this.rect(x,y,w,h,color,2);this.rect(x+w-10,y,10,h,'#00000020');this.rect(x-8,y-8,w+16,14,roof,2);this.rect(x-3,y+6,w+6,5,'#00000019');
      for(let row=0;row<Math.floor(h/62);row++)for(let col=0;col<Math.floor(w/50);col++){const wx=x+15+col*48,wy=y+24+row*54;this.arch(wx,wy,24,34,'#342333');this.arch(wx+3,wy+4,18,26,variant%2?'#d7a65b':'#bc7558');this.line([[wx+12,wy+6],[wx+12,wy+30]],'#56363c',2);this.rect(wx-3,wy+33,30,4,'#5e4245');if(row===0&&variant===2){this.line([[wx-5,wy+26],[wx+30,wy+26]],'#2f2530',2);for(let a=0;a<5;a++)this.line([[wx-5+a*9,wy+25],[wx-5+a*9,wy+37]],'#2f2530',1);}}
      this.arch(x+w/2-18,y+h-58,36,58,'#342633');this.arch(x+w/2-14,y+h-52,28,52,'#684346');this.rect(x+8,y+h-4,w-16,4,'#3b2b36');
    }
    scene(theme){
      const c=this.ctx,palette={rehearsal:['#22346b','#bc7c97','#705f95'],street:['#172f62','#b05d85','#685b95'],castle:['#142759','#755fa4','#484f81'],plaza:['#30234f','#c36674','#685385'],university:['#332252','#986ea9','#65587d'],festival:['#212f6e','#b57a99','#705984'],garden:['#225579','#72c1bb','#427e8c'],finale:['#11255a','#6d62a9','#48558d']}[theme]||['#192033','#60414d','#352c3b'];const sky=c.createLinearGradient(0,0,0,540);sky.addColorStop(0,palette[0]);sky.addColorStop(.47,palette[1]);sky.addColorStop(1,palette[2]);c.fillStyle=sky;c.fillRect(0,0,960,540);
      for(let i=0;i<38;i++)this.ellipse((i*149+33)%960,(i*43)%158, i%4===0?1.4:.7, i%4===0?1.4:.7,'#ebd5a88a');
      this.ellipse(771,55,26,26,'#f2d7a0');this.ellipse(780,48,24,24,'#252639');
      // Silhouette of the olive landscape, then a square of warm Andalusian houses.
      c.fillStyle='#363042';c.beginPath();c.moveTo(0,185);for(let x=0;x<=960;x+=40)c.lineTo(x,155+Math.sin(x*.012)*21);c.lineTo(960,300);c.lineTo(0,300);c.fill();
      if(theme==='castle'||theme==='finale'){
        this.rect(605,70,150,134,'#89705c');this.rect(581,89,48,122,'#a08765');this.rect(737,89,48,122,'#a08765');
        for(let x=580;x<786;x+=20)this.rect(x,79,12,18,'#a78d6a');for(let x=606;x<753;x+=21)this.rect(x,59,13,17,'#a78d6a');
        for(let y=100;y<196;y+=18)for(let x=590;x<780;x+=29)this.line([[x+(y%36===0?12:0),y],[x+25,y]],'#594d4945',1);
        this.arch(655,143,45,67,'#3c3039');this.rect(624,89,8,23,'#392f39');this.rect(721,90,8,23,'#392f39');
      }
      this.building(-18,93,160,175,'#dfac9c','#a14e5a',1);this.building(135,125,150,147,'#f1d19b','#bb765b',2);
      this.building(285,159,112,106,'#98b8b2','#596e84',1);this.building(801,112,177,159,'#ead5b2','#b85f64',2);
      if(theme==='plaza'||theme==='rehearsal') {this.building(565,93,160,157,'#ac8e70','#6f4549',1);this.rect(626,52,41,76,'#b79b77');this.arch(635,69,23,32,'#463442');this.rect(621,46,52,10,'#76514e');this.line([[647,29],[647,47]],'#e4bb76',3);this.line([[640,36],[654,36]],'#e4bb76',3);}
      // Floor perspective: no raster background or heavy per-frame allocations.
      const ground=c.createLinearGradient(0,225,0,540);ground.addColorStop(0,theme==='garden'?'#759993':'#7386a3');ground.addColorStop(1,theme==='festival'?'#6b637f':'#394c78');c.fillStyle=ground;c.fillRect(0,265,960,275);
      for(let y=270;y<540;y+=27){this.line([[0,y],[960,y]],'#d9af8b12',1);for(let x=0;x<960;x+=67)this.line([[x+((y/27|0)%2)*32,y],[x+((y/27|0)%2)*32-10,y+27]],'#201e2e26',1);}
      this.rect(0,259,960,9,'#c6a187');this.rect(0,268,960,4,'#382935');
      if(theme==='rehearsal'){this.rect(410,135,140,119,'#352e40',3);this.rect(425,152,110,69,'#827263',2);this.text('LOCAL DE ENSAYO',480,181,12,'#eed8af');this.text('L O P E R A',480,201,10,'#d3b694');}
      // Stage and original crest, no replacement badge.
      this.rect(778,198,131,70,'#603344',4);this.rect(764,265,157,14,'#b38363',4);this.rect(756,280,174,9,'#815b54',3);this.rect(765,289,155,6,'#3a2d3a');
      this.line([[781,199],[781,265]],'#d8af6c',3);this.line([[906,199],[906,265]],'#d8af6c',3);
      if(this.images.escudo)c.drawImage(this.images.escudo,826,205,39,43);else this.text('LA TUNA',841,235,12);
      // Festoon lights and shadows make the place feel inhabited.
      c.strokeStyle='#292736';c.lineWidth=2;c.beginPath();c.moveTo(0,74);c.quadraticCurveTo(440,167,960,83);c.stroke();
      for(let i=0;i<18;i++){const x=i*57+5,y=76+Math.sin(x/960*Math.PI)*46;this.ellipse(x,y,8,8,'#eaba6822');this.ellipse(x,y,3.2,4,'#f6d99c');}
      [85,737].forEach(x=>{this.rect(x,180,5,91,'#272833');this.rect(x-8,172,22,8,'#2e2a34',2);this.rect(x-6,150,18,22,'#ebbb72',4);this.rect(x-9,144,24,7,'#292735',2);this.ellipse(x+3,180,25,42,'#ebbb7214');});
      [25,918].forEach(x=>{this.ellipse(x,390,38,12,'#191d2a45');this.rect(x-12,338,25,39,'#a36656',5);this.rect(x-15,335,31,8,'#c08964',3);this.rect(x-3,295,6,44,'#5e4940');for(let i=0;i<5;i++)this.ellipse(x+Math.cos(i*1.4)*19,293+Math.sin(i*1.4)*14,22,17,i%2?'#4c6254':'#64735b');});
      root.TunaEngine.obstacles.forEach((o,i)=>{this.ellipse(o.x+o.w/2,o.y+o.h+3,o.w/2+10,12,'#201c2f50');this.rect(o.x,o.y,o.w,o.h,i?'#574454':'#845e52',5);this.rect(o.x-6,o.y-4,o.w+12,13,i?'#ac7b60':'#c89b71',3);if(!i){this.rect(o.x+22,o.y-12,24,10,'#cfac7b',2);this.text('♪',o.x+34,o.y-3,12,'#553343');}else this.rect(o.x+18,o.y-15,42,13,'#e1b27a',2);});
      // Cached decoration stays outside the walking routes and collision map.
      [35,103,171,243,839,913].forEach((x,i)=>{const y=190-i%2*45;this.rect(x,y,18,10,'#a45559');this.rect(x-2,y-3,22,4,'#da8871');for(let j=0;j<7;j++){this.rect(x+(j*7)%20-2,y-(j%3)*5-7,5,5,j%2?'#50a788':'#347a71');this.rect(x+(j*9)%20,y-(j%3)*5-7,3,3,i%2?'#fa7189':'#efb74e');}});
      for(let i=0;i<13;i++){const x=55+i*72,y=81+Math.sin(x/960*Math.PI)*46; c.fillStyle=['#d94464','#e7b45c','#54b7b0','#798edc'][i%4];c.beginPath();c.moveTo(x,y+7);c.lineTo(x+20,y+8);c.lineTo(x+10,y+26);c.fill();}
      this.rect(790,198,13,63,'#23283d');this.rect(888,198,13,63,'#23283d');[805,871].forEach(x=>{this.rect(x,241,2,20,'#ddd1b1');this.ellipse(x+1,239,4,3,'#252131');});
      this.line([[765,196],[922,196]],'#e8bc65',3);this.rect(765,192,157,4,'#cc405e');
      if(theme==='university'){this.rect(415,130,145,113,'#c1a4ce');this.arch(461,170,52,73,'#443a62');this.text('NOCHE DE RONDA',488,155,11,'#392d56');}
      if(theme==='festival'||theme==='finale'){for(let i=0;i<5;i++){this.rect(405+i*26,218,20,12,['#e45f82','#f1c870','#78cfba'][i%3]);this.line([[415+i*26,205],[415+i*26,236]],'#eddcb9',1);}}
      if(theme==='garden'){for(let i=0;i<7;i++){this.rect(421+i*18,207,4,37,'#337a64');this.ellipse(423+i*18,202,12,10,i%2?'#f47f9f':'#f3c173');}}
      // Gentle pools of blue and amber light on the paving.
      this.ellipse(839,298,93,15,'#85adff18');this.ellipse(132,278,100,14,'#ffd49113');
    }
    background(theme){if(!this.backgrounds[theme]){const back=document.createElement('canvas');back.width=960;back.height=540;const original=this.ctx;this.ctx=back.getContext('2d');this.scene(theme);this.ctx=original;this.backgrounds[theme]=back;}this.ctx.drawImage(this.backgrounds[theme],0,0);}
    character(id,x,y,scale=1,mode='idle',face=1){
      const c=this.ctx,bob=mode==='walk'?Math.round(Math.sin(this.time*14))*2:mode==='victory'?Math.round(Math.abs(Math.sin(this.time*5))*-12):0;
      this.ellipse(x,y+2,23*scale,7*scale,'#14182955');c.save();c.translate(Math.round(x),Math.round(y+bob));c.scale(scale,scale);c.imageSmoothingEnabled=false;
      // All animation frames reuse the same canonical face and costume.
      const row={idle:0,walk:1,playing:2,victory:3}[mode]||0,frame=Math.floor(this.time*(mode==='walk'?9:mode==='playing'?7:4))%4;
      if(this.images[id+'-atlas']){const atlas=this.images[id+'-atlas'],w=atlas.naturalWidth/4,h=atlas.naturalHeight/4;c.drawImage(atlas,frame*w,row*h,w,h,-40,-132,80,133);}
      else if(this.images[id])c.drawImage(this.images[id],-40,-132,80,133);else{this.rect(-22,-76,44,66,'#292635');this.rect(-17,-121,34,40,'#d9a17c');this.line([[-19,-71],[0,-50],[19,-71]],'#ba2b42',8);}
      if(mode==='playing'){this.text('♪',37,-75,24,'#f1c774');this.text('♫',-37,-100,18,'#ead9b6');}
      c.restore();
    }
    icon(type,x,y,scale=1){const c=this.ctx;c.save();c.translate(x,y);c.scale(scale,scale);
      if(type==='flor'){this.line([[0,17],[0,-4]],'#698b60',3);this.ellipse(5,9,6,3,'#8da066');for(let i=0;i<5;i++)this.ellipse(Math.cos(i*1.256)*7,-6+Math.sin(i*1.256)*7,6,6,'#df6980');this.ellipse(0,-6,4,4,'#efb77b');}
      else if(type==='partitura'){this.rect(-13,-19,26,37,'#e9d9bb',3);this.line([[-8,-9],[8,-9]],'#786c71');this.line([[-8,-4],[8,-4]],'#786c71');this.line([[-8,1],[8,1]],'#786c71');this.text('♫',0,10,21,'#673e51');}
      else if(type==='pandereta'){this.ellipse(0,0,19,19,'#bf8f58');this.ellipse(0,0,15,15,'#e9d5ae');for(let i=0;i<6;i++)this.ellipse(Math.cos(i*Math.PI/3)*18,Math.sin(i*Math.PI/3)*18,3,3,'#ddd4bb');}
      else {c.rotate(.4);this.rect(-3,-28,6,30,'#b2855c',2);this.ellipse(0,7,type==='guitarra'?15:18,18,'#d5a85c');if(type==='guitarra')this.ellipse(0,-6,11,12,'#d5a85c');this.ellipse(0,4,5,5,'#513241');this.line([[-1,-26],[-1,19]],'#f5dfb2');this.line([[2,-26],[2,19]],'#f5dfb2');}
      c.restore();
    }
    burst(x,y,color='#f5c579'){for(let i=0;i<15;i++)this.particles.push({x,y,vx:Math.cos(i*2.4)*50*(1+i%3),vy:Math.sin(i*2.4)*60-50,life:1,color});}
    render(game,dt){
      this.time+=dt;this.resize();const c=this.ctx;this.background(game?.config?.theme||'castle');
      if(!game||['menu'].includes(game.phase)){D.characters.forEach((ch,i)=>this.character(ch.id,510+i*83,452+(i%2)*12,1.05,'playing'));this.text('LA RONDALLA DE LOPERA',697,496,12,'#e7c898');return;}
      if(game.mode==='explore'){
        game.items.forEach(item=>{if(item.collected)return;const near=Math.hypot(item.x-game.player.x,item.y-game.player.y)<58;this.ellipse(item.x,item.y,27,13,near?'#f5c57955':'#e8bd7c18');if([1,4,8,9].includes(game.level)&&D.characters.some(ch=>ch.id===item.type)){this.character(item.type,item.x,item.y,.52,'idle');}else this.icon(item.type,item.x,item.y-23+Math.sin(this.time*3+item.id)*3,1);this.ellipse(item.x,item.y-63,3,3,'#f5cf80');});
        game.hazards.forEach(h=>{this.ellipse(h.x,h.y,27,13,'#223849bb');this.ellipse(h.x-3,h.y-3,18,6,'#76a4b266');this.line([[h.x-12,h.y],[h.x+4,h.y-3]],'#acceda88',1);});
        const ready=game.items.every(i=>i.collected);this.ellipse(game.stage.x,game.stage.y+43,54,13,ready?'#f3c06d55':'#281e3222');this.text(ready?'♪ ¡A TOCAR!':'EL ESCENARIO',game.stage.x,190,12,ready?'#ffdb8f':'#e9c7a0');
        if(game.path.length){c.setLineDash([3,8]);this.line([[game.player.x,game.player.y],...game.path.map(p=>[p.x,p.y])],'#f6da9588',2);c.setLineDash([]);}
        if(!(game.invulnerable>0&&Math.floor(this.time*12)%2===0))this.character(game.character,game.player.x,game.player.y,.62,game.player.moving?'walk':'idle',game.player.face);
        if(game.level===0&&game.items.every(i=>!i.collected)){this.text('Recoge los instrumentos iluminados',480,529,14,'#ffdfaa');}
      }else{
        c.fillStyle='#14182580';c.fillRect(0,0,960,540);D.characters.forEach((ch,i)=>this.character(ch.id,92+i*60,237,.7,'playing'));
        this.rect(57,257,316,110,'#201c2bbf',12);this.text(game.config.place.split(' · ')[0].toUpperCase(),215,283,12,'#dcaf77');this.text('¡Que siga la ronda!',215,316,22,'#f0dfc4');this.text(`${game.hits} notas a compás · combo ${game.combo}`,215,344,14,'#baadbc');
        const left=427,width=456,lane=width/game.laneCount,top=38,hitY=443,speed=game.config.scrollSpeed;
        this.rect(left-13,top-12,width+26,472,'#171926e8',15);
        for(let i=0;i<game.laneCount;i++){this.rect(left+i*lane+4,top,lane-8,441,`${D.laneColors[i]}09`,9);this.line([[left+i*lane+lane/2,top],[left+i*lane+lane/2,hitY-24]],`${D.laneColors[i]}25`,1);this.ellipse(left+i*lane+lane/2,hitY,28,28,`${D.laneColors[i]}25`);c.strokeStyle=D.laneColors[i];c.lineWidth=2;c.beginPath();c.arc(left+i*lane+lane/2,hitY,26,0,Math.PI*2);c.stroke();this.text(D.lanes[i],left+i*lane+lane/2,hitY+8,26,D.laneColors[i]);this.text(D.keys[i],left+i*lane+lane/2,hitY+48,14,'#c9bfcc');}
        this.line([[left,hitY],[left+width,hitY]],'#f5d292',2);
        game.notes.forEach(n=>{if(n.judged)return;const y=hitY-(n.at-game.clock)*speed;if(y<top-30||y>hitY+43)return;const x=left+n.lane*lane+lane/2;this.rect(x-31,y-19,62,38,D.laneColors[n.lane],12);this.rect(x-24,y-16,48,3,'#ffffff66',2);this.text(D.lanes[n.lane],x,y+8,24,'#222333');});
        if(game.clock<2.8)this.text(Math.max(1,Math.ceil(2.8-game.clock)).toString(),215,425,64,'#f6d291');
        else if(game.flash){this.text(game.flash.text,215,421,23,game.flash.kind==='miss'?'#f4a3a5':'#ffe0a0');if(game.combo>=8)this.text(`COMBO ×${(1+Math.min(3,Math.floor(game.combo/8))*.25).toFixed(2)}`,215,456,13,'#dfbd88');}
        this.rect(57,476,316,5,'#645066',3);this.rect(57,476,316*Math.min(1,game.clock/game.duration),5,'#dcb479',3);
      }
      this.particles=this.particles.filter(p=>{p.life-=dt;if(p.life<=0)return false;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=130*dt;this.ellipse(p.x,p.y,3*p.life,3*p.life,p.color);return true;});
      if(game.flash&&game.mode==='explore'){this.rect(280,34,400,42,'#241c2be8',21);this.text(game.flash.text,480,61,16,game.flash.kind==='miss'?'#f4a3a5':'#f8d28c');}
      if(game.mode==='rhythm'){for(let i=0;i<10;i++){const x=55+i*33,y=528+(i%2)*5,cheer=game.combo>0?Math.round(Math.sin(this.time*5+i)*3):0;this.rect(x-6,y-13,12,15,['#60486e','#8d587b','#517f8a'][i%3],3);this.ellipse(x,y-18,5,6,['#c18c71','#e1b596','#b98772'][i%3]);this.line([[x-5,y-8],[x-10,y-14+cheer]],'#b68c72',3);this.line([[x+5,y-8],[x+10,y-14-cheer]],'#b68c72',3);}}
      if(game.phase==='victory'){D.characters.forEach((ch,i)=>this.character(ch.id,180+i*145,454,1,'victory'));}
    }
  }
  root.TunaArt=Art;
})(globalThis);
