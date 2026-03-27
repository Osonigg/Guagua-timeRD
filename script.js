import { cargarJSON } from "./Backend/api.js";
import { calcularDistancia, formatearDinero } from "./Backend/operaciones.js";
import {
  renderizarMapaSVG,
  renderizarSugerencias,
  renderizarCardsParadas,
  mostrarResultadoGPS,
} from "./Backend/ui.js";

async function inicializarApp() {
  const [rutas, paradas, unidades] = await Promise.all([
    cargarJSON("rutas.json"),
    cargarJSON("paradas.json"),
    cargarJSON("unidades.json"),
  ]);

  // --- 1. DECLARACIÓN DE ELEMENTOS (Al inicio para evitar errores de referencia) ---
  const inputBuscar = document.getElementById("buscar");
  const listaSug = document.getElementById("sugerencias-lista"); // El mismo div para ambos
  const inputOrigen = document.getElementById("origen");
  const inputDestino = document.getElementById("destino");
  const svgMapa = document.getElementById("ruta-svg");
  const contenedorCards =
    document.querySelector(".paradas-container") ||
    document.querySelector("#paradas");

  // --- Renderizar Listado de Paradas (Cards) ---
  renderizarCardsParadas(contenedorCards, paradas, rutas);

  // --- LÓGICA DE PROCESAR TRAYECTO (DIBUJAR RUTA) ---
  const procesarTrayecto = () => {
    const oVal = inputOrigen.value.toLowerCase().trim();
    const dVal = inputDestino.value.toLowerCase().trim();

    // Buscamos coincidencia exacta para disparar el mapa
    const pO = paradas.find((p) => p.nombre.toLowerCase() === oVal);
    const pD = paradas.find((p) => p.nombre.toLowerCase() === dVal);

    if (pO && pD && pO.ruta_id === pD.ruta_id) {
      const rutaInfo = rutas.find((r) => r.id === pO.ruta_id);
      const paradasDeRuta = paradas.filter((p) => p.ruta_id === pO.ruta_id);
      const svgMapa = document.getElementById("ruta-svg");
      renderizarMapaSVG(svgMapa, rutaInfo, paradasDeRuta, pO, pD);
    }
  };

  // --- FUNCIÓN PARA ACTIVAR PREDICCIÓN EN CUALQUIER INPUT ---
  const activarPrediccion = (input) => {
    if (!input) return;
    input.addEventListener("input", (e) => {
      const texto = e.target.value.toLowerCase().trim();

      if (texto.length < 2) {
        listaSug?.classList.add("sugerencias-hidden");
        return;
      }

      // Filtrar coincidencias
      const matches = paradas
        .filter((p) => p.nombre.toLowerCase().includes(texto))
        .slice(0, 5);

      // Mostrar sugerencias
      renderizarSugerencias(
        listaSug,
        matches,
        rutas,
        input,
        (paradaSeleccionada) => {
          input.value = paradaSeleccionada.nombre;
          listaSug.classList.add("sugerencias-hidden");

          // Si es el buscador principal, muestra el card GPS
          if (input.id === "buscar") {
            const ruta = rutas.find((r) => r.id === paradaSeleccionada.ruta_id);
            mostrarResultadoGPS(paradaSeleccionada, ruta);
          } else {
            // Si es origen/destino, procesa el trayecto
            // Ejecutar la simulación de ruta automáticamente al elegir
            procesarTrayecto();
          }
        },
      );

      // Posicionar la lista justo debajo del input que se está usando
      const rect = input.getBoundingClientRect();
      listaSug.style.top = `${input.offsetTop + input.offsetHeight} border-box`;
    });
  };

  // --- ACTIVACIÓN DE EVENTOS ---
  if (inputBuscar) activarPrediccion(inputBuscar);
  if (inputOrigen) activarPrediccion(inputOrigen);
  if (inputDestino) activarPrediccion(inputDestino);

  // Botón Invertir
  document.getElementById("btn-invertir")?.addEventListener("click", () => {
    const temp = inputOrigen.value;
    inputOrigen.value = inputDestino.value;
    inputDestino.value = temp;
    procesarTrayecto(); // Recalcular al invertir
  });

  // --- Lógica de GPS (Buscador Principal) ---
  document.getElementById("btn-search")?.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;

      // Encontrar la más cercana usando Operaciones
      let cercana = null;
      let minD = Infinity;

      paradas.forEach((p) => {
        const d = calcularDistancia(lat, lon, p.lat, p.lng);
        if (d < minD) {
          minD = d;
          cercana = p;
        }
      });

      if (cercana) {
        // Aquí podrías llamar a una función de UI para mostrar el card de resultado
        console.log("Parada más cercana:", cercana.nombre);
      }
    });
  });
}
  
document.addEventListener("DOMContentLoaded", inicializarApp);
