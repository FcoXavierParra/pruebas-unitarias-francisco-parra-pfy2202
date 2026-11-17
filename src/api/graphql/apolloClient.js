import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { HttpLink } from "@apollo/client/link/http";
import { RetryLink } from "@apollo/client/link/retry";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { ErrorApi, ajustes, REINTENTOS } from "../cliente";

// Cliente Apollo para la API GraphQL. Mismas reglas que el cliente REST:
// - tiempo máximo por petición (ajustes.tiempoMaximo),
// - reintentos automáticos solo ante fallas temporales (red, tiempo o 5xx), nunca ante errores GraphQL.

// fetch con tiempo máximo, con la misma técnica que el cliente REST (carrera entre la respuesta y un límite).
// No usa AbortController: en pruebas con jsdom su señal no es aceptada por fetch de Node.
function fetchConTiempoMaximo(url, opciones) {
  let temporizador;
  const limite = new Promise((_, rechazar) => {
    temporizador = setTimeout(
      () => rechazar(new ErrorApi("tiempo", "El servidor tardó demasiado en responder.")),
      ajustes.tiempoMaximo
    );
  });
  return Promise.race([fetch(url, opciones), limite]).finally(() => clearTimeout(temporizador));
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
