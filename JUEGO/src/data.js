(function (root) {
  'use strict';
  const songs=typeof module!=='undefined'&&module.exports?require('./songs.js'):root.TunaSongs;
  const characters = [
    {id:'pandereta',name:'La pandereta',role:'La capa también lleva el ritmo.',instrument:'pandereta',reference:'reparto.webp',detail:'Primero por la izquierda: gafas, barba poblada castaña y gris, cabello ondulado, complexión ancha y capa con cintas.'},
    {id:'guitarra',name:'La guitarra',role:'Que nadie olvide el estuche.',instrument:'guitarra',reference:'reparto.webp',detail:'Segundo: cabeza despejada, cabello en las sienes, cara sin barba, beca roja y guitarra grande de madera.'},
    {id:'bandurria',name:'La bandurria',role:'Una púa y toda la plaza.',instrument:'bandurria',reference:'reparto.webp',detail:'Tercero: cabello corto oscuro con canas, bigote y barba corta, rostro alargado, beca roja y bandurria dorada.'},
    {id:'guitarra-gafas',name:'La guitarra clara',role:'El compás se ve venir.',instrument:'guitarra',reference:'reparto.webp',detail:'Cuarto: gafas rectangulares, cabello corto gris oscuro, sin barba, guitarra clara y beca roja colgando al costado.'},
    {id:'laud',name:'El laúd',role:'La última nunca es la última.',instrument:'laud',reference:'reparto.webp',detail:'Quinto: cabello castaño corto, sonrisa, barba muy corta, beca roja y pequeño instrumento de cuerda. La identificación del instrumento es una interpretación visual.'}
  ];
  const settings=[
    ['Lopera · El ensayo','rehearsal','ensayo',105,0,['guitarra','bandurria','pandereta'],'Recoge los tres instrumentos y prepara Clavelitos.','Hay quien trae la voz. Tú trae también los instrumentos.','La primera ya suena. El ensayo empieza a parecer una actuación.'],
    ['Marmolejo · La primera ronda','street','marmolejo',105,1,['bandurria','guitarra','pandereta'],'Reúne a los compañeros antes de la serenata.','La hora de quedar y la hora de llegar se parecen poco.','Todos presentes. Nadie ha tocado desde el aparcamiento.'],
    ['Baños de la Encina · Serenata','castle','banos',100,1,['flor','flor','flor','flor'],'Recoge cuatro flores para abrir el balcón.','Las flores abren el balcón. El ritmo hace que se queden.','Se ha abierto el balcón. No era para pedir silencio.'],
    ['Arjona · La verbena','plaza','arjona',100,2,['partitura','partitura','partitura','partitura'],'Encuentra las partituras antes de la verbena.','Reyes en el escenario. Puntuales todavía estamos aprendiendo.','La plaza canta con vosotros. Hasta el que decía que solo venía a mirar.'],
    ['Lopera · Noche universitaria','university','grupo',95,2,['bandurria','guitarra','guitarra-gafas','laud'],'Reúne las cuerdas para la estudiantina.','El balcón no se abre con un mensaje: hay que afinar.','Hasta los balcones han marcado el compás.'],
    ['Marmolejo · Las cintas','festival','marmolejo',95,2,['flor','partitura','pandereta','guitarra'],'Recoge flores, partitura e instrumentos.','La capa lleva muchas cintas. Ninguna sustituye a las cuerdas.','Capa al viento, cuerdas afinadas y otra plaza ganada.'],
    ['Baños de la Encina · La isa','garden','banos',90,3,['bandurria','laud','guitarra','guitarra-gafas'],'Reúne los instrumentos de púa y las guitarras.','El viaje a Canarias lo ponemos en la música.','La isa ha puesto a bailar hasta al que guardaba los estuches.'],
    ['Arjona · Noche de copla','plaza','arjona',90,3,['flor','flor','partitura','guitarra-gafas'],'Prepara las flores y la guitarra para la copla.','La copla pide sentimiento. El jurado pide que no corramos.','La copla se ha quedado en la plaza. Vosotros vais a por otra.'],
    ['Lopera · El certamen','castle','caras',85,3,['partitura','bandurria','guitarra','laud','pandereta'],'Encuentra la partitura y reúne al equipo.','El jurado toma notas. Procura que las tuyas lleguen a tiempo.','El jurado también pide otra, aunque no lo diga.'],
    ['Lopera · La gran actuación','finale','grupo',85,4,['pandereta','guitarra','bandurria','guitarra-gafas','laud'],'Reúne a los cinco músicos para el gran final.','Última canción. Lo de irnos después lo hablamos después.','Diez canciones. Cinco músicos. Y el público sigue pidiendo otra.']
  ];
  const counts=[2,2,3,3,4,4,5,5,6,6],targets=[18,24,30,36,42,48,54,60,66,72];
  const levels=songs.map((s,i)=>{const [place,theme,photo,time,hazards,items,goal,intro,after]=settings[i];return {id:i,song:s.id,title:s.title,short:s.title,place,theme,photo,time,hazards,items,goal,intro,after,bpm:s.bpm,notes:targets[i],laneCount:counts[i],minGap:.76-i*.052,scrollSpeed:140+i*7,threshold:.5+Math.floor(i/2)*.025};});
  const data={characters,levels,lanes:['←','↓','↑','→','J','K'],keys:['A','S','W','D','J','K'],codes:['KeyA','KeyS','KeyW','KeyD','KeyJ','KeyK'],laneColors:['#ffc471','#ff89a5','#72dfd0','#b8abff','#86ceff','#f2d66d'],version:2};
  if(typeof module!=='undefined'&&module.exports)module.exports=data;else root.TunaData=data;
})(globalThis);
