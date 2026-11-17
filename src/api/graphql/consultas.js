import { gql } from "@apollo/client";

// Consulta GraphQL de vuelos y hoteles de un destino. El nombre de la operación (DestinoOpciones)
// es el que usa el handler de MSW en src/mocks/graphql.js.
// El contrato completo está en schema.graphql.
export const DESTINO_OPCIONES = gql`
  query DestinoOpciones($destinoId: ID!, $soloDisponibles: Boolean) {
    opcionesDestino(destinoId: $destinoId, soloDisponibles: $soloDisponibles) {
      destinoId
      vuelos {
        id
        aerolinea
        origen
        salida
        llegada
        precio
        moneda
        asientosDisponibles
      }
      hoteles {
        id
        nombre
        estrellas
        precioNoche
        moneda
        checkIn
        checkOut
        habitacionesDisponibles
      }
    }
  }
`;
