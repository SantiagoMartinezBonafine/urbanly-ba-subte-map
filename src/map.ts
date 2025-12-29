import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import estaciones from "./data/estacionesdesubte.json";
import lineas from "./data/reddesubterraneo.json";

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
    maxZoom: 18,
    attributionControl: false,
  });

  // --- FUNCIÓN CENTRAL: MOSTRAR POPUP ---
  const showStationPopup = (feature: any) => {
    const props = feature.properties;
    const coords = feature.geometry.coordinates.slice();
    const lineaActual = props.LINEA;

    // Lógica de Prev/Next
    const estacionesDeLinea = (estaciones as any).features
      .filter((f: any) => f.properties.LINEA === lineaActual)
      .sort((a: any, b: any) => a.properties.ID - b.properties.ID);

    const currentIndex = estacionesDeLinea.findIndex(
      (f: any) => f.properties.ID === props.ID
    );
    const prevStation =
      currentIndex > 0 ? estacionesDeLinea[currentIndex - 1] : null;
    const nextStation =
      currentIndex < estacionesDeLinea.length - 1
        ? estacionesDeLinea[currentIndex + 1]
        : null;

    // Crear Popup
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

    // Listeners para botones internos
    const btnPrev = popupDiv.querySelector("#btn-prev");
    const btnNext = popupDiv.querySelector("#btn-next");

    if (btnPrev && prevStation) {
      btnPrev.addEventListener("click", () => {
        popup.remove();
        showStationPopup(prevStation);
      });
    }
    if (btnNext && nextStation) {
      btnNext.addEventListener("click", () => {
        popup.remove();
        showStationPopup(nextStation);
      });
    }

    // Mover mapa y abrir popup
    map.flyTo({ center: coords, zoom: 15, speed: 1.2, curve: 1 });

    const popup = new maplibregl.Popup({
      closeButton: false,
      offset: 15,
      maxWidth: "300px",
    })
      .setLngLat(coords)
      .setDOMContent(popupDiv)
      .addTo(map);
  };

  // --- LÓGICA DEL BUSCADOR ---
  const initSearch = () => {
    const input = document.getElementById("station-search") as HTMLInputElement;
    const resultsContainer = document.getElementById("search-results");
    const clearBtn = document.getElementById("clear-search");

    if (!input || !resultsContainer) return;

    input.addEventListener("input", (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      resultsContainer.innerHTML = "";

      if (query.length < 1) {
        resultsContainer.classList.remove("visible");
        clearBtn!.style.display = "none";
        return;
      }

      clearBtn!.style.display = "block";

      // Filtrar estaciones
      const matches = (estaciones as any).features.filter((f: any) =>
        f.properties.ESTACION.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        resultsContainer.classList.add("visible");
        matches.slice(0, 5).forEach((feature: any) => {
          // Mostrar máx 5 resultados
          const item = document.createElement("div");
          item.className = "result-item";
          const color = LINE_COLORS[feature.properties.LINEA] || "#999";

          item.innerHTML = `
            <span class="result-name">${feature.properties.ESTACION}</span>
            <span class="result-line" style="background-color: ${color}">${feature.properties.LINEA}</span>
          `;

          item.addEventListener("click", () => {
            showStationPopup(feature); // Ir a la estación
            input.value = ""; // Limpiar input
            resultsContainer.classList.remove("visible"); // Ocultar lista
          });

          resultsContainer.appendChild(item);
        });
      } else {
        resultsContainer.classList.remove("visible");
      }
    });

    // Botón borrar búsqueda
    clearBtn?.addEventListener("click", () => {
      input.value = "";
      resultsContainer.classList.remove("visible");
      clearBtn.style.display = "none";
      input.focus();
    });
  };

  // --- INICIALIZACIÓN DEL MAPA ---
  map.on("load", () => {
    initSearch(); // Iniciar buscador

    // Listeners de botones flotantes
    document
      .getElementById("btn-zoom-in")
      ?.addEventListener("click", () => map.zoomIn());
    document
      .getElementById("btn-zoom-out")
      ?.addEventListener("click", () => map.zoomOut());
    document.getElementById("btn-compass")?.addEventListener("click", () => {
      map.flyTo({
        center: [-58.4173, -34.6118],
        zoom: 12,
        bearing: 0,
        pitch: 0,
      });
    });

    // 1. CAPA LÍNEAS
    map.addSource("subte-lineas", { type: "geojson", data: lineas as any });
    map.addLayer({
      id: "lineas-layer",
      type: "line",
      source: "subte-lineas",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
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

    // 2. CAPA ESTACIONES
    map.addSource("subte-estaciones", {
      type: "geojson",
      data: estaciones as any,
    });
    map.addLayer({
      id: "estaciones-layer",
      type: "circle",
      source: "subte-estaciones",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 3, 16, 7],
        "circle-color": "#FFFFFF",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#222",
      },
    });

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
    map.on("click", "estaciones-layer", (e: any) =>
      showStationPopup(e.features[0])
    );
  });
};
