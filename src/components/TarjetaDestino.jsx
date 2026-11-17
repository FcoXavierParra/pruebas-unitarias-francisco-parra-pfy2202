import React from "react";
import { Link } from "react-router";

// Destino dentro del listado: país y actividades populares (datos de REST)
function TarjetaDestino({ destino }) {
  return (
    <Link
      to={`/destinos/${destino.id}`}
      className="tarjeta flex flex-col gap-2 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-marca"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-marca">{destino.pais}</p>
      <h3 className="text-lg font-semibold text-gray-900">{destino.nombre}</h3>
      <p className="text-sm text-gray-600">{destino.descripcion}</p>
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label={`Actividades populares en ${destino.nombre}`}>
        {destino.actividades.map((actividad) => (
          <li key={actividad} className="rounded-full bg-marca-claro px-2.5 py-0.5 text-xs text-marca-oscuro">
            {actividad}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default TarjetaDestino;
