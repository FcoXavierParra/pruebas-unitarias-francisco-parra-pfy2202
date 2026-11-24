import {
  VIGENCIA,
  almacenamientoDisponible,
  consultar,
  leerCache,
  obtenerEstadisticas,
  suscribirEstadisticas,
  vaciarCache,
} from "../../api/cache";

// Pruebas unitarias de la caché REST. "pedir" se reemplaza por una función simulada de Jest (jest.fn),
// así se controla qué responde y se cuenta cuántas veces se llamó, sin pasar por la red.
const destinos = [{ id: "cusco" }];
const pedirOk = () => jest.fn().mockResolvedValue(destinos);

describe("reutilización de respuestas", () => {
  it("una respuesta reciente se reutiliza sin volver a pedirla", async () => {
    const pedir = pedirOk();
    await consultar("destinos", pedir);
    const segunda = await consultar("destinos", pedir);

    expect(segunda).toBe(destinos);
    expect(pedir).toHaveBeenCalledTimes(1);
    expect(obtenerEstadisticas()).toMatchObject({ peticiones: 1, desdeCache: 1 });
  });

  it("dos consultas simultáneas comparten una sola petición", async () => {
    const pedir = pedirOk();
    const [a, b] = await Promise.all([consultar("destinos", pedir), consultar("destinos", pedir)]);

    expect(a).toBe(b);
    expect(pedir).toHaveBeenCalledTimes(1);
    expect(obtenerEstadisticas().compartidas).toBe(1);
  });

  it("forzar pide de nuevo aunque haya datos recientes", async () => {
    const pedir = pedirOk();
    await consultar("destinos", pedir);
    await consultar("destinos", pedir, { forzar: true });
    expect(pedir).toHaveBeenCalledTimes(2);
  });

  it("pasado el tiempo de vigencia los datos quedan vencidos y se vuelven a pedir", async () => {
    // Temporizadores simulados: se adelanta el reloj sin esperar 5 minutos reales
    jest.useFakeTimers({ now: new Date("2027-01-01T10:00:00") });
    try {
      const pedir = pedirOk();
      await consultar("destinos", pedir);
      expect(leerCache("destinos").fresco).toBe(true);

      jest.setSystemTime(Date.now() + VIGENCIA + 1);
      expect(leerCache("destinos")).toEqual({ datos: destinos, fresco: false });

      await consultar("destinos", pedir);
      expect(pedir).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it("entrega la función de reintento a la petición", async () => {
    const pedir = pedirOk();
    const alReintentar = jest.fn();
    await consultar("destinos", pedir, { alReintentar });
    expect(pedir).toHaveBeenCalledWith({ alReintentar });
  });
});

describe("fallas", () => {
  it("una petición fallida no se guarda y la siguiente consulta vuelve a intentar", async () => {
    const pedir = jest.fn().mockRejectedValueOnce(new Error("500")).mockResolvedValueOnce(destinos);

    await expect(consultar("destinos", pedir)).rejects.toThrow("500");
    expect(leerCache("destinos")).toBeNull();

    await expect(consultar("destinos", pedir)).resolves.toBe(destinos);
    expect(pedir).toHaveBeenCalledTimes(2);
  });

  it("vaciarCache borra las respuestas guardadas", async () => {
    await consultar("destinos", pedirOk());
    vaciarCache();
    expect(leerCache("destinos")).toBeNull();
  });
});

describe("almacenamiento y suscripciones", () => {
  it("avisa a los suscriptores cuando cambian los contadores y deja de avisar al desuscribirse", async () => {
    const avisar = jest.fn();
    const desuscribir = suscribirEstadisticas(avisar);
    await consultar("destinos", pedirOk());
    expect(avisar).toHaveBeenCalled();

    avisar.mockClear();
    desuscribir();
    await consultar("otra-clave", pedirOk());
    expect(avisar).not.toHaveBeenCalled();
  });

  it("si el navegador bloquea localStorage, la caché sigue en memoria e informa el problema", async () => {
    // jest.spyOn reemplaza temporalmente setItem para simular un navegador que no deja guardar
    const bloqueo = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    try {
      expect(almacenamientoDisponible()).toBe(true);
      await consultar("destinos", pedirOk());

      expect(almacenamientoDisponible()).toBe(false);
      expect(leerCache("destinos").datos).toBe(destinos); // la respuesta sigue disponible en memoria
    } finally {
      bloqueo.mockRestore();
    }
  });

  it("al cargar la página, lo guardado en una visita anterior aparece como vencido", () => {
    localStorage.setItem("viajes-cache-api", JSON.stringify({ destinos: { datos: destinos, guardadoEn: Date.now() } }));
    // isolateModules carga una copia nueva del módulo, como si se recargara la página
    jest.isolateModules(() => {
      const cache = require("../../api/cache");
      expect(cache.leerCache("destinos")).toEqual({ datos: destinos, fresco: false });
    });
  });

  it("al cargar la página con datos guardados dañados, parte con la caché vacía", () => {
    localStorage.setItem("viajes-cache-api", "{no es json");
    jest.isolateModules(() => {
      const cache = require("../../api/cache");
      expect(cache.leerCache("destinos")).toBeNull();
    });
  });
});
