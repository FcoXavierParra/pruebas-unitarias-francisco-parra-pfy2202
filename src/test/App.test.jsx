import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ApolloProvider } from "@apollo/client/react";
import AppRoutes from "../routes/AppRoutes";
import { clienteGraphQL } from "../api/graphql/apolloClient";
import { cambiarEscenario } from "../mocks/simulacion";

// Pruebas de navegación completa: REST para el listado y la ficha, GraphQL para vuelos y hoteles
function renderizar(ruta = "/") {
  return render(
    <ApolloProvider client={clienteGraphQL}>
      <MemoryRouter initialEntries={[ruta]}>
        <AppRoutes />
      </MemoryRouter>
    </ApolloProvider>
  );
}

describe("Listado de destinos (REST)", () => {
  it("muestra los destinos con su país y actividades", async () => {
    renderizar("/");
    expect(await screen.findByRole("heading", { name: "Cusco" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Puerto Natales" })).toBeInTheDocument();
    expect(screen.getByText("Torres del Paine")).toBeInTheDocument();
  });

  it("filtra por país y el filtro queda en la URL", async () => {
    renderizar("/");
    await screen.findByRole("heading", { name: "Cusco" });

    await userEvent.selectOptions(screen.getByLabelText("Filtrar por país"), "Chile");

    expect(screen.getByRole("heading", { name: "Puerto Natales" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Cusco" })).not.toBeInTheDocument();
    expect(screen.getByText(/Mostrando 1 de/)).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el servidor falla y ofrece reintentar", async () => {
    cambiarEscenario("error500");
    renderizar("/");
    expect(await screen.findByRole("alert")).toHaveTextContent("El servidor no está disponible");
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});

describe("Página de un destino (REST + GraphQL)", () => {
  it("muestra la ficha y, con GraphQL, los vuelos y hoteles", async () => {
    renderizar("/destinos/cusco");

    expect(await screen.findByRole("heading", { level: 2, name: "Cusco" })).toBeInTheDocument();
    const vuelos = await screen.findByRole("region", { name: /Vuelos/ });
    expect(within(vuelos).getByText("Aerolínea Andina")).toBeInTheDocument();
    const hoteles = screen.getByRole("region", { name: /Hoteles/ });
    expect(within(hoteles).getByText("Hotel Plaza Imperial")).toBeInTheDocument();
  });

  it("'Solo opciones disponibles' quita vuelos y hoteles agotados", async () => {
    renderizar("/destinos/cusco");
    await screen.findByText("Cóndor Sur");

    await userEvent.click(screen.getByLabelText("Solo opciones disponibles"));

    await waitFor(() => expect(screen.queryByText("Cóndor Sur")).not.toBeInTheDocument());
    expect(screen.queryByText("Casa Andina Boutique")).not.toBeInTheDocument();
    expect(screen.getByText("Aerolínea Andina")).toBeInTheDocument();
  });

  it("ordenar por precio de mayor a menor invierte el orden de los vuelos", async () => {
    renderizar("/destinos/cusco");
    await screen.findByText("Cóndor Sur");
    const primerVuelo = () =>
      within(screen.getByRole("region", { name: /Vuelos/ })).getAllByRole("article")[0].querySelector("h4")
        ?.textContent;

    // Por defecto: menor precio primero (Cóndor Sur, CLP 241.990)
    expect(primerVuelo()).toBe("Cóndor Sur");

    await userEvent.selectOptions(screen.getByLabelText("Ordenar"), "precio-desc");

    // Mayor precio primero (Aerolínea Andina, CLP 289.990)
    expect(primerVuelo()).toBe("Aerolínea Andina");
  });

  it("un destino inexistente muestra que no se encontró y no consulta vuelos", async () => {
    renderizar("/destinos/atlantida");
    expect(await screen.findByRole("alert")).toHaveTextContent("No encontramos lo que buscas");
    expect(screen.queryByRole("region", { name: /Vuelos/ })).not.toBeInTheDocument();
  });

  it("sin conexión muestra el error de red con reintentar", async () => {
    cambiarEscenario("sinConexion");
    renderizar("/destinos/kioto");
    expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión con el servidor");
  });
});

describe("Navegación", () => {
  it("una ruta que no existe muestra la página 404", async () => {
    renderizar("/ruta-que-no-existe");
    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });

  it("desde el listado se abre un destino y el enlace de regreso vuelve al listado", async () => {
    renderizar("/");
    await userEvent.click(await screen.findByRole("link", { name: /Lisboa/ }));

    expect(await screen.findByRole("heading", { level: 2, name: "Lisboa" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: /Todos los destinos/ }));
    expect(await screen.findByRole("heading", { name: "Kioto" })).toBeInTheDocument();
  });
});
