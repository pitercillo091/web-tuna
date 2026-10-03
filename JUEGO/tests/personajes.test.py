"""Verify source pixels, all 80 poses and isolation from gameplay (Pillow)."""
from pathlib import Path
from io import BytesIO
import base64, hashlib, json, xml.etree.ElementTree as ET
from PIL import Image

GAME=Path(__file__).resolve().parents[1]
ROOT=GAME/'assets/personajes'
manifest=json.loads((ROOT/'referencias.json').read_text(encoding='utf8'))
assert {c['id'] for c in manifest}=={'pandereta','guitarra','bandurria','guitarra-gafas','laud'}
def pixels(im):
    data=im.tobytes()
    return iter(data) if im.mode=='L' else zip(data[0::4],data[1::4],data[2::4],data[3::4])

heads=[];frames_checked=0
for c in manifest:
    name=c['id'];original=ROOT/c['reference']
    assert hashlib.sha256(original.read_bytes()).hexdigest()==c['referenceSha256']
    source=Image.open(original).convert('RGBA');mask=Image.open(ROOT/'mascaras'/f'{name}.png').convert('L')
    assert mask.size==source.size and list(mask.getbbox())==c['crop']
    crop=source.crop(c['crop']);cut=Image.open(ROOT/'recortes'/f'{name}.png').convert('RGBA')
    assert cut.size==crop.size
    # Every visible cutout pixel retains its exact original RGB, at the same
    # original position, and the selected opacity. No generated face or paint.
    for raw,actual,alpha in zip(pixels(crop),pixels(cut),pixels(mask.crop(c['crop']))):
        assert actual[3]==alpha
        if alpha:assert actual[:3]==raw[:3], f'RGB modificado: {name}'
        else:assert actual==(0,0,0,0)
    if name=='bandurria':assert mask.tobytes()==source.getchannel('A').tobytes()
    svg=ET.parse(ROOT/f'{name}.svg').getroot()
    assert svg.attrib['viewBox']=='0 0 192 320'
    embedded=svg.find('{http://www.w3.org/2000/svg}image').attrib['href'].split(',',1)[1]
    base=Image.open(BytesIO(base64.b64decode(embedded))).convert('RGBA')
    expected=Image.new('RGBA',(192,320));expected.paste(cut.resize(c['fit'],Image.Resampling.NEAREST),tuple(c['offset']))
    assert base.tobytes()==expected.tobytes(), f'Escala o color diferente: {name}'
    atlas=Image.open(ROOT/f'{name}-atlas.png').convert('RGBA');assert atlas.size==(768,1280)
    canonical_head=base.crop(c['immutableHead']).tobytes();heads.append(canonical_head)
    palette={p for p in pixels(base) if p[3]};poses=[]
    for row in range(4):
        row_poses=[]
        for column in range(4):
            frame=atlas.crop((column*192,row*320,(column+1)*192,(row+1)*320))
            assert frame.crop(c['immutableHead']).tobytes()==canonical_head, f'Identidad diferente: {name}/{row}/{column}'
            assert all(p in palette for p in pixels(frame) if p[3]), f'Pixel inventado: {name}/{row}/{column}'
            bounds=frame.getchannel('A').getbbox()
            assert bounds and 0<=bounds[0]<bounds[2]<=192 and 0<=bounds[1]<bounds[3]<=320
            # Moving layers must remain inside the cell and retain visible
            # coverage; this catches empty frames or accidentally lost limbs.
            count=sum(bool(p[3]) for p in pixels(frame));base_count=sum(bool(p[3]) for p in pixels(base))
            assert .96*base_count<count<1.04*base_count
            row_poses.append(frame.tobytes());frames_checked+=1
        assert row_poses[0]==base.tobytes(), f'Base diferente: {name}/{row}'
        assert len(set(row_poses))>=3, f'Animacion sin movimiento: {name}/{row}'
    print('PASS',name,'RGB original, escala proporcional, cara inmutable, cuatro animaciones')
assert len(set(heads))==5 and frames_checked==80

baseline=json.loads((ROOT/'regresion-referencia.json').read_text(encoding='utf8'))
for name,digest in baseline['files'].items():
    content=(GAME/name).read_bytes()
    if name=='tests/browser-integration.html':
        # The sole updated expectation is the new character atlas width.
        content=content.replace(b"qa.art.images[c.id+'-atlas']?.naturalWidth===768",b"qa.art.images[c.id+'-atlas']?.naturalWidth===192")
    assert hashlib.sha256(content).hexdigest()==digest, f'Cambio fuera de personajes: {name}'
old="if(this.images[id+'-atlas'])c.drawImage(this.images[id+'-atlas'],frame*48,row*80,48,80,-40,-132,80,133);"
new="if(this.images[id+'-atlas']){const atlas=this.images[id+'-atlas'],w=atlas.naturalWidth/4,h=atlas.naturalHeight/4;c.drawImage(atlas,frame*w,row*h,w,h,-40,-132,80,133);}"
renderer=(GAME/'src/art.js').read_text(encoding='utf8')
assert renderer.count(new)==1 and renderer.replace(new,old)==baseline['rendererBefore'], 'Cambio adicional en renderer'
print('PASS 80 poses, cinco fuentes originales, 59 archivos protegidos y renderer: solo tamaño de celda')
print('PASS motor, musica, niveles, controles, menus, dificultad, puntos y guardado sin cambios')
