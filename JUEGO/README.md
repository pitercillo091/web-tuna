# Una ronda más · versión 2

Juego web de la Rondalla de Lopera. Cada etapa combina una preparación en la plaza y una actuación musical. Esta actualización conserva el motor, las colisiones, los objetivos, la puntuación, las dos dificultades y el guardado de la versión anterior; amplía el repertorio a diez etapas y el reparto a cinco músicos pixel art.

## Jugar

Abre `index.html` en un navegador moderno o sirve esta carpeta con un servidor estático:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Abre `http://localhost:8765/`. La ejecución comprobada usa ese servidor. Para desplegar, sube toda la carpeta a `/JUEGO/`. El juego no necesita cuenta, base de datos ni dependencias externas. La web original permanece intacta.

Los navegadores requieren un primer toque o pulsación para activar el sonido. Puedes usar el nombre de la canción, «Otra canción» o empezar la partida. En Sonido se controlan música, efectos y volumen por separado.

## Controles

| Acción | Ordenador | Táctil / ratón |
| --- | --- | --- |
| Caminar | WASD o flechas | Cruceta o tocar la plaza |
| Recoger / entrar al escenario | Espacio cerca del objetivo | Tocar un objeto o escenario; el músico busca una ruta |
| Actuación | A, S, W, D, J, K según las teclas de la etapa | Botones musicales que aparecen según el nivel |
| Primeras cuatro columnas | También ←, ↓, ↑, → | Columnas con el mismo color que los botones |
| Alternativa de un botón | Espacio toca la nota más cercana; hay que acertar el tiempo | Botones musicales |
| Pausa | Escape o Pausa | Pausa |

Pulsa cuando la nota llegue a la línea dorada. Los aciertos iluminan el botón y producen partículas; los fallos muestran feedback rojo y reducen el ánimo. Al cambiar de pestaña se pausa. J y K solo actúan durante la música y no interfieren con el movimiento.

## Las diez canciones

| Etapa | Canción | Lugar y preparación | Teclas | Notas | BPM | Aciertos mínimos |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Clavelitos | Lopera: tres instrumentos | A S | 18 | 92 | 50% |
| 2 | Cielito Lindo | Marmolejo: tres compañeros | A S | 24 | 98 | 50% |
| 3 | Adelita | Baños de la Encina: cuatro flores | A S W | 30 | 104 | 53% |
| 4 | El Rey | Arjona: cuatro partituras | A S W | 36 | 108 | 53% |
| 5 | Estudiantina Madrileña | Lopera: cuatro músicos de cuerda | A S W D | 42 | 112 | 55% |
| 6 | Las Cintas de mi Capa | Marmolejo: flores, partitura e instrumentos | A S W D | 48 | 116 | 55% |
| 7 | La Isa Canaria | Baños: cuatro instrumentos de cuerda | A S W D J | 54 | 120 | 58% |
| 8 | La Morena de mi Copla | Arjona: flores, partitura y guitarra | A S W D J | 60 | 124 | 58% |
| 9 | María la Portuguesa | Lopera: partitura y equipo | A S W D J K | 66 | 128 | 60% |
| 10 | Cartagenera | Lopera: los cinco músicos | A S W D J K | 72 | 132 | 60% |

El porcentaje mostrado redondea los umbrales internos de 52,5% y 57,5%. Completar una etapa desbloquea la siguiente. Cada nueva tecla se presenta en las instrucciones y aparece entre las primeras notas. Aumentan el tempo, la velocidad visual y el número de objetivos; disminuye la separación mínima entre ataques elegibles. Se introducen notas a contratiempo y patrones derivados de las alturas del MIDI. Los charcos crecen de cero a cuatro y la preparación pasa de 105 a 85 segundos.

«Ritmo tranquilo» da un margen de ±230 ms, perfecto ±110 ms, daño de charco −12 y nota perdida −3,5. Normal: ±160 ms, perfecto ±75 ms, charco −18 y nota perdida −5. Al empezar la actuación se recupera el ánimo hasta un mínimo de 75. Espacio permite disfrutar del ritmo sin memorizar seis teclas.

## Puntos y progresión

Cada objeto suma 100 puntos una sola vez. Una nota perfecta suma 120 y una buena 80. El multiplicador crece 0,25 cada ocho notas consecutivas, hasta ×1,75. El tiempo de preparación restante da cinco puntos por segundo. Tres estrellas requieren 90% de aciertos; dos, 72%; una, superar el mínimo. Pierdes si se agota el tiempo, el ánimo o no alcanzas el mínimo musical. Puedes reiniciar y repetir niveles desbloqueados. Repetir una etapa completada sustituye su aportación al total, sin duplicarla.

