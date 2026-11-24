import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { traducirErrorGraphQL } from "../../api/graphql/errores";
import { ErrorApi } from "../../api/cliente";

// Pruebas unitarias de la traducción de errores de Apollo al ErrorApi común (REST y GraphQL)
describe("traducirErrorGraphQL", () => {
  it("deja pasar un ErrorApi sin modificarlo", () => {
    const original = new ErrorApi("tiempo", "Tardó demasiado");
    expect(traducirErrorGraphQL(original)).toBe(original);
  });

  it("un error GraphQL con código NOT_FOUND se traduce a 'no-encontrado' con el mensaje del servidor", () => {
    const error = new CombinedGraphQLErrors({
      errors: [{ message: 'No existe el destino "atlantida"', extensions: { code: "NOT_FOUND" } }],
    });
    expect(traducirErrorGraphQL(error)).toMatchObject({
      tipo: "no-encontrado",
      message: 'No existe el destino "atlantida"',
      reintentable: false,
    });
  });

  it("un error GraphQL sin código conocido se traduce a 'desconocido'", () => {
    const error = new CombinedGraphQLErrors({ errors: [{ message: "Variable inválida" }] });
    expect(traducirErrorGraphQL(error)).toMatchObject({ tipo: "desconocido", message: "Variable inválida" });
  });

  it("un error GraphQL sin mensaje usa un texto por defecto", () => {
    const error = new CombinedGraphQLErrors({ errors: [] });
    expect(traducirErrorGraphQL(error).message).toBe("La consulta no pudo completarse.");
  });

  test.each([
    [500, "servidor", true],
    [503, "servidor", true],
    [400, "desconocido", false],
  ])("una respuesta HTTP %i se traduce a '%s'", (estado, tipo, reintentable) => {
    const error = new ServerError("Falla", { response: new Response("", { status: estado }), bodyText: "" });
    expect(traducirErrorGraphQL(error)).toMatchObject({ tipo, estado, reintentable });
  });

  it("cualquier otra falla se trata como falta de conexión", () => {
    expect(traducirErrorGraphQL(new TypeError("Failed to fetch"))).toMatchObject({
      tipo: "red",
      message: "No hay conexión con el servidor.",
    });
  });
});
