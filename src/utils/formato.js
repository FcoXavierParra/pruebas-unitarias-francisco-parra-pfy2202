// Formatea un monto en pesos chilenos: 289990 -> "$289.990"
export const formatoPrecio = (monto) => `$${monto.toLocaleString("es-CL")}`;

// "2027-01-15T08:30:00" -> fecha y hora en formato chileno, por ejemplo "15-01-2027, 8:30"
export const formatoFechaHora = (iso) =>
  new Date(iso).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });

// "2027-01-15" -> fecha en formato chileno, por ejemplo "15-01-2027".
// Se agrega la hora para que se lea en la zona local y no en UTC (si no, podría mostrarse el día anterior).
export const formatoFecha = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-CL", { dateStyle: "medium" });

// Diferencia en noches entre dos fechas ISO (YYYY-MM-DD)
export const noches = (desde, hasta) =>
  Math.round((new Date(`${hasta}T00:00:00`) - new Date(`${desde}T00:00:00`)) / 86400000);
