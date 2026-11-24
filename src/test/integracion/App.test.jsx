import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ApolloProvider } from "@apollo/client/react";
import App from "../../App";
import { clienteGraphQL } from "../../api/graphql/apolloClient";

// Prueba del componente raíz con sus proveedores reales: Apollo (GraphQL) y React Router.
// Los datos llegan desde los handlers de MSW, igual que en el sitio publicado.
describe("App", () => {
  it("monta la aplicación completa y muestra los destinos desde la API REST", async () => {
    render(
      <ApolloProvider client={clienteGraphQL}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </ApolloProvider>
    );

    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Cusco" })).toBeInTheDocument();
  });
});
