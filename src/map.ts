import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Importación de datos
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
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [{ id: "osm-layer", type: "raster", source: "osm" }],
    },
    center: [-58.4173, -34.6118],
    zoom: 12,
  });

  map.on("load", () => {
    // Fuente de Líneas
    map.addSource("subte-lineas", {
      type: "geojson",
      data: lineas as any,
    });

    // Capa de Líneas (usando los colores del GeoJSON)
    map.addLayer({
      id: "lineas-layer",
      type: "line",
      source: "subte-lineas",
      paint: {
        "line-width": 4,
        "line-color": ["coalesce", ["get", "color"], "#000000"],
      },
    });

    // Fuente de Estaciones
    map.addSource("subte-estaciones", {
      type: "geojson",
      data: estaciones as any,
    });

    // Capa de Estaciones (Círculos blancos con borde negro)
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
      const name = e.features[0].properties.name;

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<strong>Estación:</strong> ${name}`)
        .addTo(map);
    });
  });
};
