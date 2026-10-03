"""Export editable short instrumental arrangements as genuine SMF-1 MIDI.

Standard library only. TAB tokens = string(1..6),fret:quarter-note duration;
R is a rest. Sources and changes are recorded in FUENTES.md.
The embedded bytes are the SAME files, a fallback for file:// or failed fetch.
"""
from pathlib import Path
import json, struct, base64

ROOT = Path(__file__).resolve().parents[2]
TUNING = [81, 76, 71, 66, 61, 56]
SONGS = [
 ('clavelitos','Clavelitos',92,3,'Am',
  '20:.5 21:.5 20:.5 21:.5 20:3 20:.5 21:.5 20:.5 21:.5 20:3 R:1 10:1 12:1 13:3 12:3 10:1 20:1 21:1 '
  'R:1 33:1 20:1 13:2 12:1 10:1 24:1 12:1 10:2 R:1 R:1 20:1 20:1 20:2 20:1 23:1.5 21:.5 20:1 33:2 R:2 20:1 15:2 13:1 12:1 10:1 13:1 12:3'),
 ('cielito-lindo','Cielito Lindo',98,3,'A',
  'R:.5 20:.5 22:.5 24:.5 10:.5 12:.5 14:3 12:2 10:1 22:3 22:3 22:1 20:1 24:1 10:3 10:1 24:1 23:1 22:2 20:1 22:1 22:1 20:1 '
  '15:1 15:1 12:1 12:1 24:1 20:1 22:1 22:1 20:1 20:1 15:1 14:1 12:1 10:2'),
 ('adelita','Adelita',104,2,'G',
  'R:.5 22:.5 23:.5 10:.5 12:.5 23:.5 12:.5 23:.5 12:.5 15:.5 14:.5 12:.5 10:.5 22:.5 10:.5 22:.5 10:.5 14:.5 12:.5 10:.5 '
  '23:.5 20:.5 23:.5 20:.5 23:.5 12:.5 10:.5 23:.5 22:1 23:1 10:.5 22:.5 23:.5 10:.5 '
  '20:.5 23:.5 22:.5 20:.5 33:1 23:1 10:1 22:1 14:2 R:1 14:.5 14:.5 14:1 12:.5 10:.5 12:1 10:.5 23:.5 12:.5 10:1.5 10:.5 R:.5 10:.5 10:.5 23:.5 10:.5 12:.5 10:.5 23:.5 22:3'),
 ('el-rey','El Rey',108,3,'C',
  'G4:1 G4:1 B4:2 G4:1 B4:2 G4:.5 G4:.5 B4:1 G4:2 R:1 E4:.5 F4:.5 G4:.5 A4:.5 B4:2 G4:1 B4:2 G4:.5 G4:.5 F4:1 E4:2 '
  'R:1 G4:1 A4:1 B4:1 G4:1 C5:2 B4:2 A4:3 '
  'C4:1 R:1 R:1 R:1 F4:1 G4:1 A4:2 G4:1 A4:2 G4:1 F4:1 D4:3 E4:1 F4:1 G4:1 F4:1 E4:1 D4:1 B4:3'),
 ('estudiantina-madrilena','Estudiantina Madrileña',112,2,'E',
  'R:.5 15:.25 15:.25 15:.5 13:.5 12:.5 12:.25 13:.25 12:.5 10:.5 23:.5 23:.25 10:.25 23:.5 22:.5 20:.5 33:.5 20:.5 21:.5 22:.5 13:.25 13:.25 13:.5 12:.5 '
  '10:.5 10:.25 12:.25 10:.5 23:.5 22:.5 22:.25 23:.25 22:.5 20:.5 33:.5 20:.5 22:.5 10:.5 '
  '12:1.5 24:.5 10:.5 10:.5 10:.5 22:.5 24:1.5 22:.5 20:.5 24:.5 22:.5 20:.5 10:2 24:2 26:.25 26:.25 26:.5 24:1 22:1 22:.25 22:.25 22:.5 20:.5 24:.5 14:.5 12:.5 10:.5'),
 ('cintas-capa','Las Cintas de mi Capa',116,4,'A',
  '20:.5 22:.5 20:.5 10:.5 10:.5 10:.5 24:.5 22:.5 20:1 R:1 R:1 24:.5 10:.5 24:.5 22:.5 20:.5 23:.5 23:.5 10:1.5 R:2 '
  'R:1 23:.5 10:.5 14:.5 14:.5 14:.5 12:.5 10:.5 23:1.5 R:2 R:1 24:.5 10:.5 24:.5 22:.5 20:.5 23:.5 23:.5 10:1.5 R:2 '
  'R:1 22:.5 10:.5 10:.5 10:.5 10:.5 24:.5 22:.5 20:1 10:1 12:1 14:1 10:.5 12:.5 14:1 10:1 12:1 14:1 15:1 '
  'R:1 12:.5 14:.5 15:.5 15:.5 15:.5 14:.5 12:.5 10:.5 10:.5 12:.5 14:.5 14:.5 14:.5 12:.5 10:.5 24:1.5 R:1'),
 ('isa-canaria','La Isa Canaria',120,3,'G',
  '12:.5 10:.5 22:.5 10:.5 12:.5 10:.5 15:.5 10:.5 22:.5 10:.5 22:.5 10:.5 12:.5 10:.5 22:.5 10:.5 12:.5 10:.5 14:.5 10:.5 23:.5 10:.5 23:.5 10:.5 '
  '12:.5 10:.5 23:.5 10:.5 12:.5 10:.5 14:.5 10:.5 23:.5 10:.5 23:.5 10:.5 14:.5 12:.5 10:.5 23:.5 22:.5 20:.5 33:1 22:.5 10:.5 22:1 '
  'R:2 10:1 10:2 22:1 33:1 12:1.5 10:.5 10:2 23:1 20:3 R:2 10:1 10:2 23:1 20:1 10:1.5 20:.5 23:3 22:3'),
 ('morena-copla','La Morena de mi Copla',124,2,'G',
  '12:1 12:.5 12:.5 12:1 12:.5 10:.5 13:.5 12:1.5 12:1 R:.5 12:.5 15:1 15:.5 13:.5 15:1.5 13:.5 13:.5 12:1 13:.5 '
  '12:.25 13:.25 12:.25 10:.25 24:.5 10:.5 12:1 12:.5 12:.5 12:1 12:.5 10:.5 13:.5 12:2.5 R:.5 12:.5 15:1.5 12:.5 23:1 10:.5 23:.5 21:.5 20:1.5 R:2 '
  '21:1 21:.5 23:.5 10:1 10:.5 23:.5 23:.5 23:1.5 R:3 23:.5 15:.5 17:4 R:.5 17:.5 15:.5 13:.5 15:1.5 12:.5'),
 ('maria-portuguesa','María la Portuguesa',128,2,'C',
  'R:1 R:.5 33:.5 20:.5 23:.5 22:.5 20:.5 22:1 33:1 22:.5 10:.5 23:.5 22:.5 23:.5 33:.5 20:.5 23:.5 12:1.5 21:.5 '
  '10:.5 23:.5 22:.5 20:.5 24:.5 10:.5 12:.5 13:.5 10:1.5 12:.5 15:1.5 12:.5 13:.5 15:.5 13:.5 12:.5 10:2 '
  '12:.5 23:.5 10:.5 12:.5 17:1.5 23:.5 10:.5 23:.5 22:.5 20:.5 24:.5 10:.5 12:.5 13:.5 10:1 13:1 12:1 23:1 10:2 '
  '23:.5 10:.5 12:.667 10:.667 23:.666 10:.667 22:.667 23:.666 10:2 R:1 22:.5 23:.5 10:1 23:.5 22:.5 23:.667 20:.667 22:.666 23:2'),
 ('cartagenera','Cartagenera',132,4,'Am',
  # Original instrumental cumbia voicing of the published harmonic progression.
  # No third-party commercial MIDI or recording is distributed.
  'A4:.75 C5:.25 E5:.5 C5:.5 B4:.75 G#4:.25 E4:1 A4:.75 C5:.25 E5:.5 D5:.5 C5:.75 B4:.25 A4:1 '
  'G4:.5 B4:.5 D5:.75 B4:.25 F4:.5 A4:.5 C5:.75 A4:.25 E4:.5 G#4:.5 B4:.75 G#4:.25 A4:2 '
  'E5:.5 E5:.5 D5:.75 B4:.25 G#4:.5 B4:.5 E5:1 E5:.5 D5:.5 C5:.75 B4:.25 A4:.5 C5:.5 E5:1 '
  'G5:.5 F5:.5 E5:.75 D5:.25 C5:.5 B4:.5 A4:1 F5:.5 E5:.5 D5:.75 C5:.25 B4:.5 G#4:.5 A4:2'),
]

