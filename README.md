# Urbanly - Mapa Interactivo del Subte de Buenos Aires

Una aplicación web moderna de visualización geoespacial que permite explorar la red de subterráneos de la Ciudad de Buenos Aires con una experiencia inmersiva y animación 3D.

## 🚀 Características Principales

- **Mapa Vectorial Interactivo:** Basado en OpenStreetMap y renderizado con MapLibre GL JS.
- **Experiencia 3D Cinematográfica:** Animaciones de cámara ("FlyTo") con inclinación y rotación al navegar entre estaciones.
- **Modo 3D/2D Conmutable:** Botón dedicado para alternar entre una vista cenital plana y una vista inmersiva con perspectiva.
- **Buscador Inteligente:** Búsqueda en tiempo real de estaciones con sugerencias automáticas.
- **Navegación Secuencial:** Botones de "Anterior" y "Siguiente" dentro de cada estación para recorrer la línea virtualmente.
- **Panel de Líneas (Line Nav):** Acceso rápido a las cabeceras de cada línea (A, B, C, D, E, H) mediante una interfaz lateral estilo "Glassmorphism".
- **Información Detallada:** Visualización de combinaciones, direcciones y puntos de interés.

## 🛠️ Tecnologías Utilizadas

- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Mapa & Renderizado:** [MapLibre GL JS](https://maplibre.org/)
- **Empaquetador (Bundler):** [Vite](https://vitejs.dev/)
- **Estilos:** CSS3 (Variables CSS, Flexbox, Backdrop-filter).
- **Datos:** GeoJSON customizado para trazados y estaciones.

## 📦 Instalación y Uso

Sigue estos pasos para correr el proyecto localmente:

1.  **Clonar el repositorio:**

    ```bash
    git clone [https://github.com/tu-usuario/urbanly-subte.git](https://github.com/tu-usuario/urbanly-subte.git)
    cd urbanly-subte
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Ejecutar el servidor de desarrollo:**

    ```bash
    npm run dev
    ```

4.  **Abrir en el navegador:**
    Ingresar en `http://localhost:5173` (o el puerto que indique la terminal).

## 📂 Estructura del Proyecto

```text
/
├── public/              # Assets estáticos
├── src/
│   ├── data/            # Archivos GeoJSON (Datos crudos)
│   │   ├── estacionesdesubte.json
│   │   └── reddesubterraneo.json
│   ├── main.ts          # Punto de entrada
│   ├── map.ts          # Lógica principal del mapa y UI
│   └── style.css        # Estilos globales
├── index.html           # HTML base
├── package.json         # Dependencias
└── tsconfig.json        # Configuración de TypeScript
```
