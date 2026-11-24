import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import TarjetaDestino from "../../components/TarjetaDestino";
import TarjetaVuelo from "../../components/TarjetaVuelo";
import TarjetaHotel from "../../components/TarjetaHotel";

// Pruebas unitarias de las tarjetas: reciben datos por props y deben mostrarlos sin errores

const destino = {
  id: "cusco",
  nombre: "Cusco",
  pais: "Perú",
  descripcion: "Antigua capital inca.",
  actividades: ["Valle Sagrado", "Machu Picchu"],
};

const vuelo = {
  id: "v1",
  aerolinea: "LATAM",
  origen: "Santiago (SCL)",
  salida: "2027-01-15T08:30:00",
  llegada: "2027-01-15T11:45:00",
  precio: 289990,
  asientosDisponibles: 12,
};

const hotel = {
  id: "h1",
  nombre: "Hotel Plaza",
  estrellas: 4,
  precioNoche: 79990,
  checkIn: "2027-01-15",
  checkOut: "2027-01-19",
  habitacionesDisponibles: 3,
};

describe("TarjetaDestino", () => {
  const renderizar = () =>
    render(
      <MemoryRouter>
        <TarjetaDestino destino={destino} />
      </MemoryRouter>
    );

  it("enlaza a la página del destino y muestra país y actividades", () => {
    renderizar();

    const enlace = screen.getByRole("link");
    expect(enlace).toHaveAttribute("href", "/destinos/cusco");
    expect(within(enlace).getByRole("heading", { name: "Cusco" })).toBeInTheDocument();
    expect(screen.getByText("Perú")).toBeInTheDocument();
    const actividades = screen.getByRole("list", { name: "Actividades populares en Cusco" });
    expect(within(actividades).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Valle Sagrado",
      "Machu Picchu",
    ]);
  });

  it("mantiene la misma estructura (snapshot)", () => {
    const { container } = renderizar();
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("TarjetaVuelo", () => {
  it("muestra aerolínea, origen, precio y asientos disponibles", () => {
    render(<TarjetaVuelo vuelo={vuelo} />);

    expect(screen.getByRole("article", { name: "LATAM" })).toBeInTheDocument();
    expect(screen.getByText("Desde Santiago (SCL)")).toBeInTheDocument();
    expect(screen.getByText("$289.990")).toBeInTheDocument();
    expect(screen.getByText("12 asientos disponibles")).toBeInTheDocument();
  });

  it("sin asientos se muestra como agotado", () => {
    render(<TarjetaVuelo vuelo={{ ...vuelo, asientosDisponibles: 0 }} />);

    expect(screen.getByText("Sin asientos disponibles")).toHaveClass("text-red-700");
    expect(screen.getByRole("article")).toHaveClass("opacity-60");
  });
});

describe("TarjetaHotel", () => {
  it("muestra estrellas, noches de estadía, precio por noche y habitaciones", () => {
    render(<TarjetaHotel hotel={hotel} />);

    expect(screen.getByRole("article", { name: "Hotel Plaza" })).toBeInTheDocument();
    expect(screen.getByLabelText("4 estrellas")).toHaveTextContent("★★★★");
    expect(screen.getByText(/4 noches/)).toBeInTheDocument();
    expect(screen.getByText("$79.990")).toBeInTheDocument();
    expect(screen.getByText("3 habitaciones disponibles")).toBeInTheDocument();
  });

  it("sin habitaciones se muestra como agotado", () => {
    render(<TarjetaHotel hotel={{ ...hotel, habitacionesDisponibles: 0 }} />);
    expect(screen.getByText("Sin habitaciones en estas fechas")).toHaveClass("text-red-700");
  });
});
