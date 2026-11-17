import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { ErrorApi } from "../cliente";

// Traduce cualquier error de Apollo al mismo ErrorApi que usa el cliente REST.
// Así MensajeError muestra mensajes iguales para ambas APIs.
export function traducirErrorGraphQL(error) {
  if (error instanceof ErrorApi) return error;

  // La API respondió, pero con errores GraphQL (HTTP 200 con "errors")
  if (CombinedGraphQLErrors.is(error)) {
    const mensaje = error.errors[0]?.message ?? "La consulta no pudo completarse.";
    const noEncontrado = error.errors.some((e) => e.extensions?.code === "NOT_FOUND");
    return new ErrorApi(noEncontrado ? "no-encontrado" : "desconocido", mensaje);
  }

  // El servidor respondió con un código HTTP de error (sin cuerpo GraphQL)
  if (error instanceof ServerError) {
    const tipo = error.statusCode >= 500 ? "servidor" : "desconocido";
    return new ErrorApi(tipo, "El servidor tuvo un problema al procesar la solicitud.", error.statusCode);
  }

  // Cualquier otra falla (sin respuesta del servidor) se trata como falta de conexión
  return new ErrorApi("red", "No hay conexión con el servidor.");
}
