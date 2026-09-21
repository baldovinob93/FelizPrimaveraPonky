# FelizPrimaveraPonky

Un regalo digital romántico por el Día de la Primavera: carta, álbum de recuerdos, música y pequeñas sorpresas en una experiencia pensada primero para celular.

## Ejecutar localmente

No conviene abrir `index.html` directamente. Desde la raíz del proyecto, iniciar un servidor estático:

```powershell
python -m http.server 8000
```

Después abrir `http://localhost:8000/`.

## Estructura

- `index.html`: contenido y estructura principal.
- `404.html`: página de ruta inexistente.
- `css/styles.css`: identidad visual, responsive y animaciones.
- `js/app.js`: apertura, música, galería, carta, contador y pétalos.
- `assets/img/fotos/`: fotos optimizadas para la web y miniaturas.
- `assets/img/favicon/`: ícono del sitio.
- `fotos-originales/`: archivos fuente locales; Git los ignora para evitar publicar metadatos originales.
- `tools/process_photos.py`: genera copias WebP sin metadatos y sus miniaturas.

## Personalizar

### Fotos

Las copias publicables están en `assets/img/fotos/`. Cada imagen tiene:

- `recuerdo-NN.webp`: versión amplia para portada, secciones y lightbox.
- `recuerdo-NN-thumb.webp`: miniatura liviana para el álbum.

Para regenerarlas, colocar los originales en `fotos-originales/` y ejecutar:

```powershell
python tools/process_photos.py
```

Luego actualizar en `index.html` las tarjetas de `.memory-grid` si cambia la cantidad o el orden. Los originales no se borran y no se incluyen en Git.

### Frases y carta

- Las frases de las fotos están en los elementos `.memory-card__caption` de `index.html`.
- La carta completa está dentro de `.letter-paper`, también en `index.html`.

### Fecha de la relación

En `js/app.js`, cambiar:

```js
const relationshipStartDate = "";
```

por una fecha válida, por ejemplo `2024-09-21T00:00:00`. Mientras quede vacía no se inventa ningún contador: se muestra un mensaje romántico.

### Canción

En `js/app.js`, editar `YOUTUBE_VIDEO_ID` y `YOUTUBE_URL`. También actualizar el enlace visible a YouTube en `index.html`. La integración usa la API oficial de YouTube y comienza solamente después de una interacción de la persona que visita la página.

## Publicar en GitHub Pages

El sitio usa rutas relativas compatibles con un proyecto publicado dentro de `/FelizPrimaveraPonky/`.

1. Crear el repositorio `FelizPrimaveraPonky`.
2. Subir la rama `main`.
3. En GitHub, abrir **Settings → Pages**.
4. Elegir **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
5. Guardar y esperar a que GitHub informe la URL activa.

Antes de hacer público el repositorio, recordar que contiene copias optimizadas de fotografías personales. Aunque no incluyen EXIF, la página publicada permite verlas.

## Privacidad y rendimiento

Las copias WebP se generan sin EXIF, GPS ni información del dispositivo. La galería carga miniaturas y reserva las versiones amplias para el lightbox. Las animaciones respetan `prefers-reduced-motion`.