Se conserva la clave `rondalla-una-ronda-mas-v1` de localStorage. La migración a versión 2 mantiene personaje, preferencias, cinco marcas y estrellas anteriores; si la ronda antigua estaba completa, desbloquea la sexta canción. Las marcas históricas se conservan aunque los primeros niveles ahora tengan otra cantidad de notas. Guardados corruptos o almacenamiento bloqueado no impiden jugar. El origen `file://` puede usar un guardado distinto al de HTTP.

## Tecnología y estructura

HTML, CSS y JavaScript sin dependencias de producción. Canvas 2D para el juego, SVG con las imágenes originales y atlas PNG para los personajes y Web Audio para reproducir eventos MIDI mediante síntesis ligera. No se depende del soporte MIDI nativo del navegador ni de bancos de sonido remotos.

```text
JUEGO/
  index.html                   Menús, controles, HUD y diálogos
  css/game.css                 Interfaz responsive y feedback
  src/data.js                  Reparto, niveles, teclas y dificultad
  src/engine.js                Movimiento, rutas, colisiones, ritmo y guardado
  src/art.js                   Escenarios, atlas, público y partículas
  src/game.js                  Controlador e integración
  src/songs.js                 Catálogo MIDI y copia binaria de respaldo
  src/midi.js                  Lector SMF, tempos y carga segura
  src/audio.js                 Reproducción, mezcla, rotación y efectos
  assets/audio/midi/           Diez archivos MIDI SMF-1
  assets/audio/partituras.json  Frases editables y tempos
  assets/audio/generar-midi.py  Exportador MIDI, Python sin dependencias
  assets/audio/FUENTES.md      Procedencia, atribución y alcance musical
  assets/personajes/           Cinco diseños, cinco atlas y generador
  assets/referencias/          Fotografías optimizadas y referencia del reparto
  assets/ui/escudo.webp        Escudo original optimizado
  PERSONAJES/                  Imagen aportada por el usuario, preservada
  docs/                       Fichas, análisis y resultados visuales
  tests/                      Pruebas y evidencias
```

Los fondos se dibujan una vez y se guardan en caché. El grupo, los ojos, instrumentos y ropa reutilizan diseños canónicos. La densidad de píxeles se limita a ×2, las voces de sonido están limitadas y no hay descargas externas durante la partida. Las fotografías se usan en versiones WebP pequeñas.

## Música: organización y edición

Cada MIDI tiene tres pistas: metadatos de tempo/compás, voz principal y acompañamiento de guitarra/bajo. Los nueve primeros son **fragmentos instrumentales**, adaptados de las partituras consultadas; no son grabaciones ni versiones completas de las canciones. **Cartagenera es un acompañamiento de cumbia con arpegios originales sobre su progresión armónica publicada. Su melodía vocal no está verificada.** La isa toma un fragmento del popurrí de isas canarias, pues existen variantes tradicionales.

Las fuentes, cambios y atribuciones están en `assets/audio/FUENTES.md` y en créditos. La licencia de los arreglos de Tablatunas no concede por sí misma derechos sobre las composiciones. La publicación de los temas protegidos requiere comprobar los permisos que cubren el repertorio del grupo; esta revisión no acredita tales permisos. No se distribuyen PDFs ajenos ni grabaciones comerciales.

En menú y recogida se usa una bolsa aleatoria: las diez canciones se barajan antes de comenzar otro ciclo y se evita repetir el tema que acaba de sonar, también al regresar de una actuación. «Otra canción» cambia el tema del menú. En la actuación se elige exactamente el MIDI del nivel. Cada objetivo jugable coincide con un ataque de la pista principal; el juego selecciona los ataques según la dificultad. Música y objetivos comparten el reloj de la partida, con tres segundos iniciales de preparación. Pausar detiene las voces; reanudar ancla el MIDI en la misma posición de la actuación. En la recogida, la música ambiental se reinicia al reanudar.

El lector admite SMF 0/1, PPQN, cambios de tempo y running status. Si falta un archivo, es inválido o tarda demasiado, usa los mismos bytes integrados en `songs.js`. Con `file://` se usa directamente esa copia. El juego sigue funcionando sin Web Audio. Imágenes secundarias ausentes tienen alternativas.

