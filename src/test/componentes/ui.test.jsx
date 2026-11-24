import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Boton from "../../components/ui/Boton";
import Aviso from "../../components/ui/Aviso";

// Pruebas unitarias de los componentes base de interfaz
describe("Boton", () => {
  it("sin 'to' es un botón que no envía formularios y ejecuta onClick", async () => {
    const onClick = jest.fn();
    render(<Boton onClick={onClick}>Guardar</Boton>);

    const boton = screen.getByRole("button", { name: "Guardar" });
    expect(boton).toHaveAttribute("type", "button");
    expect(boton).toHaveClass("btn-primario");
    await userEvent.click(boton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("con 'to' es un enlace de React Router con la variante elegida", () => {
    render(
      <MemoryRouter>
        <Boton to="/destinos/cusco" variante="secundario" className="w-full">
          Ver destino
        </Boton>
      </MemoryRouter>
    );

    const enlace = screen.getByRole("link", { name: "Ver destino" });
    expect(enlace).toHaveAttribute("href", "/destinos/cusco");
    expect(enlace).toHaveClass("btn-secundario", "w-full");
  });
});

describe("Aviso", () => {
  it("muestra el contenido y, si recibe onCerrar, un botón para cerrarlo", async () => {
    const onCerrar = jest.fn();
    render(<Aviso onCerrar={onCerrar}>Destino guardado</Aviso>);

    expect(screen.getByRole("status")).toHaveTextContent("Destino guardado");
    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it("sin onCerrar no muestra el botón", () => {
    render(<Aviso>Solo informativo</Aviso>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
