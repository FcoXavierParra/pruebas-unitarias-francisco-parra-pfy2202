import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MensajeError, { AvisoDatosGuardados, IndicadorActualizando, resumenError } from "../../components/MensajeError";
import { ErrorApi } from "../../api/cliente";

// Pruebas unitarias de los mensajes de error: cada tipo de falla debe explicar qué pasó y qué hacer
describe("MensajeError", () => {
  test.each([
    ["red", "Sin conexión con el servidor", /Revisa tu conexión/],
    ["servidor", "El servidor no está disponible", /Lo intentamos 3 veces/],
    ["tiempo", "El servidor está tardando demasiado", /no llegó a tiempo/],
  ])("un error de tipo '%s' muestra su título, su explicación y el botón Reintentar", (tipo, titulo, detalle) => {
    render(<MensajeError error={new ErrorApi(tipo, "mensaje técnico")} onReintentar={jest.fn()} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: titulo })).toBeInTheDocument();
    expect(screen.getByText(detalle)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("al presionar Reintentar llama a la función recibida", async () => {
    const onReintentar = jest.fn();
    render(<MensajeError error={new ErrorApi("servidor", "")} onReintentar={onReintentar} />);

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  it("'no encontrado' muestra el mensaje del servidor y no ofrece reintentar", () => {
    render(<MensajeError error={new ErrorApi("no-encontrado", 'No existe el destino "atlantida"')} />);

    expect(screen.getByRole("heading", { name: "No encontramos lo que buscas" })).toBeInTheDocument();
    expect(screen.getByText('No existe el destino "atlantida"')).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
  });

  it("un tipo desconocido usa un título genérico y el mensaje del error", () => {
    render(<MensajeError error={{ tipo: "otro", message: "Algo raro pasó" }} onReintentar={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "No pudimos completar la solicitud" })).toBeInTheDocument();
    expect(screen.getByText("Algo raro pasó")).toBeInTheDocument();
  });

  it("muestra las salidas alternativas que recibe como hijos", () => {
    render(
      <MensajeError error={new ErrorApi("red", "")} onReintentar={jest.fn()}>
        <a href="/">Ver todos los destinos</a>
      </MensajeError>
    );
    expect(screen.getByRole("link", { name: "Ver todos los destinos" })).toBeInTheDocument();
  });
});

describe("AvisoDatosGuardados e IndicadorActualizando", () => {
  it("avisa que los datos pueden estar desactualizados y permite reintentar", async () => {
    const onReintentar = jest.fn();
    render(<AvisoDatosGuardados error={new ErrorApi("red", "")} onReintentar={onReintentar} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Sin conexión con el servidor.");
    expect(screen.getByRole("alert")).toHaveTextContent("última información guardada");
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onReintentar).toHaveBeenCalled();
  });

  it("el indicador de actualización se anuncia como estado", () => {
    render(<IndicadorActualizando />);
    expect(screen.getByRole("status")).toHaveTextContent("Actualizando...");
  });

  it("resumenError usa un título genérico para tipos desconocidos", () => {
    expect(resumenError({ tipo: "inventado" })).toBe("No pudimos completar la solicitud");
    expect(resumenError({ tipo: "servidor" })).toBe("El servidor no está disponible");
  });
});
