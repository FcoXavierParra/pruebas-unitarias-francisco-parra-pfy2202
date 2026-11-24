// Agrega a Jest los comparadores de Testing Library (toBeInTheDocument, toBeDisabled, etc.)
import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { handlers } from "../mocks/handlers";
import { cambiarEscenario, demoras } from "../mocks/simulacion";
import { ajustes } from "../api/cliente";
import { reiniciarCache } from "../api/cache";
import { configure } from "@testing-library/react";

// Las páginas se cargan de forma diferida (React.lazy) y el primer arranque de pruebas puede ser lento:
// se da más tiempo a los findBy* que el valor por defecto de 1 s
configure({ asyncUtilTimeout: 4000 });

// Las pruebas usan los mismos handlers que el sitio (REST y GraphQL), ejecutados en Node en vez del Service Worker
export const servidor = setupServer(...handlers);

// Tiempos cortos para que las pruebas no esperen segundos reales
demoras.normal = 5;
demoras.lento = 50;
ajustes.pausaBase = 5;

beforeAll(() => {
  servidor.listen({ onUnhandledRequest: "error" });

  // Solo para pruebas: jsdom reemplaza AbortController por una clase que fetch de Node no acepta
  // (Apollo la usa para cancelar peticiones). Se descarta la señal; el tiempo máximo lo controla el cliente.
  // Va después de listen(), porque MSW reemplaza fetch al activarse.
  const fetchMsw = globalThis.fetch;
  globalThis.fetch = (entrada, opciones) => {
    if (!opciones?.signal) return fetchMsw(entrada, opciones);
    const { signal: _descartada, ...resto } = opciones;
    return fetchMsw(entrada, resto);
  };
});
beforeEach(async () => {
  cambiarEscenario("normal");
  reiniciarCache();
  localStorage.clear();
  sessionStorage.clear();
  // El cliente Apollo se importa aquí (y no arriba) para que lea los tiempos cortos ya ajustados
  const { clienteGraphQL } = await import("../api/graphql/apolloClient");
  await clienteGraphQL.clearStore();
});
afterEach(() => servidor.resetHandlers());
afterAll(() => servidor.close());
