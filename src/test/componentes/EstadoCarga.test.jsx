import { render, screen } from "@testing-library/react";
import EstadoCarga from "../../components/EstadoCarga";

// Pruebas unitarias del indicador de carga
describe("EstadoCarga", () => {
  it("anuncia la carga con el texto recibido", () => {
    render(<EstadoCarga texto="Cargando destinos..." />);

    const estado = screen.getByRole("status");
    expect(estado).toHaveAttribute("aria-busy", "true");
    expect(estado).toHaveTextContent("Cargando destinos...");
  });

  it("durante un reintento automático indica qué intento va", () => {
    render(<EstadoCarga texto="Cargando destinos..." intento={2} />);

    expect(screen.getByRole("status")).toHaveTextContent("Reintentando (intento 2 de 3)");
    expect(screen.queryByText("Cargando destinos...")).not.toBeInTheDocument();
  });

  test.each([
    [6, "tarjeta", "h-32"],
    [3, "lineas", "h-6"],
  ])("dibuja %i bloques de relleno con forma de %s", (bloques, forma, alto) => {
    const { container } = render(<EstadoCarga texto="Cargando..." bloques={bloques} forma={forma} />);

    const relleno = container.querySelectorAll(".animate-pulse");
    expect(relleno).toHaveLength(bloques);
    relleno.forEach((bloque) => expect(bloque).toHaveClass(alto));
  });
});
