import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { HttpLink } from "@apollo/client/link/http";
import { RetryLink } from "@apollo/client/link/retry";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { ajustes, conTiempoMaximo, REINTENTOS } from "../cliente";

// Cliente Apollo para la API GraphQL. Mismas reglas que el cliente REST:
// - tiempo máximo por petición (ajustes.tiempoMaximo),
// - reintentos automáticos solo ante fallas temporales (red, tiempo o 5xx), nunca ante errores GraphQL.

// fetch con tiempo máximo y cancelación real, con la misma función que el cliente REST.
// Si Apollo cancela la consulta (por ejemplo, al desmontar la página), la petición también se cancela.
function fetchConTiempoMaximo(url, opciones = {}) {
  const controlador = new AbortController();
  opciones.signal?.addEventListener("abort", () => controlador.abort());
  return conTiempoMaximo(
    fetch(url, { ...opciones, signal: controlador.signal }),
    ajustes.tiempoMaximo,
    controlador
  );
}

// Un error GraphQL (CombinedGraphQLErrors) no se reintenta: repetir la misma consulta daría el mismo resultado.
// Un 5xx, una falla de red o un tiempo agotado sí pueden ser pasajeros.
const esReintentable = (error) => {
  if (CombinedGraphQLErrors.is(error)) return false;
  if (error instanceof ServerError) return error.statusCode >= 500;
  return true;
};

// Espera creciente entre intentos: pausaBase y luego el doble (0,5 s y 1 s, igual que el cliente REST)
const reintentos = new RetryLink({
  attempts: { max: REINTENTOS + 1, retryIf: esReintentable },
  delay: { initial: ajustes.pausaBase, max: ajustes.pausaBase * 2, jitter: false },
});

// URL absoluta: fetch fuera del navegador (pruebas en Node) no acepta rutas relativas
const enlaceHttp = new HttpLink({
  uri: new URL("/graphql", window.location.origin).toString(),
  fetch: fetchConTiempoMaximo,
});

export const clienteGraphQL = new ApolloClient({
  link: ApolloLink.from([reintentos, enlaceHttp]),
  cache: new InMemoryCache(),
});
