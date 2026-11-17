import React from "react";
import { formatoFecha, formatoPrecio, noches } from "../utils/formato";

// Hotel dentro de la página de destino (datos de GraphQL). Sin habitaciones, se muestra como agotado.
function TarjetaHotel({ hotel }) {
  const agotado = hotel.habitacionesDisponibles === 0;
  const cantidadNoches = noches(hotel.checkIn, hotel.checkOut);

  return (
    <article className={`tarjeta flex flex-col gap-2 ${agotado ? "opacity-60" : ""}`} aria-labelledby={`hotel-${hotel.id}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 id={`hotel-${hotel.id}`} className="font-semibold text-gray-900">
          {hotel.nombre}
        </h4>
        <span className="text-right text-sm text-amber-600" aria-label={`${hotel.estrellas} estrellas`}>
          {"★".repeat(hotel.estrellas)}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        {formatoFecha(hotel.checkIn)} → {formatoFecha(hotel.checkOut)} · {cantidadNoches} noches
      </p>
      <p className="font-bold text-marca">
        {formatoPrecio(hotel.precioNoche)} <span className="text-sm font-normal text-gray-500">por noche</span>
      </p>
      <p className={`text-sm font-medium ${agotado ? "text-red-700" : "text-marca-oscuro"}`}>
        {agotado ? "Sin habitaciones en estas fechas" : `${hotel.habitacionesDisponibles} habitaciones disponibles`}
      </p>
    </article>
  );
}

export default TarjetaHotel;
