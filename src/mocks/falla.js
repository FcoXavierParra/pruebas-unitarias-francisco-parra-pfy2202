import { HttpResponse, delay } from "msw";
import { demoras, fallaInestable, obtenerEscenario } from "./simulacion";

// Lógica de escenarios compartida por los handlers REST y GraphQL.
// Aplica el escenario elegido en el panel de pruebas. Devuelve una respuesta de error o null.
export async function simularEscenario() {
  const escenario = obtenerEscenario();
  await delay(escenario === "lento" ? demoras.lento : demoras.normal);

  if (escenario === "sinConexion") return HttpResponse.error();
  if (escenario === "error500" || (escenario === "inestable" && fallaInestable())) {
    return HttpResponse.json({ mensaje: "Error interno del servidor" }, { status: 500 });
  }
  return null;
}
