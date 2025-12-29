import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import estaciones from "./data/estacionesdesubte.json";
import lineas from "./data/reddesubterraneo.json";

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
  });

  map.on("load", () => {
    map.addSource("subte-lineas", { type: "geojson", data: lineas as any });
    map.addLayer({
      id: "lineas-layer",
      type: "line",
      source: "subte-lineas",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-width": 3,
        "line-color": [
          "match",
          ["get", "LINEASUB"],
          "LINEA A",
          "#00ADD0",
          "LINEA B",
          "#E2231A",
          "LINEA C",
          "#006CA8",
          "LINEA D",
          "#00A650",
          "LINEA E",
          "#6D2077",
          "LINEA H",
          "#FFB900",
          "#333333",
        ],
      },
    });

    // --- ESTACIONES (Puntos Minimalistas) ---
    map.addSource("subte-estaciones", {
      type: "geojson",
      data: estaciones as any,
    });

    map.addLayer({
      id: "estaciones-layer",
      type: "circle",
      source: "subte-estaciones",
      paint: {
        // AQUÍ ESTÁ EL CAMBIO DE TAMAÑO:
        "circle-radius": 3.5, // Más pequeños (antes 6)
        "circle-color": "#FFFFFF",
        "circle-stroke-width": 1.5, // Borde más fino
        "circle-stroke-color": "#222222",
      },
    });

    // --- INTERACCIÓN ---
    map.on("mouseenter", "estaciones-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "estaciones-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("click", "estaciones-layer", (e: any) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const nombre = e.features[0].properties.ESTACION;
      const linea = e.features[0].properties.LINEA;

      // 1. ANIMACIÓN DE LA CÁMARA (Efecto "fly to")
      map.flyTo({
        center: coordinates,
        zoom: 14, // Hace un zoom suave hacia la estación
        speed: 1.2,
        curve: 1.4,
        essential: true,
      });

      // 2. POPUP CON NUEVO HTML PARA EL CSS
      new maplibregl.Popup({ closeButton: false, offset: 10 }) // offset separa el popup del punto
        .setLngLat(coordinates)
        .setHTML(
          `
          <div class="popup-container">
            <div class="popup-linea">Línea ${linea}</div>
            <h3 class="popup-estacion">${nombre}</h3>
          </div>
        `
        )
        .addTo(map);
    });
  });
};
