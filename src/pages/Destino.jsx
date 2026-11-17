import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@apollo/client/react";
import { consultasDestinos } from "../api/rest/destinos";
import { DESTINO_OPCIONES } from "../api/graphql/consultas";
import { traducirErrorGraphQL } from "../api/graphql/errores";
import { useConsulta } from "../hooks/useConsulta";
import EstadoCarga from "../components/EstadoCarga";
import MensajeError, { AvisoDatosGuardados, IndicadorActualizando } from "../components/MensajeError";
import TarjetaVuelo from "../components/TarjetaVuelo";
import TarjetaHotel from "../components/TarjetaHotel";
import Boton from "../components/ui/Boton";

// Página de un destino. La ficha (país, actividades) viene por REST;
// vuelos y hoteles vienen por GraphQL con una sola consulta (DestinoOpciones).
const ORDENES = {
  "precio-asc": { etiqueta: "Precio: menor a mayor", sentido: 1 },
  "precio-desc": { etiqueta: "Precio: mayor a menor", sentido: -1 },
};

const ordenarPorPrecio = (lista, campo, sentido) => [...lista].sort((a, b) => (a[campo] - b[campo]) * sentido);

function Destino() {
  const { id } = useParams();
  const ficha = useConsulta(consultasDestinos.detalle(id));
  const noExiste = ficha.error?.tipo === "no-encontrado";

  // Filtros de la página: viven en estado local (useState) y cambian la consulta o el orden
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [orden, setOrden] = useState("precio-asc");

  // Al cambiar de destino, los filtros vuelven a sus valores iniciales
  useEffect(() => {
    setSoloDisponibles(false);
    setOrden("precio-asc");
  }, [id]);

  // El título de la pestaña muestra el destino cargado; al salir de la página se restaura el anterior
  useEffect(() => {
    if (!ficha.datos) return undefined;
    const anterior = document.title;
    document.title = `${ficha.datos.nombre} · Viajes Rumbo Sur`;
    return () => {
      document.title = anterior;
    };
  }, [ficha.datos]);

  // Vuelos y hoteles. Con soloDisponibles cambian las variables y Apollo pide la consulta de nuevo.
  // previousData mantiene lo ya visible mientras llega la respuesta nueva.
  const { data, previousData, loading, error: errorGraphQL, refetch } = useQuery(DESTINO_OPCIONES, {
    variables: { destinoId: id, soloDisponibles },
    skip: noExiste,
  });
  const opciones = (data ?? previousData)?.opcionesDestino;
  const sentido = ORDENES[orden].sentido;

  if (ficha.cargando) return <EstadoCarga texto="Cargando destino..." intento={ficha.intento} />;

  // Sin ficha no hay nada que mostrar: se explica la falla (destino inexistente, servidor, red)
  if (!ficha.datos) {
    return (
      <MensajeError error={ficha.error} onReintentar={ficha.reintentar}>
        <Boton variante="secundario" to="/">
          Ver todos los destinos
        </Boton>
      </MensajeError>
    );
  }

  const destino = ficha.datos;

  return (
    <article>
      <Link to="/" className="mb-4 inline-block text-sm text-marca underline">
        ← Todos los destinos
      </Link>

      {ficha.error && <AvisoDatosGuardados error={ficha.error} onReintentar={ficha.reintentar} />}

      <header className="tarjeta mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-marca">{destino.pais}</p>
        <h2 className="titulo-pagina mb-2">{destino.nombre}</h2>
        <p className="mb-4 text-gray-600">{destino.descripcion}</p>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Actividades populares</h3>
        <ul className="flex flex-wrap gap-1.5">
          {destino.actividades.map((actividad) => (
            <li key={actividad} className="rounded-full bg-marca-claro px-2.5 py-1 text-sm text-marca-oscuro">
              {actividad}
            </li>
          ))}
        </ul>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-marca"
            checked={soloDisponibles}
            onChange={(e) => setSoloDisponibles(e.target.checked)}
          />
          Solo opciones disponibles
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="orden-precio" className="text-sm text-gray-700">
            Ordenar
          </label>
          <select id="orden-precio" className="campo w-auto" value={orden} onChange={(e) => setOrden(e.target.value)}>
            {Object.entries(ORDENES).map(([valor, { etiqueta }]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && !opciones && <EstadoCarga texto="Cargando vuelos y hoteles..." />}

      {errorGraphQL && !opciones && (
        <MensajeError error={traducirErrorGraphQL(errorGraphQL)} onReintentar={() => refetch()} />
      )}

      {opciones && (
        <>
          {loading && (
            <div className="mb-3 flex h-5 justify-end">
              <IndicadorActualizando />
            </div>
          )}

          <section aria-labelledby="titulo-vuelos" className="mb-8">
            <h3 id="titulo-vuelos" className="mb-3 text-lg font-semibold text-gray-900">
              Vuelos ({opciones.vuelos.length})
            </h3>
            {opciones.vuelos.length === 0 ? (
              <p className="tarjeta text-center text-gray-500">No hay vuelos disponibles con este filtro.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {ordenarPorPrecio(opciones.vuelos, "precio", sentido).map((vuelo) => (
                  <TarjetaVuelo key={vuelo.id} vuelo={vuelo} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="titulo-hoteles">
            <h3 id="titulo-hoteles" className="mb-3 text-lg font-semibold text-gray-900">
              Hoteles ({opciones.hoteles.length})
            </h3>
            {opciones.hoteles.length === 0 ? (
              <p className="tarjeta text-center text-gray-500">No hay hoteles disponibles con este filtro.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {ordenarPorPrecio(opciones.hoteles, "precioNoche", sentido).map((hotel) => (
                  <TarjetaHotel key={hotel.id} hotel={hotel} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </article>
  );
}

export default Destino;
