# Validación · versión 2 · 3 de octubre de 2026

## Resultado

Diez etapas completadas hasta la victoria final. Se conservan las funciones anteriores y los 97 archivos originales de la web permanecen intactos.

| Comprobación | Resultado y evidencia |
| --- | --- |
| Motor | 20/20; campaña de diez canciones en ambas dificultades; `tests/engine-results.json` |
| MIDI, audio y migración | 21 comprobaciones; diez SMF válidos, copias integradas idénticas, ataques sincronizados, bolsa de diez canciones, 1000 transiciones sin repetición inmediata, vuelta de actuación, pausa y preferencias; `tests/audio.test.cjs` |
| Integración real en navegador | 101 comprobaciones correctas, 0 fallos; `tests/browser-results.txt` |
| Música real | AudioContext activo y señal RMS medida para las diez canciones: 13/13; `tests/music-browser-results.txt` |
| Ausencia de todos los MIDI | Se simula un fallo de carga sin retirar los archivos originales; las diez copias integradas producen audio: 13/13; `tests/midi-fallback-results.txt` |
| Personajes | Cinco identidades distintas y rostros idénticos en los 80 fotogramas; PNG con dimensiones y CRC válidos; `tests/personajes.test.py` |
| Objetivos y colisiones | Todos los objetivos alcanzables mediante rutas; bancos y bordes bloquean el paso; charcos causan daño con inmunidad temporal |
| Controles | WASD, flechas, espacio, J y K, botones táctiles y nuevas columnas comprobados en el motor/controlador |
| Pantallas y puntos | Inicio, instrucciones, pausa, ajustes, derrota, reinicio, cambio de nivel, estrellas, combos, puntuación y victoria final |
| Guardado | Diez niveles, lectura de resultados y migración del guardado anterior, preferencias, datos corruptos y almacenamiento bloqueado |
| Responsive | Iframe real de 390 × 844, 844 × 390 y 1200 × 850; seis columnas y botones de al menos 44 px; sin desbordamiento horizontal; `tests/responsive-results.json` |
| Optimización | Cinco atlas PNG, 17.996 bytes en total, frente a 2.333.632 bytes de los atlas SVG previos de esta fase; mismos píxeles |
| Web original | 97 huellas SHA-256 sin cambios; `tests/integrity.py` |
| Sintaxis | Los siete scripts pasan la comprobación de sintaxis de Node; cambios limitados a JUEGO |

## Partida completa

La integración carga el juego real en un iframe con guardado en memoria. Acciona sus botones, envía teclas y eventos de los botones musicales, comprueba rutas y colisiones y recorre las diez canciones con pasos pequeños del reloj. Usa el controlador, HUD, diálogos y renderer de producción. Se silencian las actuaciones durante la simulación acelerada, después de verificar la activación del audio; el sonido se comprueba por separado en tiempo real.

Resultado: victoria con 100% de aciertos en las diez etapas, combo final 72 y 89.324 puntos de ronda. Se cargaron los cinco atlas PNG en el renderer. Esta ejecución determinista comprueba la integración y la lógica; no sustituye la valoración de la curva por jugadores reales.

Como comprobación complementaria, en la partida normal se cambió la canción del menú, se recogieron los tres instrumentos de Clavelitos por rutas reales, se entró al escenario, se dejó terminar la actuación sin aciertos para provocar derrota, se reinició y se verificaron pausa y reanudación. El progreso anterior sigue visible tras recargar. No se ha afirmado que se jugasen manualmente las diez canciones con 100% de aciertos.

## Música y recuperación

La prueba `music-browser.html` sintetiza cada canción durante 1,5 segundos y mide una señal superior a cero mediante un analizador de Web Audio. Comprueba diez cargas, contexto activo y limpieza de voces. Su modalidad `?fallback=1` provoca errores de fetch y vuelve a reproducir las mismas diez canciones desde el catálogo integrado.

Una ejecución inicial del respaldo produjo señales nulas en los últimos cinco temas. Se repitió con diagnóstico de estado, voces y reloj del contexto: las diez señales fueron positivas, contexto running y reloj continuo. Los archivos de respaldo son binariamente idénticos a los MIDI, verificado también en Node. No se identifica una diferencia de contenido en el respaldo; la primera lectura queda como una incidencia intermitente de la medición en el navegador integrado, cuya causa no se confirmó. Los informes guardados corresponden a las ejecuciones finales correctas.

La prueba mide producción de señal, no calidad de altavoces, latencia de Bluetooth ni reconocimiento musical por un intérprete. Los nueve primeros temas son fragmentos instrumentales transcritos; Cartagenera es acompañamiento, con melodía vocal pendiente de verificar. Fuentes y alcance: `assets/audio/FUENTES.md`.

## Consola y límites

La consola del juego normal se revisó sin errores. Las pruebas musicales no registraron errores JavaScript. Al inspeccionar iframes, el navegador instrumentado registró un error de MutationObserver sin URL de origen. Ningún script de JUEGO utiliza ese observador; la campaña real completó las 101 comprobaciones. No se detectaron errores críticos del juego.

Las vistas móviles usan iframes con sus dimensiones reales y estilos responsive; no se probó un teléfono físico. La apertura directa `file://` está preparada con scripts clásicos y MIDI integrados, pero el navegador de inspección solo permite HTTP/HTTPS: la ejecución verificada usa el servidor estático.

Las capturas de esta fase llevan prefijo `v2-`: inicio, jardín, móvil vertical/horizontal, derrota y victoria. Las capturas antiguas y `tests/missing-photo-results.txt` pertenecen a la primera versión; no son pruebas de la nueva campaña. Los recursos temporales de inspección de partituras y atlas redundantes se retiraron del juego; los documentos originales externos se preservaron.

## Repetir

Desde JUEGO:

```sh
node tests/engine.test.cjs --report
node tests/audio.test.cjs
python tests/personajes.test.py
python tests/integrity.py
```

Sirve JUEGO con cualquier servidor estático. Abre `tests/browser-integration.html`, `tests/music-browser.html` y `tests/responsive.html`. Las pruebas no requieren instalar dependencias ni alteran el guardado de una partida normal.
