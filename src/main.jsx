import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ApolloProvider } from "@apollo/client/react";
import App from "./App";
import PantallaFalloMock from "./components/PantallaFalloMock";
import { clienteGraphQL } from "./api/graphql/apolloClient";
import "./index.css";

// Activa el backend simulado (MSW, REST y GraphQL) antes de mostrar la aplicación, para que ninguna
// petición a /api o /graphql salga antes de que el Service Worker esté listo para responderla.
// Se activa también en producción: el sitio publicado en GitHub Pages no tiene un backend real.
async function activarMock() {
  const { worker } = await import("./mocks/browser");
  const base = import.meta.env.BASE_URL; // "/" en local, "/<repositorio>/" en GitHub Pages
  return worker.start({
    serviceWorker: { url: `${base}mockServiceWorker.js`, options: { scope: base } },
    onUnhandledRequest: "bypass", // archivos del sitio (JS, CSS) pasan sin interceptar
    quiet: import.meta.env.PROD,
  });
}

const raiz = ReactDOM.createRoot(document.getElementById("root"));

activarMock()
  .then(() => {
    raiz.render(
      <React.StrictMode>
        <ApolloProvider client={clienteGraphQL}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </ApolloProvider>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    // Si el mock no arranca, se muestra un mensaje de recuperación en vez de una pantalla en blanco
    console.error("No se pudo activar el simulador de datos:", error);
    raiz.render(<PantallaFalloMock error={error} onReintentar={() => window.location.reload()} />);
  });