def vlq(n):
    out=[n&127];n>>=7
    while n: out.insert(0,(n&127)|128);n>>=7
    return bytes(out)

def track(events):
    events.sort(key=lambda e:(e[0],e[1][0]>>4!=8))
    out=b'';last=0
    for tick,event in events: out+=vlq(tick-last)+event;last=tick
    out+=b'\x00\xff\x2f\x00'
    return b'MTrk'+struct.pack('>I',len(out))+out

def pitch(token):
    if token=='R':return None
    if token[0].isdigit(): return TUNING[int(token[0])-1]+int(token[1:])-12
    import re
    m=re.fullmatch(r'([A-G])([#b]?)(\d)',token)
    return (int(m[3])+1)*12+dict(C=0,D=2,E=4,F=5,G=7,A=9,B=11)[m[1]]+({'#':1,'b':-1}.get(m[2],0))

def build():
    bank=[];outdir=ROOT/'assets/audio/midi';outdir.mkdir(parents=True,exist_ok=True)
    editable_path=ROOT/'assets/audio/partituras.json'
    editable=json.loads(editable_path.read_text(encoding='utf-8-sig')) if editable_path.exists() else [dict(zip(['id','title','bpm','meter','key','phrase'],s)) for s in SONGS]
    for entry in editable:
        ident,title,bpm,meter,key,phrase=[entry[k] for k in ['id','title','bpm','meter','key','phrase']]
        raw=[];beat=0
        for token in phrase.split():
            n,d=token.split(':');d=float(d);p=pitch(n)
            if p is not None:raw.append([beat,d*.88,p])
            beat+=d
        # Two passes give enough music to practice without a three-minute level.
        length=int(beat+.999);passes=3 if ident=='cartagenera' else 2;notes=[[a+j*length,d,p] for j in range(passes) for a,d,p in raw]
        tempo=int(60_000_000/bpm)
        meta=[(0,b'\xff\x51\x03'+tempo.to_bytes(3,'big')),(0,b'\xff\x58\x04'+bytes([meter,2,24,8])),(0,b'\xff\x03'+vlq(len(title.encode()))+title.encode())]
        lead=[(0,bytes([0xc0,24]))];back=[(0,bytes([0xc1,24])),(0,bytes([0xc2,32]))]
        for at,d,p in notes:
            lead.extend([(round(at*480),bytes([0x90,p,85])),(round((at+d)*480),bytes([0x80,p,0]))])
        rootnote={'Am':57,'A':57,'G':55,'C':60,'E':52}[key];minor=key.endswith('m')
        for b in range(length*passes):
            shift=[0,0,5,7][(b//(meter*2))%4];chord=[rootnote+shift,rootnote+shift+(3 if minor else 4),rootnote+shift+7]
            if ident=='cartagenera':
                # Verse and chorus harmony from Tuna España; original arpeggios.
                progression=['Am','E7','Am','Am','G','F','E7','Am','E7','Am','E7','Am','G','F','E7','Dm','Am','E7','Am']
                voicings={'Am':[57,60,64],'E7':[52,56,59,62],'G':[55,59,62],'F':[53,57,60],'Dm':[50,53,57]}
                chord=voicings[progression[(b//meter)%len(progression)]]
            for j,p in enumerate(chord):
                t=b*480+j*14;back.extend([(t,bytes([0x91,p,44])),(t+190,bytes([0x81,p,0]))])
            if b%meter==0:back.extend([(b*480,bytes([0x92,chord[0]-12,60])),(b*480+320,bytes([0x82,chord[0]-12,0]))])
        binary=b'MThd'+struct.pack('>IHHH',6,1,3,480)+track(meta)+track(lead)+track(back)
        (outdir/(ident+'.mid')).write_bytes(binary)
        bank.append(dict(id=ident,title=title,bpm=bpm,meter=meter,file='assets/audio/midi/'+ident+'.mid',bytes=base64.b64encode(binary).decode(),arrangement='acompañamiento de cumbia' if ident=='cartagenera' else 'fragmento melódico instrumental'))
    (ROOT/'src/songs.js').write_text('(function(r){const songs='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined"&&module.exports)module.exports=songs;else r.TunaSongs=songs;})(globalThis);\n',encoding='utf-8')
    (ROOT/'assets/audio/partituras.json').write_text(json.dumps(editable,ensure_ascii=False,indent=2),encoding='utf-8')
    print('10 MIDI SMF-1 generados; copia binaria integrada para funcionamiento sin conexión.')

if __name__=='__main__':build()
