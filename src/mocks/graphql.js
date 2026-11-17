import { graphql, HttpResponse } from "msw";
import { destinos, hoteles, vuelos } from "./datos";
import { simularEscenario } from "./falla";

// API GraphQL simulada con MSW. Responde a la operación "DestinoOpciones" enviada por POST /graphql.
// El esquema completo está en schema.graphql.
//
//   query DestinoOpciones($destinoId: ID!, $soloDisponibles: Boolean) {
//     opcionesDestino(destinoId: $destinoId, soloDisponibles: $soloDisponibles) { vuelos hoteles }
//   }
//
// Un destino inexistente responde HTTP 200 con "errors" (así lo define la especificación de GraphQL).

export const handlersGraphql = [
  graphql.query("DestinoOpciones", async ({ variables }) => {
    const falla = await simularEscenario();
    if (falla) return falla;

    const { destinoId, soloDisponibles = false } = variables;
    const destino = destinos.find((d) => d.id === destinoId);
    if (!destino) {
      return HttpResponse.json({
        data: { opcionesDestino: null },
        errors: [{ message: `No existe un destino con el código "${destinoId}"`, extensions: { code: "NOT_FOUND" } }],
      });
    }

    const misVuelos = vuelos
      .filter((v) => v.destinoId === destinoId)
      .filter((v) => !soloDisponibles || v.asientosDisponibles > 0)
      .map(({ destinoId: _, ...v }) => ({ __typename: "Vuelo", ...v }));

    const misHoteles = hoteles
      .filter((h) => h.destinoId === destinoId)
      .filter((h) => !soloDisponibles || h.habitacionesDisponibles > 0)
      .map(({ destinoId: _, ...h }) => ({ __typename: "Hotel", ...h }));

    return HttpResponse.json({
      data: {
        opcionesDestino: { __typename: "OpcionesDestino", destinoId, vuelos: misVuelos, hoteles: misHoteles },
      },
    });
  }),
];
