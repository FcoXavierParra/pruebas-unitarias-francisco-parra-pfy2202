import React from "react";
import { formatoFechaHora, formatoPrecio } from "../utils/formato";

// Vuelo dentro de la página de destino (datos de GraphQL). Sin asientos, se muestra como agotado.
function TarjetaVuelo({ vuelo }) {
  const agotado = vuelo.asientosDisponibles === 0;

  return (
    <article className={`tarjeta flex flex-col gap-2 ${agotado ? "opacity-60" : ""}`} aria-labelledby={`vuelo-${vuelo.id}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 id={`vuelo-${vuelo.id}`} className="font-semibold text-gray-900">
          {vuelo.aerolinea}
        </h4>
        <span className="text-right font-bold text-marca">{formatoPrecio(vuelo.precio)}</span>
      </div>
      <p className="text-sm text-gray-600">Desde {vuelo.origen}</p>
      <dl className="grid grid-cols-2 gap-x-3 text-sm">
        <dt className="text-gray-500">Salida</dt>
        <dd>{formatoFechaHora(vuelo.salida)}</dd>
        <dt className="text-gray-500">Llegada</dt>
        <dd>{formatoFechaHora(vuelo.llegada)}</dd>
      </dl>
      <p className={`text-sm font-medium ${agotado ? "text-red-700" : "text-marca-oscuro"}`}>
        {agotado ? "Sin asientos disponibles" : `${vuelo.asientosDisponibles} asientos disponibles`}
      </p>
    </article>
  );
}

export default TarjetaVuelo;
