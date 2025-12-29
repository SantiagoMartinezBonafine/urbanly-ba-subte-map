import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import estaciones from "./data/estacionesdesubte.json";
import lineas from "./data/reddesubterraneo.json";

// Diccionario de colores para usar en JS también
const LINE_COLORS: { [key: string]: string } = {
  A: "#00ADD0",
  B: "#E2231A",
  C: "#006CA8",
  D: "#00A650",
  E: "#6D2077",
  H: "#FFB900",
};

export const initMap = () => {
  const map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap contributors",
        },
      },
      layers: [{ id: "osm-layer", type: "raster", source: "osm" }],
    },
    center: [-58.4173, -34.6118],
    zoom: 12,
    maxZoom: 18, // Evitamos que se acerque demasiado y pierda contexto
  });

  // Función lógica central para mostrar el Popup y navegar
  const showStationPopup = (feature: any) => {
    const props = feature.properties;
    const coords = feature.geometry.coordinates.slice();
    const lineaActual = props.LINEA;

    // 1. Encontrar estaciones vecinas (misma línea, ordenadas por ID)
    // Filtramos todas las estaciones de ESTA línea
    const estacionesDeLinea = (estaciones as any).features
      .filter((f: any) => f.properties.LINEA === lineaActual)
      .sort((a: any, b: any) => a.properties.ID - b.properties.ID);

    // Buscamos en qué posición está la estación actual
    const currentIndex = estacionesDeLinea.findIndex(
      (f: any) => f.properties.ID === props.ID
    );

    const prevStation =
      currentIndex > 0 ? estacionesDeLinea[currentIndex - 1] : null;
    const nextStation =
      currentIndex < estacionesDeLinea.length - 1
        ? estacionesDeLinea[currentIndex + 1]
        : null;

    // 2. Crear el DOM del Popup (HTML interactivo)
    const popupDiv = document.createElement("div");
    popupDiv.className = "popup-container";

    const colorLinea = LINE_COLORS[lineaActual] || "#333";

    popupDiv.innerHTML = `
      <div class="popup-header">
        <span class="popup-linea-badge" style="background-color: ${colorLinea}">LÍNEA ${lineaActual}</span>
      </div>
      <div class="popup-body">
        <h3 class="popup-title">${props.ESTACION}</h3>
        <div class="popup-nav">
          <button class="nav-btn" id="btn-prev" ${
            !prevStation ? "disabled" : ""
          }>← Ant</button>
          <button class="nav-btn" id="btn-next" ${
            !nextStation ? "disabled" : ""
          }>Sig →</button>
        </div>
      </div>
    `;

    // 3. Agregar funcionalidad a los botones (Listeners)
    const btnPrev = popupDiv.querySelector("#btn-prev");
    const btnNext = popupDiv.querySelector("#btn-next");

    if (btnPrev && prevStation) {
      btnPrev.addEventListener("click", () => {
        popup.remove(); // Cerramos el actual
        showStationPopup(prevStation); // Abrimos el anterior recursivamente
      });
    }

    if (btnNext && nextStation) {
      btnNext.addEventListener("click", () => {
        popup.remove();
        showStationPopup(nextStation);
      });
    }

    // 4. Mover mapa y mostrar
    map.flyTo({ center: coords, zoom: 14.5, speed: 0.8 });

    const popup = new maplibregl.Popup({
      closeButton: false,
      offset: 15,
      maxWidth: "300px",
    })
      .setLngLat(coords)
      .setDOMContent(popupDiv) // Usamos DOMContent en lugar de HTML string
      .addTo(map);
  };

  map.on("load", () => {
    // --- LÍNEAS (Ahora más gruesas) ---
    map.addSource("subte-lineas", { type: "geojson", data: lineas as any });
    map.addLayer({
      id: "lineas-layer",
      type: "line",
      source: "subte-lineas",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        // Grosor AUMENTADO: Zoom 11 -> 4px, Zoom 16 -> 10px
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 4, 16, 10],
        "line-color": [
          "match",
          ["get", "LINEASUB"],
          "LINEA A",
          LINE_COLORS["A"],
          "LINEA B",
          LINE_COLORS["B"],
          "LINEA C",
          LINE_COLORS["C"],
          "LINEA D",
          LINE_COLORS["D"],
          "LINEA E",
          LINE_COLORS["E"],
          "LINEA H",
          LINE_COLORS["H"],
          "#333",
        ],
      },
    });

    // --- ESTACIONES ---
    map.addSource("subte-estaciones", {
      type: "geojson",
      data: estaciones as any,
    });
    map.addLayer({
      id: "estaciones-layer",
      type: "circle",
      source: "subte-estaciones",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 2.5, 16, 6],
        "circle-color": "#FFFFFF",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#222",
      },
    });

    // Cursor y Clic
    map.on(
      "mouseenter",
      "estaciones-layer",
      () => (map.getCanvas().style.cursor = "pointer")
    );
    map.on(
      "mouseleave",
      "estaciones-layer",
      () => (map.getCanvas().style.cursor = "")
    );

    // Al hacer clic, llamamos a nuestra nueva función inteligente
    map.on("click", "estaciones-layer", (e: any) => {
      showStationPopup(e.features[0]);
    });
  });

  // --- BOTONES FLOTANTES (Zoom y Reset) ---
  // Esperamos a que el mapa cargue para evitar errores
  map.on("load", () => {
    document
      .getElementById("btn-zoom-in")
      ?.addEventListener("click", () => map.zoomIn());
    document
      .getElementById("btn-zoom-out")
      ?.addEventListener("click", () => map.zoomOut());

    document.getElementById("btn-compass")?.addEventListener("click", () => {
      // Resetear vista: Lejos y centrado
      map.flyTo({
        center: [-58.4173, -34.6118],
        zoom: 12,
        bearing: 0,
        pitch: 0,
      });
    });
  });
};
