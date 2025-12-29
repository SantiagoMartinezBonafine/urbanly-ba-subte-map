import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import estaciones from "./data/estacionesdesubte.json";
import lineas from "./data/reddesubterraneo1.json";

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
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [{ id: "osm-layer", type: "raster", source: "osm" }],
    },
    center: [-58.4173, -34.6118],
    zoom: 12,
  });

  map.on("load", () => {
    map.addSource("subte-lineas", {
      type: "geojson",
      data: lineas as any,
    });

    map.addLayer({
      id: "lineas-layer",
      type: "line",
      source: "subte-lineas",
      paint: {
        "line-width": 4,
        "line-color": [
          "match",
          ["get", "LINEASUB"], // Leemos la propiedad que vi en tu archivo
          "LINEA A",
          "#00ADD0", // Celeste
          "LINEA B",
          "#E2231A", // Rojo
          "LINEA C",
          "#006CA8", // Azul
          "LINEA D",
          "#00A650", // Verde
          "LINEA E",
          "#6D2077", // Violeta
          "LINEA H",
          "#FFB900", // Amarillo
          "#000000", // Color por defecto (negro) si no coincide
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
        "circle-radius": 6,
        "circle-color": "#FFFFFF",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#000000",
      },
    });

    map.on("mouseenter", "estaciones-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "estaciones-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("click", "estaciones-layer", (e: any) => {
      const coordinates = e.features[0].geometry.coordinates.slice();

      const nombreEstacion = e.features[0].properties.ESTACION;
      const linea = e.features[0].properties.LINEA;

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(
          `
          <div style="font-family: sans-serif;">
            <h3 style="margin:0;">${nombreEstacion}</h3>
            <p style="margin:5px 0;">Línea ${linea}</p>
          </div>
        `
        )
        .addTo(map);
    });
  });
};
