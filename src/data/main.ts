import "./style.css"; // Importamos los estilos globales
import { initMap } from "./map";

// Esperamos a que el DOM esté cargado para inicializar el mapa
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  console.log("Urbanly Subte Map inicializado correctamente");
});
