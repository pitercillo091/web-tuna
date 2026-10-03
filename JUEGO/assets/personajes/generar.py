"""Integrate official reference pixels into existing character SVGs and atlases.
Build dependency: Pillow. No procedural faces, costumes, recolouring or AI pixels.
The game's IDs and four animation rows are preserved.
"""
from pathlib import Path
from io import BytesIO
import base64, hashlib, json, math
from PIL import Image, ImageDraw, ImageChops

ROOT=Path(__file__).resolve().parent
SIZE=(192,320)
CAST=[
    ('pandereta',4,[(120,410,202,578),(210,410,312,578)]),
    ('guitarra',5,[(8,343,108,516),(110,343,214,516)]),
    ('bandurria',2,[(255,1110,491,1495),(550,1110,816,1495)]),
    ('guitarra-gafas',1,[(345,1000,474,1280),(545,1000,707,1265)]),
    ('laud',3,[(152,1270,363,1735),(408,1270,665,1735)]),
]

# Pixel selection of the large foreground figure in image 1. This corrects
# the generated mask's recentering, without modifying the source character.
GUITARIST=[(496, 420), (517, 420), (534, 431), (542, 448), (546, 467), (546, 491), (542, 517), (527, 544), (517, 555), (521, 565), (532, 569), (537, 577), (559, 584), (578, 592), (577, 606), (590, 618), (600, 633), (607, 649), (608, 661), (644, 642), (678, 623), (710, 605), (731, 590), (749, 580), (772, 586), (774, 613), (765, 625), (751, 637), (723, 641), (699, 654), (681, 665), (678, 693), (674, 720), (676, 734), (666, 748), (653, 760), (631, 770), (610, 771), (588, 765), (573, 754), (570, 747), (557, 759), (552, 776), (550, 798), (551, 824), (568, 849), (574, 864), (576, 877), (583, 890), (592, 916), (594, 936), (586, 947), (595, 988), (604, 1026), (613, 1068), (624, 1110), (634, 1149), (639, 1182), (653, 1185), (666, 1193), (674, 1203), (685, 1208), (691, 1215), (698, 1226), (701, 1237), (691, 1245), (672, 1250), (648, 1254), (602, 1254), (597, 1247), (597, 1226), (602, 1205), (597, 1185), (588, 1153), (578, 1111), (562, 1071), (542, 1036), (522, 995), (505, 965), (484, 941), (474, 952), (461, 965), (456, 994), (451, 1025), (441, 1055), (433, 1082), (430, 1117), (429, 1150), (428, 1190), (427, 1209), (433, 1229), (433, 1254), (427, 1267), (407, 1273), (365, 1274), (355, 1270), (355, 1261), (367, 1250), (374, 1240), (386, 1229), (387, 1205), (389, 1177), (391, 1123), (392, 1068), (395, 1023), (390, 980), (388, 959), (368, 957), (359, 944), (355, 926), (354, 902), (357, 880), (354, 874), (351, 861), (336, 843), (322, 825), (314, 805), (307, 780), (303, 762), (303, 745), (280, 733), (261, 726), (258, 710), (259, 689), (264, 671), (268, 654), (278, 639), (294, 626), (305, 622), (305, 604), (314, 588), (330, 581), (355, 575), (383, 568), (408, 564), (427, 558), (431, 545), (442, 546), (450, 552), (454, 542), (452, 527), (444, 521), (440, 511), (438, 498), (441, 483), (446, 479), (451, 482), (453, 465), (458, 449), (468, 435), (482, 427)]


def connected(mask):
    """Keep the figure, remove isolated mask dust, and fill interior pinholes."""
    w,h=mask.size;data=bytearray(mask.tobytes());seen=bytearray(w*h);largest=[]
    for start in range(w*h):
        if not data[start] or seen[start]:continue
        q=[start];seen[start]=1;component=[]
        while q:
            p=q.pop();component.append(p);x=p%w;y=p//w
            for n in ([p-1] if x else [])+([p+1] if x+1<w else [])+([p-w] if y else [])+([p+w] if y+1<h else []):
                if data[n] and not seen[n]:seen[n]=1;q.append(n)
        if len(component)>len(largest):largest=component
    figure=bytearray(w*h)
    for p in largest:figure[p]=255
    # All non-figure pixels reachable from the canvas edges are background.
    outside=bytearray(w*h);q=[]
    for p in list(range(w))+list(range(w*(h-1),w*h))+list(range(0,w*h,w))+list(range(w-1,w*h,w)):
        if not figure[p] and not outside[p]:outside[p]=1;q.append(p)
    while q:
        p=q.pop();x=p%w;y=p//w
        for n in ([p-1] if x else [])+([p+1] if x+1<w else [])+([p-w] if y else [])+([p+w] if y+1<h else []):
            if not figure[n] and not outside[n]:outside[n]=1;q.append(n)
    for p in range(w*h):
        if not outside[p]:figure[p]=255
    return Image.frombytes('L',(w,h),bytes(figure))


def selection(ident,source):
    if ident=='bandurria':return source.getchannel('A')
    if ident=='guitarra-gafas':
        mask=Image.new('L',source.size);ImageDraw.Draw(mask).polygon(GUITARIST,fill=255)
        pixels=source.load(); selected=mask.load()
        for y in range(source.height):
            for x in range(source.width):
                r,g,b,a=pixels[x,y]
                if b>r+35 and b>g+12:selected[x,y]=0
                # The cobbled street is visible outside the calves.
                if 960<y<1185 and r>135 and r>g+25 and g>b+20:selected[x,y]=0
        return mask
    raw=Image.open(ROOT/'mascaras'/(ident+'-seleccion.png')).convert('RGBA')
    luminance=raw.convert('L').point(lambda v:255 if v>=240 else 0)
    opacity=raw.getchannel('A').point(lambda v:255 if v>=128 else 0)
    mask=ImageChops.multiply(luminance,opacity).resize(source.size,Image.Resampling.NEAREST)
    mask=connected(mask)
    # These two source scenes have a blue floor; remove exterior spill from
    # the generated selection, preserving the original figure's RGB values.
    if ident in ('pandereta','guitarra'):
        pixels=source.load(); selection_pixels=mask.load()
        for y in range(source.height):
            for x in range(source.width):
                r,g,b,a=pixels[x,y]
                if b>r+35 and b>g+12:selection_pixels[x,y]=0
    return mask


