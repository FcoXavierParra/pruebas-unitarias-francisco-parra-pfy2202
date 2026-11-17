import { describe, it, expect } from "vitest";
import { graphql } from "msw";
import { servidor } from "./setup";
import { clienteGraphQL } from "../api/graphql/apolloClient";
import { DESTINO_OPCIONES } from "../api/graphql/consultas";
import { traducirErrorGraphQL } from "../api/graphql/errores";
import { cambiarEscenario } from "../mocks/simulacion";

// Pruebas de la API GraphQL mock, consultada con Apollo Client
const consultar = (variables, fetchPolicy = "no-cache") =>
  clienteGraphQL.query({ query: DESTINO_OPCIONES, variables, fetchPolicy });

describe("API GraphQL de vuelos y hoteles", () => {
  it("devuelve vuelos y hoteles del destino con precios, fechas y disponibilidad", async () => {
    const { data } = await consultar({ destinoId: "cusco" });
    const { opcionesDestino } = data;

    expect(opcionesDestino.destinoId).toBe("cusco");
    expect(opcionesDestino.vuelos).toHaveLength(2);
    expect(opcionesDestino.hoteles).toHaveLength(2);
    expect(opcionesDestino.vuelos[0]).toEqual(
      expect.objectContaining({
        aerolinea: expect.any(String),
        origen: "Santiago (SCL)",
        salida: expect.any(String),
        llegada: expect.any(String),
        precio: expect.any(Number),
        moneda: "CLP",
        asientosDisponibles: expect.any(Number),
      })
    );
    expect(opcionesDestino.hoteles[0]).toEqual(
      expect.objectContaining({ checkIn: "2027-01-15", checkOut: "2027-01-19", precioNoche: expect.any(Number) })
    );
  });

  it("con soloDisponibles excluye vuelos sin asientos y hoteles sin habitaciones", async () => {
    const { data } = await consultar({ destinoId: "cusco", soloDisponibles: true });

    // En Cusco, v-cus-2 (0 asientos) y h-cus-2 (0 habitaciones) deben quedar fuera
    expect(data.opcionesDestino.vuelos.map((v) => v.id)).toEqual(["v-cus-1"]);
    expect(data.opcionesDestino.hoteles.map((h) => h.id)).toEqual(["h-cus-1"]);
  });

  it("un destino inexistente responde errores GraphQL con código NOT_FOUND", async () => {
    const error = await consultar({ destinoId: "atlantida" }).catch((e) => e);

    const traducido = traducirErrorGraphQL(error);
    expect(traducido.tipo).toBe("no-encontrado");
    expect(traducido.message).toMatch(/atlantida/);
  });

  it("un 500 del servidor se traduce a 'servidor' tras reintentar", async () => {
    cambiarEscenario("error500");
    const error = await consultar({ destinoId: "kioto" }).catch((e) => e);
    expect(traducirErrorGraphQL(error).tipo).toBe("servidor");
  });

  it("sin conexión se traduce a 'red'", async () => {
    cambiarEscenario("sinConexion");
    const error = await consultar({ destinoId: "lisboa" }).catch((e) => e);
    expect(traducirErrorGraphQL(error).tipo).toBe("red");
  });

  it("la caché de Apollo evita una segunda petición con las mismas variables", async () => {
    // El resolver cuenta las peticiones y devuelve undefined: MSW sigue con el handler real
    let peticiones = 0;
    servidor.use(
      graphql.query("DestinoOpciones", () => {
        peticiones += 1;
      })
    );

    await consultar({ destinoId: "bariloche" }, "cache-first");
    await consultar({ destinoId: "bariloche" }, "cache-first");
    expect(peticiones).toBe(1); // la segunda consulta sale de la caché de Apollo

    await clienteGraphQL.clearStore();
    await consultar({ destinoId: "bariloche" }, "cache-first");
    expect(peticiones).toBe(2); // con la caché vacía vuelve a pedirse al servidor
  });
});
