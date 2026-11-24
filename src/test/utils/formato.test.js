import { formatoFecha, formatoFechaHora, formatoPrecio, noches } from "../../utils/formato";

// Pruebas unitarias de funciones puras: misma entrada, misma salida, sin dependencias externas
describe("formatoPrecio", () => {
  test.each([
    [289990, "$289.990"],
    [1000000, "$1.000.000"],
    [0, "$0"],
  ])("formatea %i como %s", (monto, esperado) => {
    expect(formatoPrecio(monto)).toBe(esperado);
  });
});

describe("noches", () => {
  test.each([
    ["2027-01-10", "2027-01-15", 5],
    ["2027-02-27", "2027-03-02", 3], // cruza fin de mes
    ["2027-01-10", "2027-01-10", 0],
  ])("de %s a %s son %i noches", (desde, hasta, esperado) => {
    expect(noches(desde, hasta)).toBe(esperado);
  });
});

describe("fechas", () => {
  // El estilo exacto ("15-01-2027" o "15 ene 2027") depende del motor de fechas; se verifica el contenido
  it("formatoFecha muestra día, mes y año", () => {
    expect(formatoFecha("2027-01-15")).toMatch(/15.*(01|ene).*2027/);
  });

  it("formatoFecha no se corre un día por la zona horaria", () => {
    // "2027-03-01" leído como UTC podría mostrarse como 28 de febrero en Chile
    expect(formatoFecha("2027-03-01")).toMatch(/^1\b|^01\b/);
  });

  it("formatoFechaHora incluye la hora", () => {
    expect(formatoFechaHora("2027-01-15T08:30:00")).toMatch(/15.*(01|ene).*2027.*8:30/);
  });
});
