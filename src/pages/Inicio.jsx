import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { consultasDestinos } from "../api/rest/destinos";
import { useConsulta } from "../hooks/useConsulta";
import EstadoCarga from "../components/EstadoCarga";
import MensajeError, { AvisoDatosGuardados, IndicadorActualizando } from "../components/MensajeError";
import TarjetaDestino from "../components/TarjetaDestino";
import Boton from "../components/ui/Boton";

// Página de inicio: destinos obtenidos desde GET /api/destinos (REST), con filtro por país
function Inicio() {
  const { datos: destinos, cargando, actualizando, intento, error, reintentar } = useConsulta(consultasDestinos.lista());

  // El filtro vive en la URL (?pais=Chile): se comparte y se conserva al volver desde un destino
  const [parametros, setParametros] = useSearchParams();
  const [pais, setPais] = useState(parametros.get("pais") ?? "");

  // Cada cambio de filtro se refleja en la URL. replace: no llena el historial del navegador
  useEffect(() => {
    setParametros(pais ? { pais } : {}, { replace: true });
  }, [pais]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lista de países construida a partir de los destinos recibidos, sin peticiones adicionales
  const paises = useMemo(
    () => [...new Set((destinos ?? []).map((d) => d.pais))].sort((a, b) => a.localeCompare(b, "es")),
    [destinos]
  );
  const visibles = (destinos ?? []).filter((d) => !pais || d.pais === pais);

  return (
    <section>
      <div className="mb-6">
        <h2 className="titulo-pagina mb-1">¿A dónde quieres viajar?</h2>
        <p className="text-gray-600">Elige un destino para ver sus vuelos y hoteles disponibles.</p>
      </div>

      {cargando && <EstadoCarga texto="Cargando destinos..." intento={intento} />}

      {!cargando && !destinos && error && <MensajeError error={error} onReintentar={reintentar} />}

      {destinos && (
        <>
          {error && <AvisoDatosGuardados error={error} onReintentar={reintentar} />}

          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="w-full sm:w-64">
              <label htmlFor="filtro-pais" className="mb-1 block text-sm font-medium text-gray-700">
                Filtrar por país
              </label>
              <select id="filtro-pais" className="campo" value={pais} onChange={(e) => setPais(e.target.value)}>
                <option value="">Todos los países</option>
                {paises.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex h-5 items-center">{actualizando && <IndicadorActualizando />}</div>
          </div>

          {visibles.length === 0 ? (
            <div className="tarjeta py-10 text-center">
              <p className="mb-4 text-gray-600">No hay destinos en {pais}.</p>
              <Boton variante="secundario" onClick={() => setPais("")}>
                Ver todos los destinos
              </Boton>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((destino) => (
                <TarjetaDestino key={destino.id} destino={destino} />
              ))}
            </div>
          )}
          <p className="mt-4 text-sm text-gray-500">
            Mostrando {visibles.length} de {destinos.length} destinos
          </p>
        </>
      )}
    </section>
  );
}

export default Inicio;
