import { http, HttpResponse } from "msw";
import { destinos } from "./datos";
import { simularEscenario } from "./falla";
import { handlersGraphql } from "./graphql";

// API REST simulada con MSW. Cada handler intercepta una ruta GET y responde JSON,
// igual que lo haría un backend real.
//
//   GET /api/destinos        Lista de destinos con país y actividades populares
//   GET /api/destinos/:id    Detalle de un destino (404 si no existe)
//
// Los vuelos y hoteles no están aquí: se consultan por GraphQL (graphql.js).

const handlersRest = [
  http.get("/api/destinos", async () => {
    const falla = await simularEscenario();
    if (falla) return falla;

    return HttpResponse.json(destinos);
  }),

  http.get("/api/destinos/:id", async ({ params }) => {
    const falla = await simularEscenario();
    if (falla) return falla;

    const destino = destinos.find((d) => d.id === params.id);
    if (!destino) {
      return HttpResponse.json({ mensaje: `No existe un destino con el código "${params.id}"` }, { status: 404 });
    }
    return HttpResponse.json(destino);
  }),
];

// Lista única de handlers: la usan el Service Worker del sitio y las pruebas (msw/node)
export const handlers = [...handlersRest, ...handlersGraphql];
