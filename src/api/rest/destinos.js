import { pedirJSON } from "../cliente";

// Consultas REST de destinos. Cada una tiene una clave de caché y la función que hace la petición.
// useConsulta (src/hooks/useConsulta.js) recibe el resultado de estas funciones.
export const consultasDestinos = {
  lista: () => ({
    clave: "destinos",
    pedir: (opciones) => pedirJSON("/api/destinos", opciones),
  }),
  detalle: (id) => ({
    clave: `destino:${id}`,
    pedir: (opciones) => pedirJSON(`/api/destinos/${encodeURIComponent(id)}`, opciones),
  }),
};