Para editar una canción:

1. Cambia su entrada en `assets/audio/partituras.json`. `phrase` contiene notas `G4:1` (una negra), `G#4:.5` (corchea), `R:1` (silencio) o TAB `20:.5` (segunda cuerda, traste 0). La afinación de referencia está en el generador.
2. Ejecuta `python assets/audio/generar-midi.py` desde JUEGO. Regenera los `.mid` y su copia integrada, sin instalar librerías.
3. Ajusta las pistas de acompañamiento en el generador si necesitas otra armonía. Cambia los timbres, envolventes y efectos en `src/audio.js`.
4. Comprueba los ataques, cantidad de objetivos, duración y permisos. Para importar otro MIDI, exporta los bytes en el catálogo y usa canal 0 para la voz que genera objetivos. No basta con sustituir el `.mid`: actualiza también su respaldo.

## Personajes y escenarios

Los cinco personajes utilizan las cinco imágenes oficiales adjuntas en la fase de sustitución de personajes: dos guitarristas, el músico de capa roja, el músico de pelo gris largo y el panderetista con gafas. Sus píxeles originales se recortan del fondo, sin redibujar caras, ropa, colores o instrumentos. Las copias originales, máscaras, recortes y huellas están en `assets/personajes/`. Los identificadores del reparto y los menús se conservan.

Cada personaje tiene una base SVG con imagen de 192 × 320 y un atlas PNG de 768 × 1280: cuatro columnas por cuatro filas (reposo, caminar, tocar, victoria). Las 16 poses comparten exactamente el rostro y reutilizan los píxeles de la base. Los movimientos de torso y piernas son pequeños; se conservan el salto de victoria y la orientación del dibujado anterior. Se reemplazaron bases y atlas completos. Las fichas y correspondencias con las imágenes están en `docs/PERSONAJES.md`.

Para regenerar, ejecuta `python assets/personajes/generar.py` con Pillow disponible. El generador y `tests/personajes.test.py` requieren Pillow; el juego sigue sin dependencias de producción. Ajusta las máscaras para corregir un recorte y regenera base y atlas juntos. No cambies los identificadores existentes. `tests/personajes-browser.html` muestra todas las animaciones con el renderer real y comprueba el respaldo SVG. Esta sustitución no altera mecánicas, música, niveles, controles, menús, dificultad, puntuación ni guardado.

Las plazas incorporan fachadas claras, macetas, banderines, luces, escenario, micrófonos, altavoces y público animado. Universidad, jardín y fiesta tienen detalles propios. La decoración conserva las rutas y colisiones originales. Para sustituir fotografías cambia `photo`/`reference` en `data.js`; usa imágenes optimizadas y conserva el escudo original.

## Añadir niveles

Añade la canción a `partituras.json` y una preparación a `settings` de `data.js`. Amplía los arrays `counts` y `targets` de la misma longitud. El nivel se construye a partir del catálogo de canciones. Configura lugar, tema, foto, tiempo, charcos, objetos, textos, teclas, separación entre objetivos y velocidad. Hay cinco posiciones de recogida: añade posiciones y verifica rutas si necesitas más de cinco objetivos. El guardado usa la cantidad de niveles automáticamente. Para superar seis teclas debes ampliar `keys`, `codes`, colores y distribución visual. Comprueba que el MIDI ofrece suficientes ataques para la cantidad solicitada.

## Pruebas

```sh
node tests/engine.test.cjs --report
node tests/audio.test.cjs
python tests/personajes.test.py
python tests/integrity.py
```

Desde el servidor, abre `tests/browser-integration.html`: usa el controlador, dibujo y menús reales para completar los diez niveles con un reloj controlado y guardado en memoria. `#qa` solo se habilita dentro del iframe de pruebas. `tests/music-browser.html` mide la señal de Web Audio de las diez canciones; su enlace de recursos ausentes comprueba las copias de respaldo. `tests/responsive.html` muestra escritorio y móvil, incluida la actuación de seis columnas. Resultados y límites de la campaña: `docs/PRUEBAS.md`. La sustitución posterior de los personajes y sus comprobaciones se documentan en `docs/PRUEBAS-PERSONAJES.md`.

## Siguientes ampliaciones

Una melodía verificada de Cartagenera, arreglos completos propios con permisos documentados, calibración de latencia de audio y nombres confirmados de los músicos. La curva de dificultad puede ajustarse después de observar partidas de jugadores reales.
