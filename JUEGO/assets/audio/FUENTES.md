# Fuentes musicales y alcance de los MIDI

Revisión: 3 de octubre de 2026. Los MIDI fueron generados para el juego a partir de frases transcritas y acompañamientos propios. No se ha descargado ni distribuido ningún MIDI comercial, grabación, voz cantada o letra. No se distribuyen las partituras completas de terceros. Los temas conservan sus autores y derechos; no se presentan como composiciones originales del juego.

## Referencias

| Archivo MIDI | Fuente consultada | Adaptación incluida |
| --- | --- | --- |
| clavelitos.mid | [Tablatunas: Clavelitos](https://tablatunas.com/cancion/clavelitos/), PDF local `clavelitos_medios.pdf` | Fragmento de la primera página, transposición y acompañamiento propios |
| cielito-lindo.mid | [Tablatunas: Cielito Lindo](https://tablatunas.com/cancion/cielito-lindo/), PDF local `cielito_lindo_baritono_y_bandurria.pdf` | Fragmento, transposición, timbres y tempo de juego |
| adelita.mid | [Tablatunas: Adelita](https://tablatunas.com/cancion/adelita/), PDF local `adelita_baritono_y_bandurria.pdf` | Fragmento de la melodía, transposición y acompañamiento |
| el-rey.mid | [Partiturak: El Rey](https://partiturak.eus/ver/El%20rey), José Alfredo Jiménez; partitura con arreglo de J. Vidorreta Zubeldia | Transcripción breve de una voz, sin reproducir el arreglo polifónico ni el PDF |
| estudiantina-madrilena.mid | [Tablatunas: Estudiantina Madrileña](https://tablatunas.com/cancion/estudiantina-madrilena/), PDF local `estudiantina_madrilena_baritono_y_bandurria.pdf` | Fragmento, transposición y acompañamiento |
| cintas-capa.mid | [Tablatunas: Las Cintas de mi Capa](https://tablatunas.com/cancion/las-cintas-de-mi-capa/), PDF local `las_cintas_de_mi_capa_baritono_y_bandurria.pdf` | Fragmento y tempo adaptado |
| isa-canaria.mid | [Tablatunas: Popurrí de isas canarias](https://tablatunas.com/cancion/popurri-isas-canarias/), PDF local `popurri_de_isas_canarias_baritono_y_bandurria.pdf` | Fragmento de isa; existen variantes tradicionales, no se afirma una única versión canónica |
| morena-copla.mid | [Tablatunas: La Morena de mi Copla](https://tablatunas.com/cancion/la-morena-de-mi-copla/), PDF local `la_morena_de_mi_copla_baritono_y_bandurria.pdf` | Fragmento, transposición y acompañamiento |
| maria-portuguesa.mid | [Tablatunas: María la Portuguesa](https://tablatunas.com/cancion/maria-la-portuguesa/), PDF local `maria_la_portuguesa_baritono_y_bandurria.pdf` | Fragmento con tresillos y tempo adaptado |
| cartagenera.mid | [Tuna España: Cartagenera](https://www.tunaespana.es/?p=3420), música de Noro Vanella, letra de Farias Cabanillas | Acompañamiento de cumbia basado en la armonía publicada; arpegios originales; **no es una transcripción verificada de la melodía vocal** |

Los ocho PDFs de Tablatunas ya estaban en `ACORDES TUNA/tablaturas`, fuera del juego. Se consultaron sus primeras páginas, sin modificarlos. Las transcripciones manuales son reducciones y pueden diferir de la versión que interpreta la Rondalla. Se repiten frases para obtener suficiente material jugable; no representan canciones completas.

## Atribución y permisos

Crédito de las adaptaciones y tablaturas: **Tablatunas.com / Soplas**, según las firmas de los documentos consultados. Sus arreglos originales se ofrecen bajo [Creative Commons Atribución 4.0 Internacional](https://creativecommons.org/licenses/by/4.0/), conforme a sus [términos](https://tablatunas.com/terminos-servicio/). Cambios realizados: selección de fragmentos, transposición, tempo, duración, timbres, repetición y acompañamiento. Este crédito también figura en la interfaz del juego.

La licencia cubre el contenido original de Tablatunas y no otorga derechos sobre composiciones ajenas. La consulta pública de Partiturak y Tuna España tampoco acredita una licencia de publicación de las obras. No se ha verificado una autorización global para publicar los diez temas. Antes de compartir públicamente el repertorio protegido, debe comprobarse que los permisos del grupo cubren ese uso o sustituirse por arreglos propios autorizados. El trabajo local y sus pruebas no son una publicación.

## Formato y mantenimiento

SMF-1, 480 pulsos por negra, tres pistas, voz jugable en canal 0, guitarra en canal 1 y bajo en canal 2. `partituras.json` es la fuente editable. `generar-midi.py` exporta los archivos y la copia binaria idéntica de `src/songs.js`. El juego usa los eventos del propio MIDI para música y objetivos; no dibuja una secuencia rítmica ajena a la canción.

Para Cartagenera el acompañamiento recorre Am, E7, Am, G, F, E7 y el cierre con Dm y Am siguiendo la referencia. La voz de arpegios fue escrita para el juego. Sustituir esa voz por una melodía contrastada es una mejora pendiente, no un cambio de nombre del archivo.
