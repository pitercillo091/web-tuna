# Verificación de la sustitución de personajes · 3 de octubre de 2026

Esta fase modifica únicamente las figuras y sus animaciones. No cambia la campaña ni los escenarios de la versión 2.

| Comprobación | Resultado |
| --- | --- |
| Fuentes oficiales | Cinco copias conservan los SHA-256 de las imágenes adjuntas |
| Fidelidad del recorte | RGB visible idéntico al píxel situado en la misma posición del original; transparencia y escala proporcional comprobadas |
| Animaciones | 80 fotogramas; rostros idénticos a la base, ninguna paleta nueva, movimiento en cada fila y cobertura conservada |
| Carga en navegador | Cinco SVG y cinco atlas de 768 × 1280 cargados y usados por el renderer |
| Revisión visual | Cinco figuras en reposo, caminar, actuación y victoria; respaldo SVG probado |
| Motor | 20/20, incluida campaña de diez niveles en las dos dificultades |
| MIDI y audio | 21/21, pistas, sincronización, rotación, volumen, pausa y migración |
| Integración | 101 comprobaciones correctas, 0 fallos; diez niveles hasta la victoria final |
| Partida normal | Inicio, entrada en Clavelitos, movimiento por ruta, pausa, reanudación y derrota por tiempo |
| Responsive | Actuación comprobada a 390 × 844, 844 × 390 y 1200 × 850; sin desbordamiento y con controles de al menos 44 px |
| Consola final | Sin errores ni advertencias en el juego normal y en la galería de personajes |
| Aislamiento | 59 archivos protegidos comprobados; seis scripts de lógica intactos; renderer conserva todo salvo el tamaño de celda del atlas |
| Web original | Los 97 archivos originales conservan sus huellas |

La integración utiliza el controlador y dibujo reales en el iframe de pruebas, con reloj controlado y guardado aislado. Completar diez niveles automáticamente verifica los flujos del juego; no significa que se hayan jugado manualmente las diez canciones. Los resultados están en `docs/personajes-browser-results.txt`. Las comprobaciones del motor y audio son las mismas de la versión anterior y no fueron modificadas.

El navegador instrumentado produjo el mismo error de MutationObserver sin URL que ya aparecía al inspeccionar iframes en la fase anterior. El juego no contiene ese observador y la integración completó sus 101 comprobaciones. Las cargas limpias del juego normal y de la galería no registraron errores ni advertencias. No se detectaron errores por la sustitución de assets.

## Archivos sustituidos o ajustados

- `assets/personajes/pandereta.svg`, `guitarra.svg`, `bandurria.svg`, `guitarra-gafas.svg`, `laud.svg`: cinco bases completas sustituidas.
- `assets/personajes/pandereta-atlas.png`, `guitarra-atlas.png`, `bandurria-atlas.png`, `guitarra-gafas-atlas.png`, `laud-atlas.png`: cinco atlas completos sustituidos.
- `assets/personajes/generar.py`: generación desde los píxeles oficiales y máscaras, en lugar de dibujar figuras interpretadas.
- `src/art.js`: una sola línea de `character()`, que lee la celda como la cuarta parte de las dimensiones del atlas. El tamaño de destino sigue siendo 80 × 133 y el anclaje es idéntico.
- `tests/personajes.test.py`: verificación de fuentes, recortes, escala, 80 poses y archivos protegidos.
- `tests/browser-integration.html`: solo se cambia la anchura esperada del atlas de 192 a 768. Los 101 controles de jugabilidad se conservan.
- `README.md` y `docs/PERSONAJES.md`: documentación de las figuras y mantenimiento.

## Recursos nuevos

- `assets/personajes/referencias/image-1.png` a `image-5.png`: copias exactas de los adjuntos.
- `assets/personajes/mascaras/`: máscaras finales y las tres selecciones automáticas utilizadas para regenerarlas.
- `assets/personajes/recortes/`: cinco figuras transparentes con los píxeles originales.
- `assets/personajes/referencias.json`: correspondencias, huellas, recortes, escala y anclajes.
- `assets/personajes/regresion-referencia.json`: huellas anteriores de los archivos protegidos y código anterior del renderer.
- `assets/personajes/comparacion-reparto.png`: comparación visual del reparto.
- `tests/personajes-browser.html`: visor de animaciones con el renderer real, separado del juego.
- Este informe, `docs/personajes-browser-results.txt` y capturas `docs/personajes-*.png`.

## Límites conservados de las referencias

Las partes que ya están cortadas por el borde de las imágenes no se reconstruyen. El escalado para los tamaños existentes usa vecino más cercano y conserva la proporción; una imagen grande no muestra todos sus detalles a 80 × 133. Las animaciones son contenidas y reutilizan los mismos píxeles, sin dibujar manos, caras o prendas nuevas. El pelo, vestuario, instrumentos y escudos proceden exclusivamente de las imágenes aportadas.

La producción sigue sin dependencias externas. Solo regenerar o verificar imágenes necesita Pillow. Las fotos y máscaras completas no se descargan al jugar. Menús, música, niveles, controles, dificultad, puntuación, guardado, escenarios y lógica quedan exactamente como antes.
