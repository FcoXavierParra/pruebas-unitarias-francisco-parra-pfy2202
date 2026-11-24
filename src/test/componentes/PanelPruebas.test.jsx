import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PanelPruebas from "../../components/PanelPruebas";
import AvisoAlmacenamiento from "../../components/AvisoAlmacenamiento";
import { consultar, leerCache } from "../../api/cache";
import { obtenerEscenario } from "../../mocks/simulacion";

// Pruebas del panel de pruebas de la API: interacción del usuario + estado compartido con la caché y el simulador
describe("PanelPruebas", () => {
  const abrirPanel = () => userEvent.click(screen.getByRole("button", { name: /Panel de pruebas de la API/ }));

  it("empieza cerrado y se abre y cierra con su botón", async () => {
    render(<PanelPruebas />);
    const boton = screen.getByRole("button", { name: /Panel de pruebas de la API/ });
    expect(boton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("group")).not.toBeInTheDocument();

    await abrirPanel();
    expect(boton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "Respuesta del servidor simulado" })).toBeInTheDocument();

    await abrirPanel();
    expect(boton).toHaveAttribute("aria-expanded", "false");
  });

  it("elegir un escenario cambia la respuesta del simulador y lo indica en el encabezado", async () => {
    render(<PanelPruebas />);
    await abrirPanel();

    await userEvent.click(screen.getByRole("radio", { name: /Error del servidor/ }));

    expect(obtenerEscenario()).toBe("error500");
    expect(screen.getByRole("radio", { name: /Error del servidor/ })).toBeChecked();
    expect(screen.getByRole("button", { name: /Panel de pruebas de la API/ })).toHaveTextContent("Error del servidor");
  });

  it("los contadores se actualizan con las consultas a la API", async () => {
    render(<PanelPruebas />);
    await abrirPanel();

    await act(async () => {
      const pedir = () => Promise.resolve(["Cusco"]);
      await consultar("destinos", pedir); // va al servidor
      await consultar("destinos", pedir); // sale de la caché
    });

    const contador = (etiqueta) => screen.getByText(etiqueta).nextSibling.textContent;
    expect(contador("Al servidor")).toBe("1");
    expect(contador("Desde caché")).toBe("1");
    expect(contador("Compartidas")).toBe("0");
  });

  it("'Vaciar caché' borra las respuestas guardadas", async () => {
    await consultar("destinos", () => Promise.resolve(["Cusco"]));
    render(<PanelPruebas />);
    await abrirPanel();

    await userEvent.click(screen.getByRole("button", { name: "Vaciar caché" }));
    expect(leerCache("destinos")).toBeNull();
  });
});

describe("AvisoAlmacenamiento", () => {
  it("no se muestra cuando el navegador permite guardar datos", () => {
    const { container } = render(<AvisoAlmacenamiento />);
    expect(container).toBeEmptyDOMElement();
  });

  it("aparece cuando el navegador bloquea el almacenamiento", async () => {
    const bloqueo = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    try {
      render(<AvisoAlmacenamiento />);
      await act(() => consultar("destinos", () => Promise.resolve(["Cusco"])));
      expect(screen.getByRole("status")).toHaveTextContent("Tu navegador no permite guardar datos de este sitio.");
    } finally {
      bloqueo.mockRestore();
    }
  });
});
