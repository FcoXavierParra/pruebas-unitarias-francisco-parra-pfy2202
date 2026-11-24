import { ESCENARIOS, cambiarEscenario, fallaInestable, obtenerEscenario } from "../../mocks/simulacion";

// Pruebas unitarias del selector de escenarios del backend simulado (panel de pruebas)
describe("escenarios del simulador", () => {
  it("cambia al escenario elegido y lo recuerda en la pestaña", () => {
    cambiarEscenario("error500");
    expect(obtenerEscenario()).toBe("error500");
    expect(sessionStorage.getItem("viajes-escenario")).toBe("error500");
  });

  it("ignora un escenario que no existe", () => {
    cambiarEscenario("lento");
    cambiarEscenario("terremoto");
    expect(obtenerEscenario()).toBe("lento");
  });

  it("todos los escenarios tienen nombre y descripción para el panel", () => {
    Object.values(ESCENARIOS).forEach(({ nombre, descripcion }) => {
      expect(nombre).toEqual(expect.any(String));
      expect(descripcion.length).toBeGreaterThan(10);
    });
  });

  it("en modo inestable falla una petición sí y otra no, y el contador se reinicia al cambiar de escenario", () => {
    cambiarEscenario("inestable");
    expect([fallaInestable(), fallaInestable(), fallaInestable()]).toEqual([true, false, true]);

    cambiarEscenario("inestable");
    expect(fallaInestable()).toBe(true);
  });

  it("si sessionStorage no está disponible, el escenario cambia igual", () => {
    const bloqueo = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    try {
      cambiarEscenario("sinConexion");
      expect(obtenerEscenario()).toBe("sinConexion");
    } finally {
      bloqueo.mockRestore();
    }
  });
});

describe("escenario guardado al abrir la página", () => {
  // isolateModules carga una copia nueva del módulo, como si se recargara la pestaña
  const cargarModulo = () => {
    let modulo;
    jest.isolateModules(() => {
      modulo = require("../../mocks/simulacion");
    });
    return modulo;
  };

  it("retoma el escenario que se había elegido", () => {
    sessionStorage.setItem("viajes-escenario", "lento");
    expect(cargarModulo().obtenerEscenario()).toBe("lento");
  });

  it("con un valor guardado inválido vuelve a 'normal'", () => {
    sessionStorage.setItem("viajes-escenario", "cualquier-cosa");
    expect(cargarModulo().obtenerEscenario()).toBe("normal");
  });

  it("si sessionStorage falla al leer, parte en 'normal'", () => {
    const bloqueo = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    try {
      expect(cargarModulo().obtenerEscenario()).toBe("normal");
    } finally {
      bloqueo.mockRestore();
    }
  });
});