def frame_image(source,mask):
    crop=mask.getbbox();cut=source.crop(crop);cut.putalpha(mask.crop(crop))
    # Clear only invisible RGB to avoid retaining background data in the PNG.
    empty=cut.getchannel('A').point(lambda a:255 if a==0 else 0)
    cut.paste((0,0,0,0),(0,0,cut.width,cut.height),empty)
    width,height=cut.size;ratio=min(184/width,304/height)
    fit=(round(width*ratio),round(height*ratio));offset=((192-fit[0])//2,316-fit[1])
    base=Image.new('RGBA',SIZE);base.paste(cut.resize(fit,Image.Resampling.NEAREST),offset)
    return cut,base,crop,fit,offset


def legs(source_size,crop,fit,offset,rectangles,base):
    result=[]
    for rect in rectangles:
        native=Image.new('L',source_size);ImageDraw.Draw(native).rectangle(rect,fill=255)
        layer=Image.new('L',SIZE);layer.paste(native.crop(crop).resize(fit,Image.Resampling.NEAREST),offset)
        layer=ImageChops.multiply(layer,base.getchannel('A').point(lambda v:255 if v else 0))
        result.append(layer)
    return result


def walk(base,masks,frame):
    if frame%2==0:return base.copy()
    shifts=[(-1,-2),(1,2)] if frame==1 else [(1,2),(-1,-2)]
    out=base.copy();alpha=out.getchannel('A');layer_data=[]
    for mask in masks:
        bbox=mask.getbbox()
        if not bbox:continue
        # Retain a joint overlap. Only lower legs move; source head is immutable.
        erase=mask.copy();ImageDraw.Draw(erase).rectangle((0,0,192,bbox[1]+8),fill=0)
        alpha=ImageChops.subtract(alpha,erase)
        layer=base.copy();layer.putalpha(ImageChops.multiply(base.getchannel('A'),mask))
        layer_data.append(layer)
    out.putalpha(alpha)
    for layer,(dx,dy) in zip(layer_data,shifts):
        shifted=Image.new('RGBA',SIZE);shifted.paste(layer,(dx,dy))
        # Paste source values rather than alpha-compositing/recolouring them.
        cover=shifted.getchannel('A').point(lambda v:255 if v else 0)
        out.paste(shifted,(0,0),cover)
    return out


def torso(base,phase):
    out=Image.new('RGBA',SIZE)
    for y in range(320):
        shift=round(math.sin(math.pi*(y-96)/124)*phase*2) if 96<y<220 else 0
        out.paste(base.crop((0,y,192,y+1)),(shift,y))
    return out


def png_bytes(image):
    out=BytesIO();image.save(out,format='PNG',optimize=True);return out.getvalue()


def build():
    manifest=[];comparison=Image.new('RGBA',(5*240,440),(28,30,42,255));draw=ImageDraw.Draw(comparison)
    for index,(ident,number,rectangles) in enumerate(CAST):
        original=ROOT/'referencias'/f'image-{number}.png';source=Image.open(original).convert('RGBA')
        mask=selection(ident,source);mask.save(ROOT/'mascaras'/(ident+'.png'))
        cut,base,crop,fit,offset=frame_image(source,mask)
        cut.save(ROOT/'recortes'/(ident+'.png'),optimize=True)
        encoded=base64.b64encode(png_bytes(base)).decode('ascii')
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="192" height="320" viewBox="0 0 192 320" preserveAspectRatio="xMidYMax meet"><image width="192" height="320" href="data:image/png;base64,{encoded}"/></svg>'
        (ROOT/(ident+'.svg')).write_text(svg,encoding='utf-8')
        atlas=Image.new('RGBA',(768,1280));phases=[0,1,0,-1]
        for row,state in enumerate(['idle','walk','playing','victory']):
            for frame in range(4):
                pose=walk(base,legs(source.size,crop,fit,offset,rectangles,base),frame) if state=='walk' else torso(base,phases[frame]*(1 if state=='playing' else .5))
                atlas.paste(pose,(frame*192,row*320))
        atlas.save(ROOT/(ident+'-atlas.png'),optimize=True)
        # Identity sheet copies the same canonical pixels, rather than drawing.
        comparison.paste(base,(index*240+24,62),base)
        draw.text((index*240+15,15),ident,fill=(244,222,185))
        draw.text((index*240+15,405),f'Referencia {number}',fill=(244,222,185))
        manifest.append(dict(id=ident,reference=f'referencias/image-{number}.png',referenceSha256=hashlib.sha256(original.read_bytes()).hexdigest(),crop=list(crop),fit=list(fit),offset=list(offset),frame=list(SIZE),immutableHead=[0,0,192,96],rows=['idle','walk','playing','victory']))
        print(ident,'ref',number,'crop',crop,'fit',fit,'atlas',atlas.size)
    comparison.save(ROOT/'comparacion-reparto.png',optimize=True)
    (ROOT/'referencias.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Cinco figuras originales integradas; 80 poses sin redibujar rostros o ropa.')


if __name__=='__main__':build()
