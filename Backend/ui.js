export function renderizarMapaSVG(svg, rutaInfo, paradasDeRuta, pO, pD) {
  if (!svg) return;
  const color = rutaInfo ? rutaInfo.color : "#045a79";

  svg.innerHTML = `<line x1="40" y1="75" x2="360" y2="75" stroke="${color}" stroke-width="6" class="linea-animada" />`;

  paradasDeRuta.forEach((p, i) => {
    const x = 40 + i * (320 / (paradasDeRuta.length - 1));
    const esClave = p.id === pO.id || p.id === pD.id;
    svg.innerHTML += `
            <g class="parada-nodo">
                <circle cx="${x}" cy="75" r="${esClave ? 8 : 4}" fill="${color}" opacity="${esClave ? 1 : 0.5}" />
                ${esClave ? `<text x="${x}" y="60" font-size="10" font-weight="bold" text-anchor="middle" fill="${color}">${p.nombre}</text>` : ""}
            </g>`;
  });
}

// Puedes agregar aquí la función para mostrar la Card de resultados
export function mostrarResultadoGPS(parada, ruta) {
  const resNombre = document.getElementById("resNombreParada");
  const resRuta = document.getElementById("resRuta");
  if (resNombre) resNombre.innerText = parada.nombre;
  if (resRuta && ruta) resRuta.innerText = `${ruta.nombre} - RD$${ruta.tarifa}`;
}

// --- Función para las sugerencias del buscador ---
export function renderizarSugerencias(
  lista,
  coincidencias,
  rutas,
  input,
  callback,
) {
  if (!lista) return;
  lista.innerHTML = "";

  if (coincidencias.length > 0) {
    lista.classList.remove("sugerencias-hidden");
    coincidencias.forEach((p) => {
      const r = rutas.find((ruta) => ruta.id === p.ruta_id);
      const div = document.createElement("div");
      div.className = "sugerencia-item";
      div.innerHTML = `<strong>${p.nombre}</strong><small>${r ? r.nombre : "Ruta"}</small>`;

      div.onclick = () => {
        input.value = p.nombre;
        lista.classList.add("sugerencias-hidden");
        callback(p); // Llama a la función para mostrar el resultado final
      };
      lista.appendChild(div);
    });
  } else {
    lista.classList.add("sugerencias-hidden");
  }
}

// --- Función para el listado general de paradas (Cards) ---
export function renderizarCardsParadas(contenedor, paradas, rutas) {
  if (!contenedor) return;
  contenedor.innerHTML = "";

  paradas.forEach((p) => {
    const r = rutas.find((ruta) => ruta.id === p.ruta_id);
    const color = r ? r.color : "#ccc";
    const card = document.createElement("div");
    card.className = "parada-card";
    card.style.borderLeftColor = color;
    card.innerHTML = `
            <span class="parada-tipo" style="background:${color}">${p.tipo || "Ruta"}</span>
            <h4>${p.nombre}</h4>
            <p>📍 ${p.referencia}</p>
        `;
    contenedor.appendChild(card);
  });
}
