# Personajes oficiales · sustitución de sprites

Las cinco imágenes adjuntas son la fuente principal de esta fase. Se guardan copias idénticas en `assets/personajes/referencias/`; sus SHA-256 están en `referencias.json`. No se han generado caras, peinados, prendas, colores, escudos ni instrumentos nuevos.

| Imagen oficial | Identificador existente | Figura utilizada |
| --- | --- | --- |
| image-1.png | guitarra-gafas | Guitarrista central de pelo gris corto y guitarra clara; sin gafas |
| image-2.png | bandurria | Músico de pelo castaño, barba completa y capa roja con bordes dorados |
| image-3.png | laud | Músico de pelo gris largo, beca roja y cuerda de doble clavijero |
| image-4.png | pandereta | Panderetista con gafas, barba, capa negra y cintas originales |
| image-5.png | guitarra | Guitarrista de cabeza despejada con beca roja |

Los identificadores y nombres de selección anteriores se conservan para mantener menús y guardados. `guitarra-gafas` es un identificador histórico; la figura actual no lleva gafas. `laud` conserva la etiqueta anterior del juego sin cambiar el instrumento visible de la referencia. No se atribuyen nombres personales.

## Preparación fiel a las imágenes

La figura de la segunda imagen conserva su transparencia original. Las otras cuatro se separan de su fondo mediante máscaras. La herramienta de imagen se utilizó únicamente para preparar selecciones blancas de las siluetas, con instrucciones de conservar posición y contorno, excluir el fondo y no dibujar personajes nuevos. La máscara del guitarrista de la primera imagen se corrigió manualmente sobre las coordenadas originales porque la selección automática cambió su encuadre.

El generador copia el RGB original de cada píxel seleccionado. Elimina solamente el fondo, limpia el RGB invisible y escala proporcionalmente con vecino más cercano. Las selecciones se encuentran en `mascaras/`, y los recortes completos en `recortes/`. Las figuras o instrumentos cortados por el límite de una imagen se mantienen cortados: no se reconstruyen partes inventadas. La primera imagen utiliza solo al guitarrista principal, sin los personajes del fondo, perro, textos ni símbolos de la escena.

## Bases y animaciones

Se han sustituido los cinco sprites base completos y los cinco atlas completos. Cada base SVG contiene el PNG canónico de 192 × 320. Cada atlas PNG mide 768 × 1280: cuatro columnas de 192 × 320 y cuatro filas, en el mismo orden que antes:

1. Reposo: oscilación mínima de la zona del torso.
2. Caminar: desplazamiento alterno de las capas de las piernas.
3. Actuación: oscilación del torso y del instrumento que ya aparece en la imagen.
4. Victoria: la misma identidad y un movimiento leve; el salto del renderer anterior se conserva.

Cada primera columna es la base exacta. Los primeros 96 píxeles de altura, que contienen pelo y rostro, son idénticos en los 16 fotogramas. Las animaciones desplazan píxeles existentes; no repintan zonas ni incorporan colores. Se conserva la orientación original del renderer al desplazarse en cualquier dirección. Las manos no adoptan nuevas poses inventadas; los movimientos son deliberadamente pequeños para conservar los dibujos oficiales.

El tamaño y anclaje en el juego siguen siendo los anteriores. Solo se ha ajustado una línea de `src/art.js`, dentro de `character()`, para obtener el tamaño de celda a partir del atlas. Escenarios, posiciones, sombras, partículas, tiempos, controles y lógica no cambian. Si falta el atlas se utiliza el SVG de esa misma figura, igual que antes.

Los cinco atlas suman aproximadamente 1,21 MB comprimidos y ocupan unos 19 MiB al decodificarse. Esa mayor resolución permite conservar detalles de las imágenes oficiales. El navegador carga únicamente las bases y atlas, nunca las referencias completas ni las máscaras.

## Regenerar y comprobar

El generador y la comprobación de imágenes utilizan Python con Pillow. Son herramientas de mantenimiento; jugar no requiere Python ni instalar dependencias.

Desde JUEGO:

```sh
python assets/personajes/generar.py
python tests/personajes.test.py
node tests/engine.test.cjs
node tests/audio.test.cjs
python tests/integrity.py
```

`referencias.json` registra imagen, huella, recorte, escala y anclaje de cada figura. Para ajustar un borde, cambia su máscara o la selección del generador y regenera SVG y atlas juntos. No cambies los identificadores ni los nombres de archivo existentes. Para sustituir una referencia en una fase futura, actualiza su máscara y comprueba visualmente cara, ropa, instrumento y recorte.

`tests/personajes.test.py` verifica el RGB contra el origen, la escala proporcional, 80 poses, rostros inmutables, colores procedentes de la base, movimiento y cobertura de cada fotograma. También compara 59 archivos protegidos con la instantánea anterior y permite exclusivamente la adaptación de la anchura del atlas en una comprobación de integración. Verifica que el renderer conserva el resto de su código exactamente igual.

`tests/personajes-browser.html` permite ver las cinco figuras con el renderer real en reposo, caminar, actuación, victoria y respaldo SVG. No modifica partidas ni guardados. El informe de esta fase está en `docs/PRUEBAS-PERSONAJES.md`.
