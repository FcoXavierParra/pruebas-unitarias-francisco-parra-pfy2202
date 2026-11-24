import { act, renderHook, waitFor } from "@testing-library/react";
import { useConsulta } from "../../hooks/useConsulta";
import { consultar } from "../../api/cache";
import { ErrorApi } from "../../api/cliente";

// Pruebas unitarias del hook que usan las páginas para consumir la API REST.
// renderHook (React Testing Library) ejecuta el hook sin montar una página completa,
// y "pedir" se simula con jest.fn para controlar cada respuesta.

// Promesa que se resuelve "a mano": permite decidir cuándo llega cada respuesta
function respuestaPendiente() {
  let resolver;
  const promesa = new Promise((r) => {
    resolver = r;
  });
  return { promesa, resolver };
}

describe("useConsulta", () => {
  it("pasa de 'cargando' a mostrar los datos", async () => {
    const pedir = jest.fn().mockResolvedValue(["Cusco"]);
    const { result } = renderHook(() => useConsulta({ clave: "destinos", pedir }));

    expect(result.current).toMatchObject({ cargando: true, datos: null, error: null });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.datos).toEqual(["Cusco"]);
  });

  it("si la petición falla, expone el error y deja de cargar", async () => {
    const error = new ErrorApi("servidor", "Falla 500", 500);
    const pedir = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useConsulta({ clave: "destinos", pedir }));

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current).toMatchObject({ cargando: false, datos: null });
  });

  it("reintentar vuelve a pedir y recupera los datos", async () => {
    const pedir = jest
      .fn()
      .mockRejectedValueOnce(new ErrorApi("red", "Sin conexión"))
      .mockResolvedValueOnce(["Cusco"]);
    const { result } = renderHook(() => useConsulta({ clave: "destinos", pedir }));
    await waitFor(() => expect(result.current.error?.tipo).toBe("red"));

    act(() => result.current.reintentar());

    await waitFor(() => expect(result.current.datos).toEqual(["Cusco"]));
    expect(result.current.error).toBeNull();
    expect(pedir).toHaveBeenCalledTimes(2);
  });

  it("muestra el número de intento mientras hay reintentos automáticos", async () => {
    const { promesa, resolver } = respuestaPendiente();
    const pedir = jest.fn(({ alReintentar }) => {
      alReintentar(2); // el cliente avisa que va en el segundo intento
      return promesa;
    });
    const { result } = renderHook(() => useConsulta({ clave: "destinos", pedir }));

    await waitFor(() => expect(result.current.intento).toBe(2));
    await act(async () => resolver(["Cusco"]));
    expect(result.current).toMatchObject({ intento: 1, datos: ["Cusco"] });
  });

  it("con datos recientes en caché no muestra 'cargando' ni vuelve a pedir", async () => {
    await consultar("destinos", () => Promise.resolve(["Cusco"]));
    const pedir = jest.fn();
    const { result } = renderHook(() => useConsulta({ clave: "destinos", pedir }));

    expect(result.current).toMatchObject({ cargando: false, datos: ["Cusco"] });
    expect(pedir).not.toHaveBeenCalled();
  });

  it("reintentar con datos en pantalla los conserva y marca 'actualizando'", async () => {
    await consultar("destinos", () => Promise.resolve(["Cusco"]));
    const { promesa, resolver } = respuestaPendiente();
    const pedir = jest.fn(() => promesa);
    const { result } = renderHook(() => useConsulta({ clave: "destinos", pedir }));

    act(() => result.current.reintentar());

    await waitFor(() => expect(result.current.actualizando).toBe(true));
    expect(result.current.datos).toEqual(["Cusco"]);
    await act(async () => resolver(["Cusco", "Bariloche"]));
    expect(result.current).toMatchObject({ actualizando: false, datos: ["Cusco", "Bariloche"] });
  });

  it("descarta una respuesta que llega tarde cuando ya se cambió de consulta", async () => {
    const lenta = respuestaPendiente();
    const pedirA = jest.fn(() => lenta.promesa);
    const pedirB = jest.fn().mockResolvedValue("datos de B");

    const { result, rerender } = renderHook(({ consulta }) => useConsulta(consulta), {
      initialProps: { consulta: { clave: "destino:a", pedir: pedirA } },
    });
    rerender({ consulta: { clave: "destino:b", pedir: pedirB } });
    await waitFor(() => expect(result.current.datos).toBe("datos de B"));

    // La respuesta de A llega después: no debe reemplazar los datos de B
    await act(async () => lenta.resolver("datos de A"));
    expect(result.current.datos).toBe("datos de B");
  });
});
