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
    pitch: 45,
    bearing: -10,
    maxZoom: 18,
    attributionControl: false,
  });

  let currentPopup: maplibregl.Popup | null = null;

  const showStationPopup = (feature: any) => {
    if (currentPopup) currentPopup.remove();

    const props = feature.properties;
    const coords = feature.geometry.coordinates.slice();
    const lineaActual = props.LINEA;
    const currentID = Number(props.ID);

    const direccion = props.DIRECCION || "Ubicación aproximada";
    const infoExtra = props.INFO || "";

    let combinaciones = props.COMBINACIONES;
    if (typeof combinaciones === "string") {
      try {
        combinaciones = JSON.parse(combinaciones);
      } catch (e) {
        combinaciones = [];
      }
    }
    if (!Array.isArray(combinaciones)) combinaciones = [];

    const estacionesDeLinea = (estaciones as any).features
      .filter((f: any) => f.properties.LINEA === lineaActual)
      .sort(
        (a: any, b: any) => Number(a.properties.ID) - Number(b.properties.ID)
      );

    const currentIndex = estacionesDeLinea.findIndex(
      (f: any) => Number(f.properties.ID) === currentID
    );

    const prevStation =
      currentIndex > 0 ? estacionesDeLinea[currentIndex - 1] : null;
    const nextStation =
      currentIndex !== -1 && currentIndex < estacionesDeLinea.length - 1
        ? estacionesDeLinea[currentIndex + 1]
        : null;

    const popupDiv = document.createElement("div");
    popupDiv.className = "popup-container";
    const colorLinea = LINE_COLORS[lineaActual] || "#333";

    let combinacionesHTML = "";
    if (combinaciones.length > 0) {
      combinacionesHTML = `<div class="popup-connections">
        <span class="conn-label">Combina con:</span>
        ${combinaciones
          .map(
            (l: string) =>
              `<span class="conn-badge" style="background:${
                LINE_COLORS[l] || "#999"
              }">${l}</span>`
          )
          .join("")}
      </div>`;
    }

    popupDiv.innerHTML = `
      <div class="popup-header">
        <span class="popup-linea-badge" style="background-color: ${colorLinea}">LÍNEA ${lineaActual}</span>
      </div>
      <div class="popup-body">
        <h3 class="popup-title">${props.ESTACION}</h3>
        <div class="popup-info-section">
          <div class="popup-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${direccion}
          </div>
          ${infoExtra ? `<div class="popup-extra">${infoExtra}</div>` : ""}
          ${combinacionesHTML}
        </div>
        <div class="popup-nav">
          <button class="nav-btn" id="btn-prev" ${
            !prevStation ? "disabled" : ""
          }>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Anterior
          </button>
          <button class="nav-btn" id="btn-next" ${
            !nextStation ? "disabled" : ""
          }>
            Siguiente
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    `;

    const btnPrev = popupDiv.querySelector("#btn-prev");
    const btnNext = popupDiv.querySelector("#btn-next");

    if (btnPrev && prevStation) {
      btnPrev.addEventListener("click", () => showStationPopup(prevStation));
    }
    if (btnNext && nextStation) {
      btnNext.addEventListener("click", () => showStationPopup(nextStation));
    }

    map.flyTo({
      center: coords,
      zoom: 16.5,
      pitch: 50,
      bearing: -15,
      speed: 0.8,
      curve: 1.5,
      essential: true,
    });

    currentPopup = new maplibregl.Popup({
      closeButton: false,
      offset: 25,
      maxWidth: "320px",
      anchor: "bottom",
    })
      .setLngLat(coords)
      .setDOMContent(popupDiv)
      .addTo(map);
  };

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

      const matches = (estaciones as any).features.filter((f: any) =>
        f.properties.ESTACION.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        resultsContainer.classList.add("visible");
        matches.slice(0, 5).forEach((feature: any) => {
          const item = document.createElement("div");
          item.className = "result-item";
          const color = LINE_COLORS[feature.properties.LINEA] || "#999";
          item.innerHTML = `<span class="result-name">${feature.properties.ESTACION}</span><span class="result-line" style="background-color: ${color}">${feature.properties.LINEA}</span>`;

          item.addEventListener("click", () => {
            showStationPopup(feature);
            input.value = "";
            resultsContainer.classList.remove("visible");
            clearBtn!.style.display = "none";
          });
          resultsContainer.appendChild(item);
        });
      }
    });

    clearBtn?.addEventListener("click", () => {
      input.value = "";
      resultsContainer.classList.remove("visible");
      clearBtn.style.display = "none";
    });
  };

  const initLineNav = () => {
    const buttons = document.querySelectorAll(".line-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const lineaSeleccionada = (e.target as HTMLElement).getAttribute(
          "data-line"
        );
        const estacionesLinea = (estaciones as any).features.filter(
          (f: any) => f.properties.LINEA === lineaSeleccionada
        );

        if (estacionesLinea.length === 0) return;

        estacionesLinea.sort(
          (a: any, b: any) => Number(a.properties.ID) - Number(b.properties.ID)
        );

        showStationPopup(estacionesLinea[0]);
      });
    });
  };

  map.on("load", () => {
    initSearch();
    initLineNav();

    document
      .getElementById("btn-zoom-in")
      ?.addEventListener("click", () => map.zoomIn());
    document
      .getElementById("btn-zoom-out")
      ?.addEventListener("click", () => map.zoomOut());

    document.getElementById("btn-compass")?.addEventListener("click", () => {
      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }
      map.flyTo({
        center: [-58.4173, -34.6118],
        zoom: 12,
        bearing: 0,
        pitch: 0,
        speed: 1.5,
      });
    });

    map.on("click", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["estaciones-layer"],
      });
      if (!features.length && currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }
    });

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

    map.addSource("subte-estaciones", {
      type: "geojson",
      data: estaciones as any,
    });
    map.addLayer({
      id: "estaciones-layer",
      type: "circle",
      source: "subte-estaciones",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 4, 16, 8],
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

    map.on("click", "estaciones-layer", (e: any) => {
      if (e.features && e.features.length > 0) {
        showStationPopup(e.features[0]);
      }
    });
  });
};
