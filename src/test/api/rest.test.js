import { http, HttpResponse } from "msw";
import { servidor } from "../setup";
import { pedirJSON, ErrorApi, ajustes } from "../../api/cliente";
import { consultasDestinos } from "../../api/rest/destinos";
import { cambiarEscenario } from "../../mocks/simulacion";

// Pruebas de la API REST mock: listado de destinos y detalle, con sus errores
describe("API REST de destinos", () => {
  it("lista los destinos con país y actividades populares", async () => {
    const destinos = await pedirJSON("/api/destinos");

    expect(destinos.length).toBeGreaterThanOrEqual(5);
    for (const d of destinos) {
      expect(d).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          nombre: expect.any(String),
          pais: expect.any(String),
          actividades: expect.any(Array),
        })
      );
      expect(d.actividades.length).toBeGreaterThan(0);
    }
  });

  it("entrega el detalle de un destino por su código", async () => {
    const cusco = await pedirJSON("/api/destinos/cusco");
    expect(cusco).toEqual(expect.objectContaining({ id: "cusco", pais: "Perú" }));
  });

  it("responde 404 con mensaje y no reintenta un destino inexistente", async () => {
    const espia = jest.fn();
    servidor.use(
      http.get("/api/destinos/:id", ({ request }) => {
        espia(request.url);
        return HttpResponse.json({ mensaje: "No existe" }, { status: 404 });
      })
    );

    const error = await pedirJSON("/api/destinos/atlantida").catch((e) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.tipo).toBe("no-encontrado");
    expect(espia).toHaveBeenCalledTimes(1);
  });

  it("reintenta ante un 500 y se rinde tras los intentos", async () => {
    cambiarEscenario("error500");
    const error = await pedirJSON("/api/destinos").catch((e) => e);
    expect(error.tipo).toBe("servidor");
    expect(error.estado).toBe(500);
  });

  it("recupera la lista cuando el servidor falla una vez", async () => {
    servidor.use(
      http.get("/api/destinos", () => HttpResponse.json({ mensaje: "error" }, { status: 500 }), { once: true })
    );
    const destinos = await consultasDestinos.lista().pedir({});
    expect(destinos.length).toBeGreaterThan(0);
  });

  it("clasifica la falta de conexión como 'red'", async () => {
    cambiarEscenario("sinConexion");
    const error = await pedirJSON("/api/destinos").catch((e) => e);
    expect(error.tipo).toBe("red");
  });

  it("cancela la petición real cuando se supera el tiempo máximo", async () => {
    const tiempoOriginal = ajustes.tiempoMaximo;
    ajustes.tiempoMaximo = 30;
    const senales = [];
    // Simula un servidor que nunca responde y guarda la señal de cancelación de cada intento
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = (_url, opciones) => {
      senales.push(opciones.signal);
      return new Promise(() => {});
    };
    try {
      const error = await pedirJSON("/api/destinos").catch((e) => e);
      expect(error.tipo).toBe("tiempo");
      expect(senales.length).toBe(3); // intento inicial + 2 reintentos
      expect(senales.every((s) => s.aborted)).toBe(true);
    } finally {
      ajustes.tiempoMaximo = tiempoOriginal;
      globalThis.fetch = fetchOriginal;
    }
  });
});
