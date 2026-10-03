> Documento histórico del diseño de la primera versión. La versión 2 conserva ese motor y amplía el juego a diez canciones y cinco personajes; consulta README.md, PERSONAJES.md y PRUEBAS.md para el estado actual.

# Fuentes y decisiones · 2 de octubre de 2026

## Material del proyecto

Raíz de la web identificada: `marketing-tuna/web`, con `index.html`, `main.js`, `styles.css`, páginas de noticias, zona privada, `LOGO.jpg`, `FOTOS`, `NOTICIAS` y `VIDEOS`. Se inventariaron las 61 imágenes de FOTOS y el escudo y se revisaron visualmente en tres hojas de contactos. También se revisaron los textos de las noticias y las referencias musicales y de vídeo de la web. No se han leído datos personales de la zona privada.

Identidad observada: Rondalla de Lopera, Jaén; traje negro, becas rojas, capas decoradas, instrumentos de cuerda y pandereta. La web usa rojo #990000, negro #0D0D0D y oro #C9A84C. El juego adapta esta gama a tonos nocturnos para facilitar la lectura del HUD. Se emplea el escudo existente, sin inventar uno.

Las noticias documentan actuaciones en Marmolejo, Baños de la Encina y Arjona. Se usan estos lugares como contexto narrativo. El certamen y los incidentes del juego son ficción; no representan hechos documentados. Los escenarios son composiciones vectoriales originales inspiradas en plazas, balcones y arquitectura presentes en las fotografías, sin pretender ser planos exactos.

No existe una relación fiable de nombres, caras e instrumentos de cada miembro. Los cuatro diseños conservan diferencias visibles de pelo, barba, gafas y complexión. Se identifican por instrumento, sin inventar identidades personales.

La web incluye tres vídeos MP4 y vídeos de YouTube, pero no una biblioteca de pistas musicales aisladas con permisos documentados. El MP3 del directorio superior es material de estrategia comercial, no repertorio. Se crean melodías y efectos propios por síntesis, sin descargar música ni extraer grabaciones.

## Novatuno: análisis de la referencia

Fuentes oficiales consultadas:

- [Página del juego](https://isabel-arrans.itch.io/novatuno)
- [Versión 0.6.0](https://isabel-arrans.itch.io/novatuno/devlog/1373352/versin-060-disponible)
- [Demo 0.4.0](https://isabel-arrans.itch.io/novatuno/devlog/630092/novatuno-demo-ritmo-v-040-disponible)
- [Prototipo 0.2.0](https://isabel-arrans.itch.io/novatuno/devlog/565907/v020-prototipo-funcional)

El análisis procede de la página y los diarios de desarrollo; **no se ha ejecutado el binario de Windows ni la aplicación Android**. La página actual no ofrece una partida web incrustada. No se afirma haber observado pantallas o controles que esas fuentes no describen.

Novatuno se presenta como un juego de ritmo sobre un novato de una tuna de Sevilla. La versión publicada trabaja con canciones y dificultades; el cambio de cuerda es una mecánica distintiva. Los diarios explican sensores de notas, valoración de precisión, multiplicadores de combo, puntuaciones, temporizador, elección de dificultad y escenarios basados en lugares reales. El prototipo antiguo incluía exploración y conversaciones; el modo aventura figura como desarrollo futuro en la página actual.

La experiencia que interesa trasladar: actuaciones breves, habilidad musical comprensible, feedback inmediato, motivación para mejorar la marca y humor sobre la vida de la Tuna. El análisis del interés de los combos y la repetición es una decisión de diseño, no una medición experimental de diversión del juego de referencia.

## Diseño propio

«Una ronda más» combina una plaza explorada desde arriba con personajes vistos de frente y actuaciones de cuatro direcciones. Cada nivel tiene una preparación y una pieza musical original. El cambio de cuerda, los personajes de Sevilla, sus recursos y sus canciones no se trasladan.

Bucle: elegir músico → explicación de etapa → recoger equipo evitando obstáculos → llegar al escenario → acertar notas → resultado con estrellas → siguiente etapa. Un fallo permite reiniciar la etapa. Las cinco situaciones aumentan BPM, número de notas y riesgos de la preparación.

Se usa Canvas 2D, JavaScript sin dependencias, SVG canónicos, Web Audio y localStorage. Los scripts clásicos permiten abrir el juego como archivo local y desplegarlo como carpeta independiente. Todas las copias optimizadas, código, documentación y pruebas están dentro de JUEGO.
